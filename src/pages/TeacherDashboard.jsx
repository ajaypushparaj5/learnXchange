
// import { useState, useEffect, useCallback } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { 
//   BookOpen, Calendar, Clock, Video, CheckCircle, 
//   Edit3, Save, X, Image as ImageIcon, MessageSquare 
// } from 'lucide-react';

// export default function TeacherDashboard({ session }) {
//   const [activeTab, setActiveTab] = useState('courses');
//   const [myCourses, setMyCourses] = useState([]);
//   const [upcomingSessions, setUpcomingSessions] = useState([]);
//   const [pendingEnrollments, setPendingEnrollments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingCourse, setEditingCourse] = useState(null);


// useEffect(() => {
//   async function loadTeacherData() {
//     if (!session?.user?.id) return;
//     setLoading(true);

//     try {
//       // 1. Fetch Teacher's Courses
//       const { data: courses } = await supabase
//         .from('courses')
//         .select('*')
//         .eq('teacher_id', session.user.id);
//       setMyCourses(courses || []);

//       // 2. Fetch Scheduled Sessions (Simple Fetch)
//       const { data: sessions, error: sessError } = await supabase
//         .from('course_sessions')
//         .select('*, courses:course_id(title)')
//         .eq('teacher_id', session.user.id)
//         .eq('status', 'scheduled');

//       if (sessError) throw sessError;

//       // 3. Manual Join for Profiles (Learner Names)
//       const learnerIds = [...new Set(sessions.map(s => s.learner_id))];
//       if (learnerIds.length > 0) {
//         const { data: profiles } = await supabase
//           .from('profiles')
//           .select('id, username')
//           .in('id', learnerIds);

//         // Merge profiles back into sessions
//         const mergedSessions = sessions.map(sess => ({
//           ...sess,
//           profiles: profiles?.find(p => p.id === sess.learner_id)
//         }));
//         setUpcomingSessions(mergedSessions);
//       } else {
//         setUpcomingSessions([]);
//       }

//       // 4. Fetch Enrollments for "Schedule Next" Section
//       const { data: enrolls, error: enrollError } = await supabase
//         .from('enrollments')
//         .select('*, courses:course_id(title, total_sessions)')
//         .eq('teacher_id', session.user.id)
//         .eq('is_completed', false);

//       if (enrollError) throw enrollError;
      
//       // Merge learner profiles into enrollments manually
//       const enrollmentLearnerIds = [...new Set(enrolls.map(e => e.learner_id))];
//       if (enrollmentLearnerIds.length > 0) {
//         const { data: enrollProfiles } = await supabase
//           .from('profiles')
//           .select('id, username')
//           .in('id', enrollmentLearnerIds);

//         const mergedEnrolls = enrolls.map(enroll => ({
//           ...enroll,
//           learner: enrollProfiles?.find(p => p.id === enroll.learner_id)
//         }));
//         setPendingEnrollments(mergedEnrolls);
//       } else {
//         setPendingEnrollments([]);
//       }

//     } catch (err) {
//       console.error("Dashboard Sync Error:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   }
//   loadTeacherData();
// }, [session]);

//   // 2. Action Handlers
//   const handleScheduleNext = async (enrollment) => {
//     const nextDate = window.prompt("Enter date & time (YYYY-MM-DD HH:MM):", "2026-02-01 14:00");
//     if (!nextDate) return;

//     const { error } = await supabase
//       .from('course_sessions')
//       .insert([{
//         course_id: enrollment.course_id,
//         teacher_id: session.user.id,
//         learner_id: enrollment.learner_id,
//         enrollment_id: enrollment.id,
//         scheduled_at: new Date(nextDate).toISOString(),
//         status: 'scheduled',
//         meeting_link: 'https://meet.google.com/new' 
//       }]);

//     if (error) {
//       alert("Error: " + error.message);
//     } else {
//       alert("Session scheduled successfully! 📅");
//       loadTeacherData(); 
//     }
//   };

//   const handleCompleteSession = async (sessionItem) => {
//     if (!window.confirm("Mark as finished? Student progress will increase.")) return;

//     // Direct fetch of current progress to prevent NaN math errors
//     const { data: currentEnroll, error: fetchError } = await supabase
//       .from('enrollments')
//       .select('sessions_attended')
//       .eq('id', sessionItem.enrollment_id)
//       .single();

//     if (fetchError) return alert("Sync failed: " + fetchError.message);

//     const nextCount = (currentEnroll.sessions_attended || 0) + 1;

//     // Update Enrollment progress
//     const { error: enrollError } = await supabase
//       .from('enrollments')
//       .update({ sessions_attended: nextCount })
//       .eq('id', sessionItem.enrollment_id);

//     if (enrollError) return alert("Update failed: " + enrollError.message);

//     // Close the current session record
//     await supabase
//       .from('course_sessions')
//       .update({ status: 'completed' })
//       .eq('id', sessionItem.id);

//     alert(`Progress updated to session ${nextCount}! ✅`);
//     loadTeacherData(); 
//   };

//   const handleUpdateCourse = async (e) => {
//     e.preventDefault();
//     const { error } = await supabase
//       .from('courses')
//       .update({
//         content: editingCourse.content,
//         image_url: editingCourse.image_url,
//         demo_video_url: editingCourse.demo_video_url,
//         price_coins: editingCourse.price_coins,
//         total_sessions: editingCourse.total_sessions,
//         schedule_days: editingCourse.schedule_days || '',
//         schedule_time: editingCourse.schedule_time || '12:00:00'
//       })
//       .eq('id', editingCourse.id);

//     if (!error) {
//       setEditingCourse(null);
//       loadTeacherData();
//       alert("Class updated successfully! 🚀");
//     }
//   };

//   if (loading) return (
//     <div className="p-20 text-center text-emerald-500 font-bold animate-pulse bg-[#020617] h-screen">
//       SYNCING TEACHER RECORDS...
//     </div>
//   );

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  BookOpen, Calendar, Clock, Video, CheckCircle, 
  Edit3, Save, X, Image as ImageIcon, MessageSquare 
} from 'lucide-react';

export default function TeacherDashboard({ session }) {
  const [activeTab, setActiveTab] = useState('courses');
  const [myCourses, setMyCourses] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);

  // 1. Move loadTeacherData OUT of useEffect so handlers can see it
  const loadTeacherData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    try {
      // A. Fetch Courses
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', session.user.id);
      setMyCourses(courses || []);

      // B. Fetch Sessions & Manual Join Profiles
      const { data: sessions } = await supabase
        .from('course_sessions')
        .select('*, courses:course_id(title)')
        .eq('teacher_id', session.user.id)
        .eq('status', 'scheduled');

      if (sessions?.length > 0) {
        const learnerIds = [...new Set(sessions.map(s => s.learner_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', learnerIds);

        setUpcomingSessions(sessions.map(s => ({
          ...s,
          profiles: profiles?.find(p => p.id === s.learner_id)
        })));
      } else {
        setUpcomingSessions([]);
      }

      // C. Fetch Enrollments & Manual Join Profiles
      const { data: enrolls } = await supabase
        .from('enrollments')
        .select('*, courses:course_id(title, total_sessions), payment_status')
        .eq('teacher_id', session.user.id)
        .eq('is_completed', false);

      if (enrolls?.length > 0) {
        const enrollLearnerIds = [...new Set(enrolls.map(e => e.learner_id))];
        const { data: enrollProfiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', enrollLearnerIds);

        setPendingEnrollments(enrolls.map(e => ({
          ...e,
          learner: enrollProfiles?.find(p => p.id === e.learner_id)
        })));
      } else {
        setPendingEnrollments([]);
      }

    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Trigger load on mount
  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  // 2. Action Handlers - Now they can successfully call loadTeacherData()
  const handleCompleteSession = async (sessionItem) => {

    console.log("Updating Enrollment ID:", sessionItem.enrollment_id); // Check your console!
  
  if (!sessionItem.enrollment_id) {
    return alert("Error: This session is not linked to an enrollment ID.");
  }

    if (!window.confirm("Mark as finished?")) return;

    const { data: currentEnroll } = await supabase
      .from('enrollments')
      .select('sessions_attended')
      .eq('id', sessionItem.enrollment_id)
      .single();

    const nextCount = (currentEnroll?.sessions_attended || 0) + 1;

    await supabase
      .from('enrollments')
      .update({ sessions_attended: nextCount })
      .eq('id', sessionItem.enrollment_id);

    await supabase
      .from('course_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionItem.id);

    alert("Progress updated! ✅");
    loadTeacherData(); // This will no longer throw ReferenceError
  };

  const handleScheduleNext = async (enrollment) => {
    const nextDate = window.prompt("Enter date (YYYY-MM-DD HH:MM):", "2026-02-01 14:00");
    if (!nextDate) return;

    const { error } = await supabase
      .from('course_sessions')
      .insert([{
        course_id: enrollment.course_id,
        teacher_id: session.user.id,
        learner_id: enrollment.learner_id,
        enrollment_id: enrollment.id,
        scheduled_at: new Date(nextDate).toISOString(),
        status: 'scheduled',
        meeting_link: 'https://meet.google.com/new' 
      }]);

    if (!error) {
      alert("Scheduled! 📅");
      loadTeacherData();
    }
  };

  const handleUpdateCourse = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { error } = await supabase
      .from('courses')
      .update({
        title: editingCourse.title,
        description: editingCourse.description,
        price_coins: editingCourse.price_coins,
        category: editingCourse.category,
        schedule_days: editingCourse.schedule_days,
        schedule_time: editingCourse.schedule_time,
        demo_video_url: editingCourse.demo_video_url,
        content: editingCourse.content
      })
      .eq('id', editingCourse.id);

    if (error) throw error;

    alert("Class configuration updated successfully! 🚀");
    setEditingCourse(null); // Close the modal
    
    // REFRESH DATA
    if (typeof loadTeacherData === 'function') {
      await loadTeacherData(); 
    }
  } catch (error) {
    alert("Update failed: " + error.message);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <div className="p-20 text-center text-emerald-500 font-bold animate-pulse">Syncing...</div>;

return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 text-white min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Teacher Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your expertise and student sessions.</p>
        </div>
        
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
                <div className="flex gap-2 mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                   <span className="bg-slate-800 px-2 py-1 rounded">{course.schedule_days || 'No Schedule'}</span>
                   <span className="bg-slate-800 px-2 py-1 rounded">{course.total_sessions || '0'} Sessions</span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {course.content || "No detailed description set yet."}
                </p>
              </div>
              <button 
                onClick={() => setEditingCourse(course)}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Edit Class Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Active Schedule */}
          <section className="space-y-4">
            <h3 className="text-emerald-500 font-black uppercase text-xs tracking-widest ml-2">Scheduled Sessions</h3>
            {upcomingSessions.length > 0 ? upcomingSessions.map(sess => (
              <div key={sess.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-5">
                  <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white leading-tight">{sess.courses?.title}</h4>
                    {/* Fixed Learner Name for Scheduled Sessions */}
                    <p className="text-slate-400 text-sm font-medium">
                      Learner: <span className="text-emerald-400 font-bold">@{sess.profiles?.username || 'Unknown'}</span>
                    </p>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mt-2 bg-slate-800 w-fit px-2 py-1 rounded">
                      <Calendar className="w-3 h-3" /> {new Date(sess.scheduled_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button 
                    className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl"
                    onClick={() => window.open(sess.meeting_link || 'https://meet.google.com/new', '_blank')}
                  >
                    <Video className="w-5 h-5" /> Join Class
                  </button>
                  <button 
                    className="bg-slate-800 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    onClick={() => handleCompleteSession(sess)}
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Complete
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-slate-900/30 rounded-[3rem] border border-slate-800 border-dashed">
                <p className="text-slate-600 italic">No classes scheduled for today.</p>
              </div>
            )}
          </section>

          {/* Section 2: Book Next Session List */}
          <section className="space-y-4">
            <h3 className="text-slate-500 font-black uppercase text-xs tracking-widest ml-2">Students Awaiting Scheduling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingEnrollments.length > 0 ? pendingEnrollments.map(enroll => (
                <div key={enroll.id} className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white leading-tight">{enroll.courses?.title}</h4>
                    {/* Fixed Student Name for Pending Enrollments using 'learner' alias */}
                    <p className="text-xs text-slate-500 mb-2 font-medium">
                      Student: <span className="text-emerald-400 font-bold">@{enroll.learner?.username || 'Unknown'}</span>
                    </p>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(enroll.sessions_attended / (enroll.courses?.total_sessions || 1)) * 100}%` }} />
                       </div>
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                         {enroll.sessions_attended}/{enroll.courses?.total_sessions} Class Done
                       </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleScheduleNext(enroll)}
                    className="p-4 bg-emerald-600/10 text-emerald-500 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-xl"
                  >
                    <Calendar className="w-6 h-6" />
                  </button>
                </div>
              )) : (
                <div className="md:col-span-2 text-center py-12 bg-slate-900/30 rounded-[3rem] border border-slate-800 border-dashed">
                  <p className="text-slate-600 italic">No pending enrollments to schedule.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Editing Modal remains the same */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleUpdateCourse} className="bg-slate-900 border border-slate-800 w-full max-w-3xl p-8 rounded-[3rem] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
             <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-emerald-500 tracking-tighter uppercase italic">Refine Class Setup</h2>
              <button type="button" onClick={() => setEditingCourse(null)} className="p-2 hover:bg-slate-800 rounded-full transition"><X /></button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">
                    <ImageIcon className="w-3 h-3 text-emerald-500" /> Header Image URL
                  </label>
                  <input 
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingCourse.image_url || ''}
                    onChange={e => setEditingCourse({...editingCourse, image_url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">
                    <Video className="w-3 h-3 text-emerald-500" /> Demo Video Link
                  </label>
                  <input 
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editingCourse.demo_video_url || ''}
                    onChange={e => setEditingCourse({...editingCourse, demo_video_url: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">
                  <MessageSquare className="w-3 h-3 text-emerald-500" /> Full Curriculum Details
                </label>
                <textarea 
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white h-40 outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed text-sm"
                  value={editingCourse.content || ''}
                  onChange={e => setEditingCourse({...editingCourse, content: e.target.value})}
                />
              </div>

              <div className="bg-slate-800/30 p-6 rounded-[2rem] border border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                    <label className="text-[10px] uppercase font-black text-slate-500 mb-2 block">Classes</label>
                    <input type="number" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl"
                      value={editingCourse.total_sessions || ''} onChange={e => setEditingCourse({...editingCourse, total_sessions: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-500 mb-2 block">Days</label>
                    <input type="text" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl"
                      value={editingCourse.schedule_days || ''} onChange={e => setEditingCourse({...editingCourse, schedule_days: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-500 mb-2 block">Time</label>
                    <input type="time" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl"
                      value={editingCourse.schedule_time || ''} onChange={e => setEditingCourse({...editingCourse, schedule_time: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
              <Save className="w-5 h-5" /> Commit Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}