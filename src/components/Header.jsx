const Header = () => {
  return (
    <header className="flex justify-between items-center mb-10">
      <div className="w-full max-w-xl relative">
        <input 
          type="text" 
          placeholder="Search for anime, genres, or users..." 
          className="w-full bg-gray-900 border border-gray-700 text-sm rounded-full px-6 py-3 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>
      <div className="flex gap-4 ml-4 shrink-0">
        <button className="px-5 py-2 text-sm font-medium rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">Login</button>
        <button className="px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default Header;