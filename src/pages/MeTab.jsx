import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Save, PlusCircle, CheckCircle, PlayCircle, LogOut, UserCircle } from 'lucide-react';
import { useCoins } from '../context/CoinContext';

export default function MeTab({ session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ 
    username: '', 
    bio: '', 
    education: '', 
    demo_video_url: '', 
    skills: '' 
  });

  // State for creating a new course
  const [newCourse, setNewCourse] = useState({ title: '', category: '', price: 10 });

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile({ 
          username: data.username || '', 
          bio: data.bio || '', 
          education: data.education || '', 
          demo_video_url: data.demo_video_url || '', 
          skills: data.skills?.join(', ') || '' 
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [session]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      ...profile,
      skills: profile.skills.split(',').map(s => s.trim()).filter(s => s !== '')
    });
    alert(error ? error.message : "Portfolio Updated! ✅");
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('courses').insert([
      { 
        teacher_id: session.user.id, 
        title: newCourse.title, 
        category: newCourse.category, 
        price_coins: newCourse.price 
      }
    ]);
    if (!error) {
      alert("Course Listed on Marketplace! 🚀");
      setNewCourse({ title: '', category: '', price: 10 });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-bold text-emerald-500 bg-[#020617]">
      <div className="animate-pulse text-xl">Syncing Profile...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 text-white p-4">
      
      {/* Sidebar: Profile Info & Actions */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-28 h-28 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black text-white shadow-xl ring-4 ring-emerald-500/10">
              {profile.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-black text-white">{profile.username || 'New User'}</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Skill Exchanger</p>
          </div>
          
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <span className="text-sm text-slate-300 font-bold">Account Status</span>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase">
                <CheckCircle className="w-4 h-4" /> Verified
              </div>
            </div>

            {/* LOGOUT BUTTON */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-black hover:bg-red-500 hover:text-white transition-all active:scale-95 mt-4"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>

        <div className="bg-emerald-600/5 p-6 rounded-[2rem] border border-emerald-500/10">
          <p className="text-xs text-emerald-500/60 font-bold uppercase tracking-tighter mb-2">Pro Tip</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            A complete portfolio with a YouTube demo video increases your chances of students enrolling in your classes by <span className="text-emerald-400 font-bold">40%</span>.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Profile Settings Form */}
        <form onSubmit={handleUpdate} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white">
            <UserCircle className="w-6 h-6 text-emerald-500" /> Portfolio Identity
          </h3>
          
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Display Name</label>
              <input type="text" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600" 
                value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} placeholder="Expert_Dev" />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Skills / Specializations</label>
              <input type="text" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="React, Node, Figma..." />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Teaching Demo (YouTube URL)</label>
              <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <PlayCircle className="w-6 h-6 text-red-500" />
                <input 
                  type="url" 
                  className="w-full py-2 bg-transparent text-white outline-none placeholder:text-slate-600" 
                  value={profile.demo_video_url} 
                  onChange={e => setProfile({...profile, demo_video_url: e.target.value})} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                />
              </div>
            </div>

            {profile.demo_video_url && (
              <div className="rounded-3xl overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center relative group">
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6">
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
                      ✓ Demo Video Linked
                    </span>
                    <p className="text-white/40 text-xs mt-2">This will be featured on your Public Profile</p>
                 </div>
              </div>
            )}
          </div>

          <button type="submit" className="mt-10 w-full bg-emerald-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Save Identity Changes
          </button>
        </form>

        {/* Quick List Form */}
        <form onSubmit={handleCreateCourse} className="bg-slate-900/40 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <PlusCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">List a New Skill</h3>
              <p className="text-slate-500 text-sm font-medium">Create a new course in the marketplace.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input type="text" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Course Title (e.g. Master React in 2 Weeks)"
                value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
            </div>
            
            <select className="p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} required>
              <option value="" className="bg-slate-900">Select Category</option>
              <option value="Programming" className="bg-slate-900">Programming</option>
              <option value="Design" className="bg-slate-900">Design</option>
              <option value="Business" className="bg-slate-900">Business</option>
              <option value="Music" className="bg-slate-900">Music</option>
            </select>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">🪙</span>
              <input type="number" className="w-full p-4 pl-10 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Price"
                value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: parseInt(e.target.value)})} />
            </div>
            
            <button type="submit" className="md:col-span-2 bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
              Publish to Marketplace
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}