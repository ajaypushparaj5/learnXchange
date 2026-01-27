import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCoins } from '../context/CoinContext';
import { BookOpen, Award, PlayCircle, Clock, RefreshCw, CheckCircle, Lock, ExternalLink } from 'lucide-react';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { balance, fetchBalance } = useCoins();
  const CERT_FEE = 500;

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Fetch Enrollments with Course Details
    // Inside MyLearning.jsx -> fetchEnrollments()
const { data: enrollData, error } = await supabase
  .from('enrollments')
  .select(`
    *,
    courses:course_id (*) 
  `)
  .eq('learner_id', user.id);

if (error) console.error("Enrollment Error:", error);

    // 2. Fetch Active/Scheduled Sessions for these courses
    const { data: sessionData } = await supabase
      .from('course_sessions')
      .select('*')
      .eq('learner_id', user.id)
      .eq('status', 'scheduled');

    // 3. Merge Session Links into the Enrollment data
    // Ensure IDs match regardless of being a string or number
const merged = enrollData?.map(enroll => ({
  ...enroll,
  active_session: sessionData?.find(s => String(s.course_id) === String(enroll.course_id))
})) || [];

    setEnrollments(merged);
    setLoading(false);
  }

  const handleUnlockCertificate = async (enrollment) => {
    if (balance < CERT_FEE) return alert("You need 500 coins to unlock this certificate!");
    
    if (window.confirm(`Unlock your official certificate for ${enrollment.courses.title} for ${CERT_FEE} coins?`)) {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update Enrollment Record
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ certificate_unlocked: true })
        .eq('id', enrollment.id);

      if (!updateError) {
        // Deduct Coins from Profile
        await supabase.from('profiles').update({ coin_balance: balance - CERT_FEE }).eq('id', user.id);
        fetchBalance();
        fetchEnrollments();
        alert("Certificate Unlocked! 🎓 Visit your profile to view it.");
      }
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#020617]">
      <div className="animate-pulse text-emerald-500 font-black text-xl tracking-tighter">
        SYNCING YOUR PROGRESS...
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 text-white min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">My Learning</h1>
          <p className="text-slate-400 mt-1">Track your growth and attend scheduled sessions.</p>
        </div>
        <button 
          onClick={fetchEnrollments}
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-emerald-500 shadow-xl"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {enrollments.length > 0 ? enrollments.map((item) => {
          const total = item.courses?.total_sessions || 1;
          const progress = Math.min(100, (item.sessions_attended / total) * 100);
          const isFinished = progress >= 100;

          return (
            <div key={item.id} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden flex flex-col md:flex-row shadow-2xl hover:border-emerald-500/20 transition-all">
              
              {/* Image Preview */}
              <div className="md:w-72 h-48 md:h-auto bg-slate-800 relative group">
                <img src={item.courses.image_url} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-[#020617]/80 p-4 rounded-full border border-white/10 backdrop-blur-sm">
                      <BookOpen className="w-8 h-8 text-emerald-500" />
                   </div>
                </div>
              </div>

              {/* Content Box */}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-white leading-tight">{item.courses.title}</h3>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFinished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {isFinished ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <div className="flex gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> {item.courses.schedule_days}</div>
                    <div className="flex items-center gap-2">@{item.courses.schedule_time}</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-slate-400">Class Progress</span>
                      <span className="text-emerald-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      {item.sessions_attended} of {total} Sessions Attended
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                  {item.active_session ? (
                    <button 
                      onClick={() => window.open(item.active_session.meeting_link, '_blank')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 animate-pulse shadow-lg shadow-emerald-900/40"
                    >
                      <PlayCircle className="w-5 h-5" /> Attend Live Session
                    </button>
                  ) : (
                    <div className="flex-1 bg-slate-800/50 text-slate-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-800 cursor-default">
                      <Clock className="w-5 h-5" /> Next Session Scheduled
                    </div>
                  )}
                  
                  {isFinished ? (
                    <button 
                      onClick={() => !item.certificate_unlocked && handleUnlockCertificate(item)}
                      className={`flex-1 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${item.certificate_unlocked ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      <Award className="w-5 h-5" /> 
                      {item.certificate_unlocked ? "View Certificate" : `Claim Certificate (🪙 ${CERT_FEE})`}
                    </button>
                  ) : (
                    <div className="flex-1 bg-slate-800/30 text-slate-700 font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-800/50 opacity-50">
                      <Lock className="w-4 h-4" /> Certificate Locked
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-32 bg-slate-900/30 rounded-[3.5rem] border-2 border-dashed border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-600 font-black uppercase tracking-tighter">No Active Learning Paths</p>
            <p className="text-slate-700 text-sm mt-1">Enroll in a course from the marketplace to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}