// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { PlayCircle, Award, ExternalLink, Search, X } from 'lucide-react';
// import { useCoins } from '../context/CoinContext';
// import { useNavigate } from 'react-router-dom';

// export default function Home() {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { balance, fetchBalance } = useCoins();
//   const navigate = useNavigate();

//   // Search & Filter States
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeSearch, setActiveSearch] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');

//   const categories = ['All', 'Programming', 'Design', 'Business', 'Music', 'Language'];

//   useEffect(() => {
//     async function fetchCourses() {
//       const { data, error } = await supabase
//         .from('courses')
//         .select(`*, profiles:teacher_id(username, full_name, avatar_url)`);
//       if (!error && data) setCourses(data);
//       setLoading(false);
//     }
//     fetchCourses();
//   }, []);

//   const handleEnroll = async (course) => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (user.id === course.teacher_id) return alert("You can't buy your own course!");
//     if (balance < course.price_coins) return alert("❌ Not enough coins!");

//     const { error: enrollError } = await supabase.from('enrollments').insert([
//       { learner_id: user.id, course_id: course.id, teacher_id: course.teacher_id }
//     ]);

//     if (!enrollError) {
//       await supabase.from('profiles').update({ coin_balance: balance - course.price_coins }).eq('id', user.id);
//       await fetchBalance(); 
//       alert(`🎉 Enrolled in ${course.title}!`);
//     }
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setActiveSearch(searchTerm);
//   };

//   // Filtered Logic
//   const filteredCourses = courses.filter(course => {
//     const matchesSearch = course.title.toLowerCase().includes(activeSearch.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   if (loading) return <div className="text-center mt-20 font-bold">Loading skills...</div>;

//   return (
//     <div className="py-4 space-y-8">
//       <header className="text-center md:text-left">
//         <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">What will you learn today?</h1>
//         <p className="text-slate-500 mt-2 text-lg">Swap your skills with students worldwide.</p>
//       </header>

//       {/* Search Bar & Category Filter */}
//       <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
//           <input 
//             type="text"
//             placeholder="Search skills (e.g. Figma, Python)..."
//             className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm bg-white"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           {searchTerm && (
//             <button onClick={() => {setSearchTerm(''); setActiveSearch('');}} type="button" className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
//               <X className="w-5 h-5" />
//             </button>
//           )}
//         </div>

//         <select 
//           className="p-3.5 rounded-2xl border border-slate-200 bg-white font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
//           value={selectedCategory}
//           onChange={(e) => setSelectedCategory(e.target.value)}
//         >
//           {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//         </select>

//         {/* Primary Action Button - Emerald */}
//         <button type="submit" className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95">
//           Search
//         </button>
//       </form>

//       {/* Course Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//         {filteredCourses.map((course) => (
//           <div key={course.id} className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
            
//             {/* Thumbnail - Emerald Gradient */}
//             <div onClick={() => navigate(`/profile/${course.teacher_id}`)} className="h-44 bg-gradient-to-br from-emerald-600 to-teal-500 relative flex items-center justify-center text-white p-4 cursor-pointer">
//                <PlayCircle className="w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />
//                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
//                  {course.category || "General"}
//                </div>
//             </div>

//             <div className="p-5 flex-1 flex flex-col">
//               <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 min-h-[3rem] group-hover:text-emerald-600 transition-colors">
//                 {course.title}
//               </h3>
              
//               <div className="flex items-center gap-2 mb-6">
//                 <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black uppercase">
//                   {course.profiles?.username?.[0] || 'T'}
//                 </div>
//                 <span className="text-sm font-medium text-slate-600">{course.profiles?.username || "Tutor"}</span>
//               </div>

//               <div className="mt-auto space-y-3">
//                 <div className="flex justify-between items-end border-t border-slate-50 pt-3">
//                   <div>
//                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Price</p>
//                     <span className="text-xl font-black text-slate-900">{course.price_coins} <span className="text-xs font-normal text-slate-500">Coins</span></span>
//                   </div>
                  
//                   {/* Secondary Link - Emerald */}
//                   <button onClick={() => navigate(`/profile/${course.teacher_id}`)} className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm hover:text-emerald-700 hover:underline">
//                     View Portfolio <ExternalLink className="w-3 h-3" />
//                   </button>
//                 </div>

//                 {/* Main Action Button - Dark Slate */}
//                 <button onClick={() => handleEnroll(course)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors duration-300">
//                   Quick Enroll
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Empty State */}
//       {filteredCourses.length === 0 && (
//         <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
//           <p className="text-slate-400 font-medium italic">No skills found matching your search.</p>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlayCircle, Award, ExternalLink, Search, X, Image as ImageIcon } from 'lucide-react';
import { useCoins } from '../context/CoinContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { balance, fetchBalance } = useCoins();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Programming', 'Design', 'Business', 'Music', 'Language'];

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, profiles:teacher_id(username, avatar_url)`);
      if (!error && data) setCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const handleEnroll = async (e, course) => {
    e.stopPropagation(); // Prevents navigating to the course page when clicking enroll
    const { data: { user } } = await supabase.auth.getUser();
    if (user.id === course.teacher_id) return alert("You can't buy your own course!");
    if (balance < course.price_coins) return alert("❌ Not enough coins!");

    const { error: enrollError } = await supabase.from('enrollments').insert([
      { learner_id: user.id, course_id: course.id, teacher_id: course.teacher_id }
    ]);

    if (!enrollError) {
      await supabase.from('profiles').update({ coin_balance: balance - course.price_coins }).eq('id', user.id);
      await fetchBalance(); 
      alert(`🎉 Enrolled in ${course.title}!`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-bold animate-pulse">
      Discovering Skills...
    </div>
  );

  return (
    <div className="py-4 space-y-8 bg-[#020617] min-h-screen text-white">
      <header className="text-center md:text-left">
        <h1 className="text-4xl font-black text-white tracking-tighter">Skill Marketplace</h1>
        <p className="text-slate-400 mt-2 text-lg">Invest your coins in world-class knowledge.</p>
      </header>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="What do you want to learn?"
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-900 text-white placeholder:text-slate-600 shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 font-bold text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <button type="submit" className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95">
          Search
        </button>
      </form>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredCourses.map((course) => (
          <div 
            key={course.id} 
            onClick={() => navigate(`/course/${course.id}`)}
            className="group cursor-pointer bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-500 flex flex-col"
          >
            {/* Display Image or Placeholder */}
            <div className="h-48 relative overflow-hidden bg-slate-800">
              <img 
                src={course.image_url || `https://source.unsplash.com/featured/?${course.category || 'education'}`} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {course.category || "General"}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-white text-xl leading-tight mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xs font-black border border-emerald-500/20">
                  {course.profiles?.username?.[0].toUpperCase() || 'T'}
                </div>
                <span className="text-sm font-bold text-slate-400">{course.profiles?.username || "Tutor"}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Enrollment</p>
                  <span className="text-xl font-black text-white tracking-tighter">🪙 {course.price_coins}</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-emerald-600 transition-colors">
                  <ExternalLink className="w-5 h-5 text-emerald-500 group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}