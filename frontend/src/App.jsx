import { useState, useEffect } from 'react';
import { Moon, Sun, Download, Loader2, AlertTriangle, Link as LinkIcon, Copy, History } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    
    const savedHistory = JSON.parse(localStorage.getItem('mediaHistory')) || [];
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch('http://localhost:5000/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch media');

      setData(result);
      
      const newHistory = [{ title: result.title, url, platform: result.platform }, ...history]
        .filter((v, i, a) => a.findIndex(t => (t.url === v.url)) === i)
        .slice(0, 5);
        
      setHistory(newHistory);
      localStorage.setItem('mediaHistory', JSON.stringify(newHistory));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Download size={32} /> Media Fetcher
          </h1>
      
        </header>

        <div className="bg-amber-100 dark:bg-amber-900/40 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
            <span><strong>Educational Purposes Only:</strong> Users must ensure they have the rights or permissions to download the requested content.</span>
          </p>
        </div>

        <form onSubmit={handleFetch} className="mb-10 relative">
          <div className="flex flex-col sm:flex-row gap-3 relative">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon size={20} className="text-gray-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube or Instagram link here..."
                required
                className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-0 outline-none transition shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="py-4 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold flex items-center justify-center transition shadow-md whitespace-nowrap"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Fetch Media'}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-red-600 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-8 border border-red-200 dark:border-red-800 text-center font-medium">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {data && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative aspect-video bg-black">
                  <img src={data.thumbnail} alt="Thumbnail" className="w-full h-full object-contain opacity-90" />
                  <span className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {data.platform}
                  </span>
                  <span className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {data.duration}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold leading-tight line-clamp-2">{data.title}</h2>
                    <button onClick={copyToClipboard} className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition ml-4 shrink-0" title="Copy Link">
                      <Copy size={20} />
                    </button>
                  </div>
                  
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Available Downloads (With Sound)</h3>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {data.formats.map((format, idx) => (
                      <div key={idx} className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-4 mb-2 sm:mb-0">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${format.ext === 'mp4' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
                            {format.ext.toUpperCase()}
                          </span>
                          <span className="font-semibold">{format.resolution}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{format.filesize}</span>
                        </div>
                        
                        {/* 🚨 THE FIX: Direct Stream Download Link */}
                        <a
                          href={`http://localhost:5000/api/download?url=${encodeURIComponent(url)}&format_id=${format.format_id}&ext=${format.ext}&title=${encodeURIComponent(data.title)}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:opacity-90 transition w-full sm:w-auto justify-center"
                        >
                          <Download size={16} /> Fast Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 sticky top-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                <History size={20} /> Recent Links
              </h3>
              {history.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No recent history.</p>
              ) : (
                <ul className="space-y-4">
                  {history.map((item, index) => (
                    <li key={index} className="group">
                      <button 
                        onClick={() => { setUrl(item.url); document.querySelector('form button[type="submit"]').click(); }}
                        className="text-left w-full hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition"
                      >
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{item.title}</p>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{item.platform}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}