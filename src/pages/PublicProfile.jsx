
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCoins } from '../context/CoinContext';
import { GraduationCap, Award, BookOpen, PlayCircle } from 'lucide-react';

const getEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}` 
    : null;
};

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const { balance, fetchBalance } = useCoins();
  
  // Calculate embed URL
  const embedUrl = getEmbedUrl(profile?.demo_video_url);

  useEffect(() => {
    async function getTeacherData() {
      // 1. Fetch Profile Info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) setProfile(profileData);

      // 2. Fetch all courses posted by this teacher
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', userId);
      
      if (courseData) setTeacherCourses(courseData);
    }
    getTeacherData();
  }, [userId]);

  const handleEnroll = async (course) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user.id === course.teacher_id) {
        alert("This is your own course!");
        return;
    }

    if (balance < course.price_coins) {
      alert("❌ Insufficient coins to enroll!");
      return;
    }

    const { error: enrollError } = await supabase.from('enrollments').insert([
      { learner_id: user.id, course_id: course.id, teacher_id: course.teacher_id }
    ]);

    if (!enrollError) {
      await supabase.from('profiles')
        .update({ coin_balance: balance - course.price_coins })
        .eq('id', user.id);
      
      await fetchBalance();
      alert(`🎉 Successfully enrolled in ${course.title}!`);
    }
  };

  if (!profile) return (
    <div className="flex h-screen items-center justify-center font-bold text-emerald-500 bg-[#020617]">
      <div className="animate-pulse">Loading Teacher Portfolio...</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 text-white">
      {/* Header Section */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col items-center text-center">
        <div className="w-28 h-28 bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center text-4xl font-black mb-4 shadow-xl ring-4 ring-emerald-500/20">
          {profile.username?.[0].toUpperCase()}
        </div>
        <h2 className="text-3xl font-black text-white">{profile.username}</h2>
        <p className="text-slate-400 mt-3 max-w-xl text-lg leading-relaxed">
            {profile.bio || "This teacher hasn't added a bio yet."}
        </p>
        
        <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 font-bold text-sm">
                <GraduationCap className="w-4 h-4" /> {profile.education || "Student"}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-2xl font-bold text-sm">
                <BookOpen className="w-4 h-4" /> {teacherCourses.length} Courses
            </div>
        </div>
      </div>        

      {/* Video Section */}
      {embedUrl && (
        <div className="bg-slate-900 p-3 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-2xl"
            ></iframe>
          </div>
          <div className="p-4 flex items-center gap-2 text-slate-400 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            Watch {profile.username}'s Teaching Demo
          </div>
        </div>
      )}

      {/* Courses List Section */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-100">
          <PlayCircle className="w-6 h-6 text-emerald-500" /> Courses by {profile.username}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherCourses.map(course => (
            <div key={course.id} className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        {course.category}
                    </span>
                    <span className="font-black text-white">🪙 {course.price_coins}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">
                    {course.title}
                </h4>
                <p className="text-sm text-slate-400 line-clamp-2">{course.description}</p>
              </div>
              
              <div className="p-4 bg-slate-800/50 border-t border-slate-800">
                <button 
                  onClick={() => handleEnroll(course)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}

          {teacherCourses.length === 0 && (
            <div className="col-span-full p-20 text-center bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-800">
              <p className="text-slate-500 font-medium italic">This user hasn't posted any courses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}