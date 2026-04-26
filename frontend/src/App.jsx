import { useState, useEffect } from 'react';
import { Download, Loader2, Moon, Sun, History, Link as LinkIcon } from 'lucide-react';

const API_BASE = "https://media-fetcher-48t3.onrender.com"; // Live Link

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    setHistory(JSON.parse(localStorage.getItem('mediaHistory')) || []);
  }, []);

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`${API_BASE}/api/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setData(result);
      const newHistory = [{ title: result.title, url, platform: result.platform }, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('mediaHistory', JSON.stringify(newHistory));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2"><Download /> Fetcher</h1>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
        </header>

        <form onSubmit={handleFetch} className="mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-4 text-gray-400" size={20}/>
            <input type="url" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="YouTube/Instagram link..." className="w-full pl-10 pr-4 py-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin mr-2"/> : 'Fetch Media'}
          </button>
        </form>

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-8">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {data && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <img src={data.thumbnail} className="w-full aspect-video object-cover" alt="Thumbnail"/>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">{data.title}</h2>
                  <div className="space-y-3">
                    {data.formats.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded-lg">
                        <span>{f.resolution} ({f.ext}) - {f.filesize}</span>
                        <a href={`${API_BASE}/api/download?url=${encodeURIComponent(url)}&format_id=${f.format_id}&ext=${f.ext}&title=${encodeURIComponent(data.title)}`} className="text-indigo-500 font-bold flex items-center gap-1"><Download size={16}/> Fast</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-fit">
            <h3 className="font-bold mb-4 flex items-center gap-2"><History size={18}/> History</h3>
            {history.map((h, i) => (
              <button key={i} onClick={()=>{setUrl(h.url)}} className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm mb-2">{h.title}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}