const HeroBanner = () => {
  return (
    <section className="w-full h-72 md:h-96 rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-black mb-12 relative overflow-hidden flex items-end p-8 md:p-12 border border-gray-800 shadow-2xl">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent"></div>
      
      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-purple-600 text-xs font-bold rounded-md">TV</span>
          <span className="text-gray-300 text-sm">Action, Supernatural</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white neon-text-purple">Jujutsu Kaisen</h2>
        <p className="text-gray-300 mb-6 line-clamp-2 md:line-clamp-3">
          Yuji Itadori, a kind-hearted teenager, joins his school's Occult Club for fun, but discovers that its members are actual sorcerers...
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">Watch Trailer</button>
          <button className="px-6 py-3 glass-panel text-white font-bold rounded-full hover:bg-gray-800 transition-colors border border-gray-600">+ Add to List</button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;