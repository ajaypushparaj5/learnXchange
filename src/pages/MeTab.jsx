import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, PlusCircle, CheckCircle, PlayCircle } from 'lucide-react';
import { useCoins } from '../context/CoinContext';

export default function MeTab({ session }) {
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
        // Fix: Use || '' to prevent the "null" value warning
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

  if (loading) return <div className="p-10 text-center font-bold">Syncing Profile...</div>;

return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* Sidebar: Stats */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {profile.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl font-bold">{profile.username || 'New User'}</h2>
            <p className="text-sm text-gray-400 font-medium">Skill Exchanger</p>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
              <span className="text-sm text-gray-500 font-semibold">Verification</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Unified Profile & Media Form */}
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Save className="w-5 h-5 text-blue-600" /> Portfolio Settings
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Username Input */}
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Username</label>
              <input type="text" className="w-full mt-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} placeholder="Expert_Dev" />
            </div>

            {/* Skills Input */}
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Your Skills (Comma separated)</label>
              <input type="text" className="w-full mt-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="React, Node, Figma..." />
            </div>

            {/* YouTube URL Input */}
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400">YouTube Demo URL</label>
              <div className="flex items-center gap-2 mt-2">
                <PlayCircle className="w-5 h-5 text-red-500" />
                <input 
                  type="url" 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all" 
                  value={profile.demo_video_url} 
                  onChange={e => setProfile({...profile, demo_video_url: e.target.value})} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                />
              </div>
            </div>

            {/* Video Preview Box */}
            {profile.demo_video_url && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 aspect-video bg-gray-900 flex items-center justify-center relative">
                 <p className="text-white/40 text-xs font-medium">Video preview will appear on your public profile</p>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="text-white text-[10px] font-bold uppercase tracking-tighter">Live Link Detected</span>
                 </div>
              </div>
            )}
          </div>

          <button type="submit" className="mt-8 w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">
            Save Portfolio Changes
          </button>
        </form>

        {/* Create Course Form */}
        <form onSubmit={handleCreateCourse} className="bg-white p-8 rounded-3xl border-2 border-dashed border-blue-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <PlusCircle className="w-5 h-5 text-blue-600" /> List a New Skill to Teach
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" className="p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" placeholder="Course Title (e.g. Intro to UI)"
              value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
            
            <select className="p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
              value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} required>
              <option value="">Select Category</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Music">Music</option>
            </select>
            
            <input type="number" className="p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" placeholder="Price in Coins"
              value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: parseInt(e.target.value)})} />
            
            <button type="submit" className="bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">
              Publish to Marketplace
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}