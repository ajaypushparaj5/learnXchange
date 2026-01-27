import { Wallet, User, Home, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoins } from '../context/CoinContext';

export default function Navbar() {
  const { balance } = useCoins() || { balance: 0 };

  return (
    <nav className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
        learnXchange
      </Link>
      
      <div className="flex items-center gap-4 md:gap-8">
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium">
            <Home className="w-4 h-4" />
            <span>Browse</span>
          </Link>
          <Link to="/me" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium">
            <BookOpen className="w-4 h-4" />
            <span>My Portfolio</span>
          </Link>
        </div>

        {/* Economy/User Section */}
        <div className="flex items-center gap-4 border-l pl-4">
          <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
            <Wallet className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="font-bold text-yellow-700">{balance} Coins</span>
          </div>

          <Link to="/me" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <User className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>
    </nav>
  );
}