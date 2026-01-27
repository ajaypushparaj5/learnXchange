import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlayCircle, Award, ExternalLink } from 'lucide-react';
import { useCoins } from '../context/CoinContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { balance, fetchBalance } = useCoins();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      // Note: profiles(username...) works because of the teacher_id foreign key
      const { data, error } = await supabase
        .from('courses')
        .select(`*, profiles:teacher_id(username, full_name, avatar_url)`);
      
      if (!error && data) setCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  // handleEnroll remains here for the logic, 
  // but we only call it if the user wants to skip the portfolio
  const handleEnroll = async (course) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user.id === course.teacher_id) {
      alert("This is your own course!");
      return;
    }

    if (balance < course.price_coins) {
      alert("❌ Not enough coins!");
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
      alert(`🎉 Enrolled in ${course.title}!`);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading courses...</div>;

  return (
    <div className="py-4">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">What will you learn today?</h1>
        <p className="text-gray-500 mt-2 text-lg">Swap your skills with students worldwide.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all group flex flex-col">
            {/* Thumbnail */}
            <div 
              onClick={() => navigate(`/profile/${course.teacher_id}`)}
              className="h-44 bg-blue-600 relative flex items-center justify-center text-white p-4 cursor-pointer"
            >
               <PlayCircle className="w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />
               <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                 {course.category || "General"}
               </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 min-h-[3rem]">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black">
                  {course.profiles?.username?.[0].toUpperCase() || 'T'}
                </div>
                <span className="text-sm font-medium text-gray-600">{course.profiles?.username || "Tutor"}</span>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-end border-t pt-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Price</p>
                    <span className="text-xl font-black text-gray-900">{course.price_coins} <span className="text-xs font-normal text-gray-500">Coins</span></span>
                  </div>
                  
                  {/* MAIN ACTION: Navigate to Profile (FREE) */}
                  <button 
                    onClick={() => navigate(`/profile/${course.teacher_id}`)}
                    className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline"
                  >
                    View Portfolio <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* DIRECT ENROLL: Clicking this actually spends the coins */}
                <button 
                  onClick={() => handleEnroll(course)}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors"
                >
                  Quick Enroll
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}