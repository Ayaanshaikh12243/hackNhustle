import json
import os
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv

load_dotenv()

def upload_vectors_to_qdrant(vectors_dir="vectors", collection_name="sign_vectors", batch_size=100):
    """Upload all vectors from JSON files to Qdrant"""
    
    # Connect to Qdrant
    qdrant_url = os.getenv('q_url', 'http://localhost:6333')
    qdrant_api_key = os.getenv('q_api', '')
    
    if 'cloud.qdrant.io' in qdrant_url and not qdrant_url.startswith('http'):
        qdrant_url = f"https://{qdrant_url}"
    
    client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key if qdrant_api_key else None
    )
    
    print(f"Connected to Qdrant: {qdrant_url}")
    
    # Load all vectors
    print("Loading vectors from JSON files...")
    vectors_path = Path(vectors_dir)
    all_vectors = []
    
    for json_file in vectors_path.rglob("*.json"):
        try:
            with open(json_file) as f:
                data = json.load(f)
                all_vectors.append({
                    "id": str(json_file),
                    "vector": data["vector"],
                    "label": data["label"],
                    "file": data.get("file", ""),
                    "augmentation": data.get("augmentation", "original"),
                    "frame": data.get("frame"),
                    "timestamp": data.get("timestamp")
                })
        except Exception as e:
            print(f"Error loading {json_file}: {e}")
    
    print(f"Loaded {len(all_vectors)} vectors")
    
    if not all_vectors:
        print("No vectors found!")
        return
    
    # Get vector dimension
    vector_dim = len(all_vectors[0]["vector"])
    print(f"Vector dimension: {vector_dim}D")
    
    # Create or recreate collection
    try:
        client.delete_collection(collection_name)
        print(f"Deleted existing collection: {collection_name}")
    except:
        pass
    
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_dim, distance=Distance.COSINE)
    )
    print(f"Created collection: {collection_name}")
    
    # Upload in batches
    print(f"Uploading vectors in batches of {batch_size}...")
    
    for i in range(0, len(all_vectors), batch_size):
        batch = all_vectors[i:i+batch_size]
        
        points = [
            PointStruct(
                id=idx + i,
                vector=vec["vector"],
                payload={
                    "label": vec["label"],
                    "file": vec["file"],
                    "augmentation": vec["augmentation"],
                    "frame": vec["frame"],
                    "timestamp": vec["timestamp"]
                }
            )
            for idx, vec in enumerate(batch)
        ]
        
        client.upsert(collection_name=collection_name, points=points)
        print(f"Uploaded {i+len(batch)}/{len(all_vectors)} vectors")
    
    print(f"\n✓ Successfully uploaded {len(all_vectors)} vectors to Qdrant!")
    print(f"Collection: {collection_name}")
    print(f"Dimension: {vector_dim}D")

if __name__ == "__main__":
    import sys
    
    vectors_dir = sys.argv[1] if len(sys.argv) > 1 else "vectors"
    collection_name = sys.argv[2] if len(sys.argv) > 2 else "sign_vectors"
    
    upload_vectors_to_qdrant(vectors_dir, collection_name)
