// import { Wallet, User, Home, Video } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useCoins } from '../context/CoinContext';

// export default function Navbar() {
//   const { balance } = useCoins() || { balance: 0 };
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [amount, setAmount] = useState(100);
//   const [isAdding, setIsAdding] = useState(false);
//   const handleAddCoins = async () => {
//   setIsAdding(true);
//   const { data: { user } } = await supabase.auth.getUser();
  
//   try {
//     const { error } = await supabase
//       .from('profiles')
//       .update({ coin_balance: balance + parseInt(amount) })
//       .eq('id', user.id);

//     if (error) throw error;
    
//     await fetchBalance(); // Refresh the global balance
//     setIsAddOpen(false);
//     alert(`Successfully added ${amount} coins! 🚀`);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setIsAdding(false);
//   }
// };


//   return (
//     <nav className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
//       {/* Brand Logo */}
//       <Link to="/" className="text-2xl font-black text-emerald-500 tracking-tighter">
//         learn<span className="text-white">X</span>change
//       </Link>
      
//       <div className="flex items-center gap-4 md:gap-8">
//         {/* Main Navigation */}
//         <div className="hidden md:flex items-center gap-6">
//           <Link to="/" className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors">
//             <Home className="w-4 h-4" />
//             <span>Marketplace</span>
//           </Link>

//           <Link to="/learning" className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors">
//             <Home className="w-4 h-4" />
//             <span>My Learning</span>
//           </Link>
          
//           <Link to="/dashboard" className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors">
//             <Video className="w-4 h-4" />
//             <span>Teacher Dashboard</span>
//           </Link>
//         </div>

//         {/* Economy & Profile Section */}
//         <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
//           {/* Coin Balance */}
//           <div className="flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-900/10">
//             <Wallet className="w-4 h-4 text-emerald-500 mr-2" />
//             <span className="font-bold text-emerald-400">{balance} Coins</span>
//           </div>

//           {/* User Profile / Settings */}
//           <Link to="/me" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-emerald-400 transition-all active:scale-95">
//             <User className="w-5 h-5 text-slate-300" />
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// }


import { Wallet, User, Home, Video, X, Plus, ArrowUpRight, History, CircleDollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoins } from '../context/CoinContext';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ensure supabase is imported

export default function Navbar() {
  const { balance, fetchBalance } = useCoins() || { balance: 0 };
  
  // Wallet & Top-up States
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCoins = async () => {
    setIsAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ coin_balance: balance + parseInt(amount) })
        .eq('id', user.id);

      if (error) throw error;
      
      await fetchBalance(); 
      setIsAddOpen(false);
      // Replace this alert with a custom toast later if you want it even cleaner
      alert(`Successfully added ${amount} coins! 🚀`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

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

          <Link to="/learning" className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors">
            <Home className="w-4 h-4" />
            <span>My Learning</span>
          </Link>
          
          <Link to="/dashboard" className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors">
            <Video className="w-4 h-4" />
            <span>Teacher Dashboard</span>
          </Link>
        </div>

        {/* Economy & Profile Section */}
        <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
          
          {/* Coin Balance Trigger */}
          <button 
            onClick={() => setIsWalletOpen(true)}
            className="flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-900/10 hover:bg-emerald-500/20 transition-all group"
          >
            <Wallet className="w-4 h-4 text-emerald-500 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-emerald-400">{balance} Coins</span>
          </button>

          {/* User Profile */}
          <Link to="/me" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-emerald-400 transition-all active:scale-95">
            <User className="w-5 h-5 text-slate-300" />
          </Link>
        </div>
      </div>

      {/* --- SLIDE-OUT WALLET PANEL --- */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsWalletOpen(false)}
          />
          
          <div className="relative w-full max-w-md bg-slate-950 border-l border-slate-800 h-screen shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500">
            
            <header className="p-8 flex justify-between items-center border-b border-white/5">
              <div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">My Wallet</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Secured by Aloki Escrow</p>
              </div>
              <button onClick={() => setIsWalletOpen(false)} className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              
              {/* BALANCE CARD */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2.5rem] p-8 mb-8 shadow-2xl shadow-emerald-900/40">
                <div className="relative z-10">
                  <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest mb-2">Total Coins</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter">{balance}</span>
                  </div>
                </div>
                <CircleDollarSign size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <button 
                  onClick={() => setIsAddOpen(true)}
                  className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-emerald-500/50 transition-all group"
                >
                  <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 mb-3 group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Add Coins</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-blue-500/50 transition-all group opacity-50 cursor-not-allowed">
                  <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 mb-3">
                    <ArrowUpRight size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Withdraw</span>
                </button>
              </div>

              {/* MOCK TRANSACTIONS */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-slate-500" />
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Recent Activity</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-500"><Plus size={16}/></div>
                      <div>
                        <p className="text-sm font-black text-white italic">Shield Refund (90%)</p>
                        <p className="text-[10px] text-slate-500 font-bold">Jan 28 • Escrow Payout</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-500">+13.5</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-500/10 p-2.5 rounded-2xl text-red-500"><X size={16}/></div>
                      <div>
                        <p className="text-sm font-black text-white italic">Certificate Unlock</p>
                        <p className="text-[10px] text-slate-500 font-bold">Jan 25 • Platform Fee</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-red-500">-500</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500/10 p-2.5 rounded-2xl text-blue-500"><History size={16}/></div>
                      <div>
                        <p className="text-sm font-black text-white italic">Marketplace Purchase</p>
                        <p className="text-[10px] text-slate-500 font-bold">Jan 20 • Course Enrollment</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-white">-15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD COINS MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 text-center">Top Up Wallet</h2>
            <p className="text-slate-500 text-[10px] text-center mb-8 font-black uppercase tracking-widest">Aloki 2.0 Deposits</p>
            
            <div className="relative mb-8">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-4xl font-black text-emerald-500 text-center focus:outline-none focus:border-emerald-500 transition-all"
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-6 text-slate-700 font-black text-xl">🪙</div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-4 font-black text-slate-500 hover:text-white transition-all text-[10px] uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCoins}
                disabled={isAdding}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black text-white transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 text-[10px] uppercase tracking-widest"
              >
                {isAdding ? "Syncing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}