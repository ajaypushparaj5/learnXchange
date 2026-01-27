// import { useParams, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useCoins } from '../context/CoinContext';
// import { PlayCircle, Calendar, MessageSquare, Edit3, CheckCircle, ArrowLeft } from 'lucide-react';

// export default function CoursePage() {
//   const { courseId } = useParams();
//   const navigate = useNavigate();
//   const { balance, fetchBalance } = useCoins();
  
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isOwner, setIsOwner] = useState(false);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState({ content: '', demo_video_url: '' });

//   useEffect(() => {
//     async function fetchCourseData() {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       // Fetch course + teacher info
//       const { data, error } = await supabase
//         .from('courses')
//         .select(`*, profiles:teacher_id(username, education)`)
//         .eq('id', courseId)
//         .single();

//       if (data) {
//         setCourse(data);
//         setEditData({ content: data.content || '', demo_video_url: data.demo_video_url || '' });
//         setIsOwner(data.teacher_id === user.id);

//         // Check enrollment
//         const { data: enroll } = await supabase
//           .from('enrollments')
//           .select('*')
//           .eq('course_id', courseId)
//           .eq('learner_id', user.id);
        
//         if (enroll?.length > 0) setIsEnrolled(true);
//       }
//       setLoading(false);
//     }
//     fetchCourseData();
//   }, [courseId]);

//   const handleUpdateContent = async () => {
//     const { error } = await supabase
//       .from('courses')
//       .update({ content: editData.content, demo_video_url: editData.demo_video_url })
//       .eq('id', courseId);
    
//     if (!error) {
//       setIsEditing(false);
//       setCourse({ ...course, ...editData });
//       alert("Course details updated! 🚀");
//     }
//   };

//   const handleEnroll = async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (balance < course.price_coins) return alert("❌ Not enough coins!");

//     const { error } = await supabase.from('enrollments').insert([
//       { learner_id: user.id, course_id: course.id, teacher_id: course.teacher_id }
//     ]);

//     if (!error) {
//       await supabase.from('profiles').update({ coin_balance: balance - course.price_coins }).eq('id', user.id);
//       await fetchBalance();
//       setIsEnrolled(true);
//       alert("Enrolled successfully! You can now schedule a class.");
//     }
//   };

//   if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-bold">Loading Details...</div>;

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 text-white">
//       {/* Top Navigation */}
//       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
//         <ArrowLeft className="w-5 h-5" /> Back to Marketplace
//       </button>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
//         {/* LEFT: Content & Video */}
//         <div className="lg:col-span-2 space-y-8">
//           <header className="space-y-4">
//             <h1 className="text-4xl font-black tracking-tighter">{course.title}</h1>
//             <div className="flex items-center gap-4">
//               <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">{course.category}</span>
//               <span className="text-slate-500">by <span className="text-slate-200 font-bold">{course.profiles?.username}</span></span>
//             </div>
//           </header>

//           {/* Huge Write-up Section */}
//           <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
//             <div className="flex justify-between items-center">
//               <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-500" /> Course Details</h2>
//               {isOwner && (
//                 <button onClick={() => setIsEditing(!isEditing)} className="text-xs bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700 transition">
//                   {isEditing ? "Cancel" : "Edit Description"}
//                 </button>
//               )}
//             </div>

//             {isEditing ? (
//               <div className="space-y-4">
//                 <textarea 
//                   className="w-full h-64 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
//                   value={editData.content}
//                   onChange={(e) => setEditData({...editData, content: e.target.value})}
//                   placeholder="Describe your course in detail..."
//                 />
//                 <input 
//                   type="url" 
//                   className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
//                   value={editData.demo_video_url}
//                   onChange={(e) => setEditData({...editData, demo_video_url: e.target.value})}
//                   placeholder="YouTube Video URL"
//                 />
//                 <button onClick={handleUpdateContent} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-500 transition shadow-lg">Save Changes</button>
//               </div>
//             ) : (
//               <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-lg">
//                 {course.content || "No detailed description added yet. Teacher needs to update this section."}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* RIGHT: Sidebar Enrollment/Scheduling */}
//         <div className="lg:col-span-1">
//           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-24 space-y-6">
//             <div className="text-center pb-6 border-b border-slate-800">
//               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Tuition Fee</p>
//               <h3 className="text-4xl font-black text-emerald-400">🪙 {course.price_coins}</h3>
//             </div>

//             <div className="space-y-4">
//               {isOwner ? (
//                 <div className="p-4 bg-slate-800 rounded-2xl text-center text-slate-400 text-sm italic">
//                   This is your course. You can manage students from your dashboard.
//                 </div>
//               ) : isEnrolled ? (
//                 <>
//                   <div className="flex items-center justify-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold">
//                     <CheckCircle className="w-5 h-5" /> Enrolled
//                   </div>
//                   <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
//                     <Calendar className="w-5 h-5" /> Schedule Live Class
//                   </button>
//                 </>
//               ) : (
//                 <button 
//                   onClick={handleEnroll}
//                   className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
//                 >
//                   Enroll Now
//                 </button>
//               )}
//             </div>

//             <p className="text-[10px] text-center text-slate-600 uppercase font-bold tracking-tighter">
//               Secure coin transaction via learnXchange system
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCoins } from '../context/CoinContext';
import { PlayCircle, Calendar, MessageSquare, Edit3, CheckCircle, ArrowLeft } from 'lucide-react';

// Helper to convert YouTube links to Embed links
const getEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { balance, fetchBalance } = useCoins();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    async function fetchCourseData() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('courses')
        .select(`*, profiles:teacher_id(username)`)
        .eq('id', courseId)
        .single();

      if (data) {
        setCourse(data);
        const { data: enroll } = await supabase.from('enrollments')
          .select('*').eq('course_id', courseId).eq('learner_id', user.id);
        if (enroll?.length > 0) setIsEnrolled(true);
      }
      setLoading(false);
    }
    fetchCourseData();
  }, [courseId]);

  if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-bold">Loading...</div>;

  const embedUrl = getEmbedUrl(course?.demo_video_url);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 text-white">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-4xl font-black">{course.title}</h1>

          {/* VIDEO PLAYER SECTION */}
          {embedUrl ? (
            <div className="aspect-video bg-black rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
              <iframe 
                width="100%" 
                height="100%" 
                src={embedUrl} 
                title="Demo Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500">
              <PlayCircle className="w-12 h-12 mb-2 opacity-20" />
              <p>No demo video provided by the teacher.</p>
            </div>
          )}

          {/* HUGE WRITE-UP */}
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-emerald-400">
              <MessageSquare className="w-5 h-5" /> About this Class
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
              {course.content || "The teacher hasn't added a description yet."}
            </p>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 sticky top-24 space-y-6">
             <div className="text-center">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enrollment Fee</p>
                <h3 className="text-4xl font-black text-emerald-400">🪙 {course.price_coins}</h3>
             </div>
             {isEnrolled ? (
               <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                 <Calendar className="w-5 h-5" /> Schedule Live Class
               </button>
             ) : (
               <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black">
                 Enroll Now
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}