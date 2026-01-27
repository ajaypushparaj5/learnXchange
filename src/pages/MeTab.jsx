import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, PlusCircle, CheckCircle } from 'lucide-react';

export default function MeTab({ session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ username: '', bio: '', education: '', demo_video_url: '', skills: '' });

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) setProfile({ ...data, skills: data.skills?.join(', ') || '' });
      setLoading(false);
    }
    loadProfile();
  }, [session]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      ...profile,
      skills: profile.skills.split(',').map(s => s.trim())
    });
    alert(error ? error.message : "Portfolio Updated! ✅");
  };

  if (loading) return <div>Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Profile Sidebar */}
      <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-600">
            {profile.username?.[0] || 'U'}
          </div>
          <h2 className="text-xl font-bold">{profile.username || 'Your Name'}</h2>
          <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Learner & Teacher</p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Skills Verified</span> <CheckCircle className="w-4 h-4 text-green-500" /></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Classes Taught</span> <span className="font-bold">0</span></div>
        </div>
      </div>

      {/* Portfolio Editor */}
      <div className="md:col-span-2 space-y-6">
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-600" /> Portfolio Settings
          </h3>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-600">Display Username</label>
              <input type="text" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Expertise (React, Guitar, Math...)</label>
              <input type="text" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl"
                value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">YouTube Demo Link</label>
              <input type="url" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl"
                value={profile.demo_video_url} onChange={e => setProfile({...profile, demo_video_url: e.target.value})} />
            </div>
          </div>
          <button className="mt-8 w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
            Save My Profile
          </button>
        </form>
      </div>
    </div>
  );
}