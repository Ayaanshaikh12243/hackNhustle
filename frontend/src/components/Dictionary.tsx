import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

interface DictionaryEntry {
  word: string;
  videoId: string;
}

export default function Dictionary() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DictionaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    fetch('/src/utils/isl_dictionary.csv')
      .then(res => res.text())
      .then(data => {
        const lines = data.split('\n').slice(1);
        const parsed = lines
          .map(line => {
            const match = line.match(/^(.+?),([a-zA-Z0-9_-]+)$/);
            if (match) {
              return { word: match[1].trim(), videoId: match[2].trim() };
            }
            return null;
          })
          .filter((entry): entry is DictionaryEntry => entry !== null && entry.word && entry.videoId);
        
        setEntries(parsed);
        setFilteredEntries(parsed);
      });
  }, []);

  useEffect(() => {
    let filtered = entries;

    if (selectedLetter !== 'ALL') {
      filtered = filtered.filter(e => e.word.toUpperCase().startsWith(selectedLetter));
    }

    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  }, [searchQuery, selectedLetter, entries]);

  return (
    <div className="w-full max-w-md bg-background-light dark:bg-background-dark relative flex flex-col h-screen overflow-hidden">
      <header className="flex items-center px-6 py-4 justify-between pt-8 sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-primary dark:text-white">arrow_back</span>
        </button>
        <h2 className="text-primary dark:text-white text-2xl font-extrabold tracking-tight">ISL Dictionary</h2>
        <div className="w-10" />
      </header>

      {selectedEntry ? (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <button onClick={() => setSelectedEntry(null)} className="flex items-center gap-2 text-primary dark:text-white mb-4">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-semibold">Back to list</span>
          </button>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 capitalize">{selectedEntry.word}</h3>
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedEntry.videoId}`}
              title={selectedEntry.word}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 space-y-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              <button
                onClick={() => setSelectedLetter('ALL')}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                  selectedLetter === 'ALL' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                All
              </button>
              {alphabet.map(letter => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-3 py-2 rounded-full font-semibold text-sm transition-colors ${
                    selectedLetter === letter ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-28">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{filteredEntries.length} words found</p>
            <div className="space-y-2">
              {filteredEntries.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors text-left flex items-center justify-between group"
                >
                  <span className="text-slate-900 dark:text-white font-medium capitalize">{entry.word}</span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">play_circle</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
