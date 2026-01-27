import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlayCircle, Award } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, profiles(username, full_name, avatar_url)`);
      
      if (!error && data) setCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  if (loading) return <div className="text-center mt-20">Loading courses...</div>;

  return (
    <div className="py-4">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900">What will you learn today?</h1>
        <p className="text-gray-500 mt-2">Swap your skills with students worldwide.</p>
      </header>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
            {/* Thumbnail/Preview Area */}
            <div className="h-44 bg-blue-600 relative flex items-center justify-center text-white p-4">
               <PlayCircle className="w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />
               <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                 {course.category || "General"}
               </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-blue-600">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {course.profiles?.username?.[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-600">{course.profiles?.username || "Tutor"}</span>
                {course.profiles?.certificates?.length > 0 && <Award className="w-3 h-3 text-blue-500" />}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-xl font-black text-gray-900">{course.price_coins} <span className="text-sm font-normal text-gray-500">Coins</span></span>
                <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
                  View Portfolio
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}