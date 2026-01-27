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

  if (!profile) return <div className="p-10 text-center font-bold">Loading Teacher Portfolio...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center text-4xl font-black mb-4 shadow-lg">
          {profile.username?.[0].toUpperCase()}
        </div>
        <h2 className="text-3xl font-black text-gray-900">{profile.username}</h2>
        <p className="text-gray-500 mt-3 max-w-xl text-lg leading-relaxed">{profile.bio || "This teacher hasn't added a bio yet."}</p>
        
        <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm">
                <GraduationCap className="w-4 h-4" /> {profile.education || "Student"}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl font-bold text-sm">
                <BookOpen className="w-4 h-4" /> {teacherCourses.length} Courses
            </div>
        </div>
      </div>        
      {embedUrl && (
      <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="aspect-video w-full">
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
          <div className="p-4 flex items-center gap-2 text-gray-500 text-sm font-medium">
            <PlayCircle className="w-4 h-4 text-red-500" />
            Watch {profile.username}'s Teaching Demo
          </div>
        </div>
      )}
      {/* Courses List Section */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <PlayCircle className="w-6 h-6 text-blue-600" /> Courses by {profile.username}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherCourses.map(course => (
            <div key={course.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {course.category}
                    </span>
                    <span className="font-black text-gray-900">🪙 {course.price_coins}</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{course.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => handleEnroll(course)}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}

          {teacherCourses.length === 0 && (
            <div className="col-span-full p-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">This user hasn't posted any courses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}