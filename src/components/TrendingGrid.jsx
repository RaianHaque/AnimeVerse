import { useState, useEffect } from 'react';

const TrendingGrid = () => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        // Changed the endpoint to fetch the CURRENT season instead of 2014
        const response = await fetch('https://api.jikan.moe/v4/seasons/now?sfw');
        const data = await response.json();
        
        setAnimeList(data.data.slice(0, 10));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from Jikan API:", error);
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, []);

  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        {/* Updated the title so it isn't stuck in the past */}
        <h3 className="text-2xl font-semibold border-l-4 border-purple-500 pl-4">Trending This Season</h3>
        <a href="#" className="text-sm text-purple-400 hover:text-purple-300">View All</a>
      </div>
      
      {isLoading ? (
        <div className="w-full flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {animeList.map((anime) => (
            <div key={anime.mal_id} className="group cursor-pointer flex flex-col">
              
              <div className="w-full aspect-[3/4] bg-gray-800 rounded-xl mb-3 overflow-hidden relative shadow-lg group-hover:shadow-purple-500/20 transition-all">
                <img 
                  src={anime.images.webp.large_image_url} 
                  alt={anime.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="bg-purple-600 text-white rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">▶</button>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-100 truncate group-hover:text-purple-400 transition-colors">
                {anime.title_english || anime.title}
              </h4>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                <span>{anime.type}</span>
                <span>{anime.episodes || '?'} Episodes</span>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TrendingGrid;