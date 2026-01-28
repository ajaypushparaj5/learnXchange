
// import { useParams, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useCoins } from '../context/CoinContext';
// import { Star, User ,PlayCircle, Calendar, MessageSquare, Edit3, CheckCircle, ArrowLeft , ShieldCheck} from 'lucide-react';

// // Helper to convert YouTube links to Embed links
// const getEmbedUrl = (url) => {
//   if (!url) return null;
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//   const match = url.match(regExp);
//   return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
// };

// const handleEnroll = async () => {
//   // 1. Confirmation Prompt
//   const confirmEnroll = window.confirm(
//     `Are you sure you want to enroll in "${course.title}" for ${course.price_coins} coins?`
//   );
//   if (!confirmEnroll) return;

//   // 2. Check Balance
//   if (balance < course.price_coins) {
//     alert("❌ Insufficient balance. Please earn more coins by teaching!");
//     return;
//   }

//   const { data: { user } } = await supabase.auth.getUser();

//   // 3. Create Enrollment Record
//   const { error: enrollError } = await supabase
//     .from('enrollments')
//     .insert([
//       { 
//         learner_id: user.id, 
//         course_id: course.id, 
//         teacher_id: course.teacher_id,
//         sessions_attended: 0,
//         is_completed: false
//       }
//     ]);

//   if (enrollError) {
//     alert("Error enrolling: " + enrollError.message);
//     return;
//   }

//   // 4. Deduct Coins from Student Profile
//   const { error: balanceError } = await supabase
//     .from('profiles')
//     .update({ coin_balance: balance - course.price_coins })
//     .eq('id', user.id);

//   if (!balanceError) {
//     fetchBalance(); // Update the global navbar balance
//     setIsEnrolled(true);
//     alert("🎉 Successfully Enrolled! You can find this in 'My Learning'.");
//   } else {
//     alert("Error updating balance: " + balanceError.message);
//   }
// };

// export default function CoursePage() {
//   const { courseId } = useParams();
//   const navigate = useNavigate();
//   const { balance, fetchBalance } = useCoins();
  
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isEnrolled, setIsEnrolled] = useState(false);
  
//   const handleEnroll = async () => {
//   if (!course) return;

//   const confirmEnroll = window.confirm(`Enroll in "${course.title}" for ${course.price_coins} coins?`);
//   if (!confirmEnroll) return;

//   if (balance < course.price_coins) {
//     alert("❌ Insufficient balance!");
//     return;
//   }

//   const { data: { user } } = await supabase.auth.getUser();

//   // 1. Create the Enrollment
//   const { data: enrollment, error: enrollError } = await supabase
//     .from('enrollments')
//     .insert([
//       { 
//         learner_id: user.id, 
//         course_id: course.id, 
//         teacher_id: course.teacher_id,
//         sessions_attended: 0
//       }
//     ])
//     .select()
//     .single();

//   if (enrollError) return alert("Enrollment failed: " + enrollError.message);

//   // 2. Create the FIRST Live Session automatically
//   // This ensures the teacher sees it in their dashboard immediately
//   const { error: sessionError } = await supabase
//     .from('course_sessions')
//     .insert([
//       {
//         course_id: course.id,
//         teacher_id: course.teacher_id,
//         learner_id: user.id,
//         enrollment_id: enrollment.id,
//         scheduled_at: new Date().toISOString(), // Default to "Now" or a future date
//         status: 'scheduled',
//         meeting_link: 'https://meet.google.com/new' // Placeholder link
//       }
//     ]);

//   if (sessionError) console.error("Session creation error:", sessionError);

//   // 3. Deduct Coins
//   const { error: balanceError } = await supabase
//     .from('profiles')
//     .update({ coin_balance: balance - course.price_coins })
//     .eq('id', user.id);

//   if (!balanceError) {
//     await fetchBalance();
//     setIsEnrolled(true);
//     alert("🎉 Enrolled! The teacher has been notified and a session is created.");
//   }
// };

//   useEffect(() => {
//     async function fetchCourseData() {
//       const { data: { user } } = await supabase.auth.getUser();
//       const { data } = await supabase
//         .from('courses')
//         .select(`*, profiles:teacher_id(username)`)
//         .eq('id', courseId)
//         .single();

//       if (data) {
//         setCourse(data);
//         const { data: enroll } = await supabase.from('enrollments')
//           .select('*').eq('course_id', courseId).eq('learner_id', user.id);
//         if (enroll?.length > 0) setIsEnrolled(true);
//       }
//       setLoading(false);
//     }
//     fetchCourseData();
//   }, [courseId]);

//   if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-bold">Loading...</div>;

//   const embedUrl = getEmbedUrl(course?.demo_video_url);

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 text-white">
//       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
//         <ArrowLeft className="w-5 h-5" /> Back
//       </button>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
//         <div className="lg:col-span-2 space-y-8">
//           <h1 className="text-4xl font-black">{course.title}</h1>

//           {/* VIDEO PLAYER SECTION */}
//           {embedUrl ? (
//             <div className="aspect-video bg-black rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
//               <iframe 
//                 width="100%" 
//                 height="100%" 
//                 src={embedUrl} 
//                 title="Demo Video"
//                 frameBorder="0" 
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
//                 allowFullScreen
//               ></iframe>
//             </div>
//           ) : (
//             <div className="aspect-video bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500">
//               <PlayCircle className="w-12 h-12 mb-2 opacity-20" />
//               <p>No demo video provided by the teacher.</p>
//             </div>
//           )}

//           {/* HUGE WRITE-UP */}
//           <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
//             <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-emerald-400">
//               <MessageSquare className="w-5 h-5" /> About this Class
//             </h2>
//             <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
//               {course.content || "The teacher hasn't added a description yet."}
//             </p>
//           </div>
//         </div>

//         {/* SIDEBAR */}
//         <div className="lg:col-span-1">
//           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 sticky top-24 space-y-6">
//              <div className="text-center">
//                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enrollment Fee</p>
//                 <h3 className="text-4xl font-black text-emerald-400">🪙 {course.price_coins}</h3>
//              </div>
//              <div className="p-4 bg-slate-800/50 rounded-2xl space-y-2">
//                 <div className="flex justify-between text-sm"><span className="text-slate-500">Schedule</span><span className="text-emerald-400 font-bold">{course.schedule_days}</span></div>
//                 <div className="flex justify-between text-sm"><span className="text-slate-500">Time</span><span className="text-emerald-400 font-bold">{course.schedule_time}</span></div>
//                 <div className="flex justify-between text-sm"><span className="text-slate-500">Rating</span><span className="text-yellow-500 font-bold">⭐ {course.average_rating}</span></div>
//                 </div>
//              {/* {isEnrolled ? (
//                <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2">
//                  <Calendar className="w-5 h-5" /> Schedule Live Class
//                </button>
//              ) : (
//                <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black">
//                  Enroll Now
//                </button>
//              )} */}
//             {isEnrolled ? (
//             <button 
//                 onClick={() => navigate('/learning')}
//                 className="w-full bg-slate-800 text-emerald-400 py-4 rounded-2xl font-black flex items-center justify-center gap-2 border border-emerald-500/20"
//             >
//                 <CheckCircle className="w-5 h-5" /> Already Enrolled - View Progress
//             </button>
//             ) : (
//             <button 
//                 onClick={handleEnroll}
//                 className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
//             >
//                 Enroll Now
//             </button>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCoins } from '../context/CoinContext';
import { 
  ArrowLeft, PlayCircle, MessageSquare, CheckCircle, 
  ShieldCheck, Star, Users, Clock, Calendar 
} from 'lucide-react';

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { balance, fetchBalance } = useCoins();
  
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Helper to handle video URLs
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  useEffect(() => {
    async function fetchFullCourseData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Fetch Course with Teacher Profile
      const { data: courseData } = await supabase
        .from('courses')
        .select(`*, profiles:teacher_id(username, avatar_url)`)
        .eq('id', courseId)
        .single();

      if (courseData) {
        setCourse(courseData);

        // 2. Fetch Reviews for this course
        const { data: reviewData } = await supabase
          .from('reviews')
          .select(`*, profiles:learner_id(username)`)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
        setReviews(reviewData || []);

        // 3. Check Enrollment Status
        if (user) {
          const { data: enroll } = await supabase.from('enrollments')
            .select('*').eq('course_id', courseId).eq('learner_id', user.id);
          if (enroll?.length > 0) setIsEnrolled(true);
        }
      }
      setLoading(false);
    }
    fetchFullCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    const confirmEnroll = window.confirm(`Enroll in "${course.title}" for ${course.price_coins} coins?\n\nNote: 90% Refund available after the first session!`);
    if (!confirmEnroll) return;
    if (balance < course.price_coins) return alert("❌ Insufficient balance!");

    const { data: { user } } = await supabase.auth.getUser();

    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert([{ 
        learner_id: user.id, 
        course_id: course.id, 
        teacher_id: course.teacher_id,
        sessions_attended: 0,
        payment_status: 'escrow' // Added for Aloki 2.0 Credibility
      }])
      .select().single();

    if (enrollError) return alert("Enrollment failed: " + enrollError.message);

    await supabase.from('course_sessions').insert([{
      course_id: course.id,
      teacher_id: course.teacher_id,
      learner_id: user.id,
      enrollment_id: enrollment.id,
      scheduled_at: new Date().toISOString(),
      status: 'scheduled',
      meeting_link: 'https://meet.google.com/new' 
    }]);

    await supabase.from('profiles').update({ coin_balance: balance - course.price_coins }).eq('id', user.id);
    await fetchBalance();
    setIsEnrolled(true);
    alert("🎉 Successfully Enrolled! Check 'My Learning' to attend your first session.");
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
    </div>
  );

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "New";

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 text-white min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 font-bold transition-all">
        <ArrowLeft className="w-5 h-5" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <header className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter leading-tight">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-sm">{avgRating}</span>
                <span className="text-slate-500 text-xs">({reviews.length} Reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold tracking-tight">Mentored by @{course.profiles?.username}</span>
              </div>
            </div>
          </header>

          {/* Video Player */}
          <div className="aspect-video bg-black rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl group relative">
            {getEmbedUrl(course.demo_video_url) ? (
              <iframe width="100%" height="100%" src={getEmbedUrl(course.demo_video_url)} title="Demo" frameBorder="0" allowFullScreen></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/40">
                <PlayCircle className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-500 font-bold">No Preview Available</p>
              </div>
            )}
          </div>

          {/* Content Description */}
          <div className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800/50">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <MessageSquare className="text-emerald-500" /> Syllabus & About
            </h2>
            <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
              {course.content}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Star className="text-yellow-500" /> Student Feedback
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 bg-slate-900 rounded-3xl border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex text-yellow-500"><Star size={12} fill="currentColor" /></div>
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Verified Learner</span>
                  </div>
                  <p className="text-slate-300 italic mb-4">"{rev.comment}"</p>
                  <p className="text-xs font-black text-emerald-500 uppercase tracking-tighter">@{rev.profiles?.username}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-slate-600 font-bold col-span-2 text-center py-10 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">No reviews yet.</p>}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-10 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl space-y-8">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Full Exchange Fee</span>
                <h3 className="text-5xl font-black text-white mt-1">🪙 {course.price_coins}</h3>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tight"><Calendar size={14} /> Schedule</div>
                  <span className="text-sm font-black text-emerald-400">{course.schedule_days}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tight"><Clock size={14} /> Time</div>
                  <span className="text-sm font-black text-emerald-400">{course.schedule_time}</span>
                </div>
              </div>

              {isEnrolled ? (
                <button onClick={() => navigate('/learning')} className="w-full bg-slate-800 text-emerald-400 py-5 rounded-2xl font-black border border-emerald-500/20 flex items-center justify-center gap-2">
                  <CheckCircle size={20} /> ALREADY ENROLLED
                </button>
              ) : (
                <button onClick={handleEnroll} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-900/30 transition-all active:scale-95">
                  ENROLL NOW
                </button>
              )}
            </div>

            {/* Credibility Card */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2.5rem] flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm text-emerald-400 uppercase tracking-tighter">LearnXchange Shield</h4>
                <p className="text-[11px] text-slate-400 leading-snug mt-1">
                  Enjoy a 1-session trial. Not happy? Claim a <b>90% refund</b> immediately. Your coins are protected in escrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}