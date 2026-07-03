const Sidebar = () => {
  return (
    <aside className="w-20 lg:w-64 glass-panel border-r border-gray-800 hidden md:flex flex-col items-center lg:items-start py-8 px-4 fixed h-full z-20">
      <div className="mb-12 w-full text-center lg:text-left lg:px-4">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 hidden lg:block neon-text-purple">
          AnimeVerse
        </h1>
        <span className="lg:hidden text-2xl font-bold text-purple-500">AV</span>
      </div>
      
      <nav className="flex flex-col gap-6 w-full lg:px-4">
        <a href="#" className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors">
          <div className="w-6 h-6 bg-purple-500 rounded-md opacity-80"></div>
          <span className="hidden lg:block font-medium">Home</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-gray-200 transition-colors">
          <div className="w-6 h-6 bg-gray-600 rounded-md"></div>
          <span className="hidden lg:block font-medium">Browse</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-gray-200 transition-colors">
          <div className="w-6 h-6 bg-gray-600 rounded-md"></div>
          <span className="hidden lg:block font-medium">Watchlist</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;