import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Flashcards() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState<string>('Loading...');
  const [currentImage, setCurrentImage] = useState<string>('https://via.placeholder.com/400x600?text=Loading...');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardCount, setCardCount] = useState(0);

  // List of available word folders from Frames_Word_Level
  const words = [
    'HELLO_HI', 'THANK', 'PLEASE', 'SORRY', 'WATER', 'FOOD', 'HELP', 'GOOD', 
    'HAPPY', 'FRIEND', 'LIKE', 'WANT', 'UNDERSTAND', 'WELCOME', 'FINE'
  ];

  useEffect(() => {
    loadRandomCard();
  }, []);

  const loadRandomCard = async () => {
    try {
      const response = await axios.get('http://localhost:5002/flashcards/random');
      setCurrentWord(response.data.word);
      setCurrentImage(response.data.image_path);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error loading flashcard:', error);
      setCurrentWord('Error');
      setCurrentImage('https://via.placeholder.com/400x600?text=Error+Loading');
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (cardCount >= 9) {
      navigate('/');
    } else {
      setCardCount(cardCount + 1);
      loadRandomCard();
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark">
      <header className="flex items-center px-6 py-4 justify-between pt-8 sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-primary dark:text-white">arrow_back</span>
        </button>
        <h2 className="text-primary dark:text-white text-2xl font-extrabold tracking-tight">Flashcards</h2>
        <div className="flex items-center justify-center rounded-full h-10 px-4 bg-white dark:bg-primary/20 shadow-soft gap-2 border border-primary/10">
          <span className="text-primary dark:text-white text-sm font-bold">{cardCount + 1}/10</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24 w-full">
        <div className="w-full text-center mb-6">
          <h3 className="text-slate-900 dark:text-white text-2xl font-extrabold">What sign is this?</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Click the card to reveal the answer</p>
        </div>

        <div 
          className="relative w-full max-w-sm aspect-[3/4] cursor-pointer perspective-1000"
          onClick={handleCardClick}
        >
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front of card - Image */}
            <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
            {currentImage && (
              <img 
                src={currentImage} 
                alt="ISL Sign" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found';
                }}
              />
            )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Tap to reveal
              </div>
            </div>

            {/* Back of card - Word */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center border-4 border-white dark:border-slate-700">
              <span className="material-symbols-outlined text-white text-8xl mb-4">sign_language</span>
              <h2 className="text-white text-5xl font-extrabold capitalize text-center px-6">{currentWord}</h2>
              <p className="text-white/80 text-sm mt-4">Tap to flip back</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleNext}
          className="mt-8 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>{cardCount < 9 ? 'Next Card' : 'Complete'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </main>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
