
// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { PlayCircle, Award, ExternalLink, Search, X, Image as ImageIcon } from 'lucide-react';
// import { useCoins } from '../context/CoinContext';
// import { useNavigate } from 'react-router-dom';

// export default function Home() {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { balance, fetchBalance } = useCoins();
//   const navigate = useNavigate();

//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeSearch, setActiveSearch] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');

//   const categories = ['All', 'Programming', 'Design', 'Business', 'Music', 'Language'];

//   useEffect(() => {
//   async function fetchCourses() {
//     const { data, error } = await supabase
//       .from('courses')
//       .select(`
//         *, 
//         profiles:teacher_id(username, avatar_url),
//         reviews(rating)
//       `); // <--- Add this
//     if (!error && data) setCourses(data);
//     setLoading(false);
//   }
//   fetchCourses();
// }, []);

//   const handleEnroll = async (e, course) => {
//     e.stopPropagation(); // Prevents navigating to the course page when clicking enroll
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

//   const filteredCourses = courses.filter(course => {
//     const matchesSearch = course.title.toLowerCase().includes(activeSearch.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   if (loading) return (
//     <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-bold animate-pulse">
//       Discovering Skills...
//     </div>
//   );

//   return (
//     <div className="py-4 space-y-8 bg-[#020617] min-h-screen text-white">
//       <header className="text-center md:text-left">
//         <h1 className="text-4xl font-black text-white tracking-tighter">Skill Marketplace</h1>
//         <p className="text-slate-400 mt-2 text-lg">Invest your coins in world-class knowledge.</p>
//       </header>

//       {/* Search & Filter Bar */}
//       <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
//           <input 
//             type="text"
//             placeholder="What do you want to learn?"
//             className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-900 text-white placeholder:text-slate-600 shadow-xl"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <select 
//           className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 font-bold text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
//           value={selectedCategory}
//           onChange={(e) => setSelectedCategory(e.target.value)}
//         >
//           {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//         </select>

//         <button type="submit" className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95">
//           Search
//         </button>
//       </form>

//       {/* Course Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//         {filteredCourses.map((course) => (
//           <div 
//             key={course.id} 
//             onClick={() => navigate(`/course/${course.id}`)}
//             className="group cursor-pointer bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-500 flex flex-col"
//           >
//             {/* Display Image or Placeholder */}
//             <div className="h-48 relative overflow-hidden bg-slate-800">
//               <img 
//                 src={course.image_url || `https://source.unsplash.com/featured/?${course.category || 'education'}`} 
//                 alt={course.title}
//                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
//               <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
//                 {course.category || "General"}
//               </div>
//             </div>

//             <div className="p-6 flex-1 flex flex-col">
//               <h3 className="font-bold text-white text-xl leading-tight mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
//                 {course.title}
//               </h3>
//               <div className="flex items-center gap-1 text-yellow-500 mb-2">
//        <span className="text-sm font-black">⭐ {avg}</span>
//        <span className="text-slate-500 text-[10px]">({ratings.length})</span>
//     </div>
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xs font-black border border-emerald-500/20">
//                   {course.profiles?.username?.[0].toUpperCase() || 'T'}
//                 </div>
//                 <span className="text-sm font-bold text-slate-400">{course.profiles?.username || "Tutor"}</span>
//               </div>

//               <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
//                 <div>
//                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Enrollment</p>
//                   <span className="text-xl font-black text-white tracking-tighter">🪙 {course.price_coins}</span>
//                 </div>
//                 <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-emerald-600 transition-colors">
//                   <ExternalLink className="w-5 h-5 text-emerald-500 group-hover:text-white" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlayCircle, Award, ExternalLink, Search, X, ShieldCheck, Star } from 'lucide-react';
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
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *, 
          profiles:teacher_id(username, avatar_url),
          reviews(rating)
        `); 
      
      if (!error && data) setCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);

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
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-emerald-500 font-black text-xl tracking-tighter animate-pulse">
        SCANNING MARKETPLACE...
      </div>
    </div>
  );

  return (
    <div className="py-4 space-y-10 bg-[#020617] min-h-screen text-white px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter">Skill Marketplace</h1>
          <p className="text-slate-400 mt-2 text-lg">Exchange your expertise and grow your stack.</p>
        </div>
        <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-2xl">
          <ShieldCheck className="text-emerald-500 w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">90% Refund Guarantee Active</span>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 p-2 bg-slate-900/50 rounded-[2rem] border border-slate-800 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-4 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search programming, music, design..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl outline-none bg-transparent text-white placeholder:text-slate-600 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="px-6 py-4 rounded-xl bg-slate-800 font-bold text-slate-300 outline-none cursor-pointer border-none"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <button type="submit" className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40 active:scale-95">
          SEARCH
        </button>
      </form>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredCourses.length > 0 ? filteredCourses.map((course) => {
          // Calculate Rating Logic
          const ratings = course.reviews || [];
          const avg = ratings.length > 0 
            ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) 
            : "NEW";

          return (
            <div 
              key={course.id} 
              onClick={() => navigate(`/course/${course.id}`)}
              className="group cursor-pointer bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all duration-500 flex flex-col relative"
            >
              {/* Image Header */}
              <div className="h-52 relative overflow-hidden bg-slate-800">
                <img 
                  src={course.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop`} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {course.category || "General"}
                  </div>
                </div>

                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <Star className={`w-3.5 h-3.5 ${avg === "NEW" ? 'text-slate-400' : 'text-yellow-400 fill-yellow-400'}`} />
                    <span className="text-xs font-black">{avg}</span>
                    <span className="text-[10px] text-slate-500">({ratings.length})</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-7 flex-1 flex flex-col">
                <h3 className="font-bold text-white text-xl leading-tight mb-4 group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[3.5rem]">
                  {course.title}
                </h3>
                
                <div className="flex items-center gap-3 mb-8 bg-slate-800/40 p-2 rounded-2xl border border-white/5 w-fit pr-4">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg">
                    {course.profiles?.username?.[0].toUpperCase() || 'L'}
                  </div>
                  <span className="text-xs font-bold text-slate-300 tracking-tight">@{course.profiles?.username || "Learner"}</span>
                </div>

                <div className="mt-auto pt-5 border-t border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Exchange Price</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-black text-white tracking-tighter">🪙 {course.price_coins}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-300 group-hover:rotate-12">
                    <ExternalLink className="w-5 h-5 text-emerald-500 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-32 text-center bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800">
            <X className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-black uppercase tracking-widest">No matching skills found</p>
          </div>
        )}
      </div>
    </div>
  );
}