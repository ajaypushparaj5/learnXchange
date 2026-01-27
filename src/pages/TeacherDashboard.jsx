import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Calendar, Video, Edit3, CheckCircle, Clock, 
  BookOpen, X, Image as ImageIcon, MessageSquare, Save 
} from 'lucide-react';

export default function TeacherDashboard({ session }) {
  const [activeTab, setActiveTab] = useState('courses'); 
  const [myCourses, setMyCourses] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Editing Course
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    async function loadTeacherData() {
      if (!session?.user?.id) return;
      
      // 1. Fetch Courses Created by the Teacher
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', session.user.id);
      setMyCourses(courses || []);

      // 2. Fetch Live Sessions booked by students
      const { data: sessions } = await supabase
        .from('course_sessions')
        .select(`
          *, 
          courses(title), 
          profiles:learner_id(username)
        `)
        .eq('teacher_id', session.user.id)
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true });
        
      setUpcomingSessions(sessions || []);
      setLoading(false);
    }
    loadTeacherData();
  }, [session]);

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('courses')
      .update({
        content: editingCourse.content,
        image_url: editingCourse.image_url,
        demo_video_url: editingCourse.demo_video_url,
        price_coins: editingCourse.price_coins
      })
      .eq('id', editingCourse.id);

    if (!error) {
      setMyCourses(myCourses.map(c => c.id === editingCourse.id ? editingCourse : c));
      setEditingCourse(null);
      alert("Class updated successfully! 🚀");
    }
  };

  if (loading) return <div className="p-20 text-center text-emerald-500 font-bold animate-pulse">Accessing Teacher Records...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 text-white min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Teacher Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your expertise and student sessions.</p>
        </div>
        
        {/* Modern Tab Switcher */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button 
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'courses' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BookOpen className="w-4 h-4" /> My Classes
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'schedule' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Calendar className="w-4 h-4" /> Live Schedule
          </button>
        </div>
      </header>

      {/* ---------------- TABS CONTENT ---------------- */}
      
      {activeTab === 'courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myCourses.map(course => (
            <div key={course.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col group">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                  <span className="text-emerald-500 font-black">🪙 {course.price_coins}</span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-3 mb-6">
                  {course.content || "No detailed description set yet. Click edit to add a write-up."}
                </p>
              </div>
              <button 
                onClick={() => setEditingCourse(course)}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Edit3 className="w-4 h-4" /> Edit Class Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingSessions.length > 0 ? upcomingSessions.map(sess => (
            <div key={sess.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-shadow">
              <div className="flex items-center gap-5">
                <div className="bg-emerald-500/10 p-4 rounded-2xl">
                  <Video className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{sess.courses.title}</h4>
                  <p className="text-slate-400 text-sm">Learner: <span className="text-emerald-400 font-bold">@{sess.profiles.username}</span></p>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mt-2 bg-slate-800 w-fit px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> {new Date(sess.scheduled_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button 
                className="w-full md:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl"
                onClick={() => window.open(sess.meeting_link || 'https://meet.google.com/new', '_blank')}
              >
                Join Live Class
              </button>
            </div>
          )) : (
            <div className="text-center py-24 bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800">
              <p className="text-slate-600 italic text-lg">No sessions scheduled yet. Check back when students enroll!</p>
            </div>
          )}
        </div>
      )}

      {/* ---------------- EDITING MODAL ---------------- */}
      
      {editingCourse && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleUpdateCourse} className="bg-slate-900 border border-slate-800 w-full max-w-3xl p-8 rounded-[3rem] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-emerald-500">Edit Class Description</h2>
              <button type="button" onClick={() => setEditingCourse(null)} className="p-2 hover:bg-slate-800 rounded-full transition"><X /></button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">
                  <ImageIcon className="w-3 h-3" /> Class Display Image (URL)
                </label>
                <input 
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={editingCourse.image_url || ''}
                  onChange={e => setEditingCourse({...editingCourse, image_url: e.target.value})}
                  placeholder="Paste a high-quality Unsplash or image link"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">
                  <MessageSquare className="w-3 h-3" /> The "Big Write-Up" (Description)
                </label>
                <textarea 
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white h-56 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg leading-relaxed"
                  value={editingCourse.content || ''}
                  onChange={e => setEditingCourse({...editingCourse, content: e.target.value})}
                  placeholder="Explain exactly what the student will learn, the prerequisites, and the structure..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">
                  <Video className="w-3 h-3" /> Demo Video (YouTube Link)
                </label>
                <input 
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={editingCourse.demo_video_url || ''}
                  onChange={e => setEditingCourse({...editingCourse, demo_video_url: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/30">
              <Save className="w-6 h-6" /> Save Class Updates
            </button>
          </form>
        </div>
      )}
    </div>
  );
}