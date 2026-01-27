import { Wallet, User, Home, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoins } from '../context/CoinContext';

export default function Navbar() {
  const { balance } = useCoins() || { balance: 0 };

  return (
    <nav className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
      {/* Brand Logo */}
      <Link to="/" className="text-2xl font-black text-emerald-500 tracking-tighter">
        learn<span className="text-white">X</span>change
      </Link>
      
      <div className="flex items-center gap-4 md:gap-8">
        {/* Main Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors">
            <Home className="w-4 h-4" />
            <span>Marketplace</span>
          </Link>
          
          <Link to="/dashboard" className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors">
            <Video className="w-4 h-4" />
            <span>Teacher Dashboard</span>
          </Link>
        </div>

        {/* Economy & Profile Section */}
        <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
          {/* Coin Balance */}
          <div className="flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-900/10">
            <Wallet className="w-4 h-4 text-emerald-500 mr-2" />
            <span className="font-bold text-emerald-400">{balance} Coins</span>
          </div>

          {/* User Profile / Settings */}
          <Link to="/me" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-emerald-400 transition-all active:scale-95">
            <User className="w-5 h-5 text-slate-300" />
          </Link>
        </div>
      </div>
    </nav>
  );
}