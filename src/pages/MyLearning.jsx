import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCoins } from '../context/CoinContext';
import { 
  ShieldCheck, 
  CheckCircle, 
  RefreshCw, 
  MessageSquare, 
  PlayCircle, 
  Clock, 
  Award, 
  BookOpen, 
  Lock 
} from 'lucide-react';
export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { balance, fetchBalance } = useCoins();
  const CERT_FEE = 500;
  
  const [reviewingCourse, setReviewingCourse] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- FIX 1: Add useEffect to actually trigger the fetch ---
  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: enrollData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`*, courses:course_id (*)`)
        .eq('learner_id', user.id)
        .eq('is_completed', false);

      if (enrollError) throw enrollError;

      const { data: sessionData, error: sessionError } = await supabase
        .from('course_sessions')
        .select('*')
        .eq('learner_id', user.id)
        .eq('status', 'scheduled');

      if (sessionError) throw sessionError;

      const merged = enrollData?.map(enroll => ({
        ...enroll,
        active_session: sessionData?.find(s => String(s.course_id) === String(enroll.course_id))
      })) || [];

      setEnrollments(merged);
    } catch (err) {
      console.error("Sync Failure:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- FIX 2: Move handleTrialDecision ABOVE the loading return ---
  const handleTrialDecision = async (enrollment, continueCourse) => {
    const price = enrollment.courses?.price_coins || 0;
    const teacherId = enrollment.courses?.teacher_id;
    const learnerId = enrollment.learner_id;

    setEnrollments(prev => prev.filter(e => e.id !== enrollment.id));

    try {
      if (continueCourse) {
        const { data: tP } = await supabase.from('profiles').select('coin_balance').eq('id', teacherId).single();
        await supabase.from('profiles').update({ coin_balance: (tP?.coin_balance || 0) + price }).eq('id', teacherId);
        await supabase.from('enrollments').update({ payment_status: 'released', learner_confirmed: true }).eq('id', enrollment.id);
        alert("Full payment released! 🚀");
      } else {
        const teacherCut = Math.floor(price * 0.1);
        const learnerRefund = price - teacherCut;
        const { data: tP } = await supabase.from('profiles').select('coin_balance').eq('id', teacherId).single();
        await supabase.from('profiles').update({ coin_balance: (tP?.coin_balance || 0) + teacherCut }).eq('id', teacherId);
        const { data: lP } = await supabase.from('profiles').select('coin_balance').eq('id', learnerId).single();
        await supabase.from('profiles').update({ coin_balance: (lP?.coin_balance || 0) + learnerRefund }).eq('id', learnerId);
        await supabase.from('enrollments').update({ payment_status: 'refunded', is_completed: true }).eq('id', enrollment.id);
        alert(`🛡️ Refund processed! ${learnerRefund} coins returned.`);
      }
      if (fetchBalance) await fetchBalance();
    } catch (err) {
      console.error("Sync Error:", err);
      fetchEnrollments();
    }
  };

const handlePostReview = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('reviews')
    .insert([{
      course_id: reviewingCourse.course_id,
      learner_id: user.id,
      rating: rating,
      comment: comment
    }]);

  if (error) {
    alert("Error: " + error.message);
  } else {
    // 1. Update the enrollment table so the review button hides
    await supabase
      .from('enrollments')
      .update({ has_reviewed: true })
      .eq('id', reviewingCourse.id);

    alert("Testimonial shared! ⭐");
    setReviewingCourse(null);
    setComment("");
    
    // 2. REFRESH DATA (This replaces the missing handleUpdateCourse)
    fetchEnrollments(); 
  }
  setSubmitting(false);
};
    return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 text-white min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">My Learning</h1>
          <p className="text-slate-400 mt-1 font-medium italic">Peer-to-peer exchange progress tracker.</p>
        </div>
        <button 
          onClick={fetchEnrollments}
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-emerald-500 shadow-2xl hover:rotate-180 duration-500"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {enrollments.length > 0 ? enrollments.map((item) => {
          const total = item.courses?.total_sessions || 1;
          const progress = Math.min(100, (item.sessions_attended / total) * 100);
          const isFinished = progress >= 100;
          
          // ALOKI 2.0 Logic: Show decision card ONLY after 1st session is attended and payment is in escrow
          const showTrialDecision = item.sessions_attended === 1 && item.payment_status === 'escrow' && !item.learner_confirmed;

          return (
            <div key={item.id} className="flex flex-col gap-4">
              <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden flex flex-col md:flex-row shadow-2xl hover:border-emerald-500/20 transition-all">
                
                {/* Image Preview */}
                <div className="md:w-80 h-52 md:h-auto bg-slate-800 relative group shrink-0">
                  <img src={item.courses.image_url} className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#020617]/80 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <BookOpen className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-3xl font-black text-white leading-tight tracking-tighter">{item.courses.title}</h3>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                          Status: {item.payment_status === 'escrow' ? '🛡️ Protected by Escrow' : '✅ Payment Released'}
                        </p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isFinished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {isFinished ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-emerald-500" /> {item.courses.schedule_days}</div>
                          <div className="flex items-center gap-2">@{item.courses.schedule_time}</div>
                        </div>
                        <span className="text-emerald-400 font-black text-sm">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5 mt-8">
                    {item.active_session ? (
                      <button 
                        onClick={() => window.open(item.active_session.meeting_link, '_blank')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 animate-pulse shadow-xl shadow-emerald-900/30"
                      >
                        <PlayCircle className="w-5 h-5" /> JOIN LIVE CLASS
                      </button>
                    ) : (
                      <div className="flex-1 bg-slate-800/50 text-slate-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-800 cursor-default">
                        <Clock className="w-5 h-5" /> NEXT SESSION SCHEDULED
                      </div>
                    )}
                    
                    {isFinished ? (
                      <div className="flex-1 flex gap-2">
                        <button 
                          onClick={() => !item.certificate_unlocked && handleUnlockCertificate(item)}
                          className={`flex-1 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${item.certificate_unlocked ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                          <Award className="w-5 h-5" /> 
                          {item.certificate_unlocked ? "VIEW CERTIFICATE" : `CLAIM (🪙 ${CERT_FEE})`}
                        </button>
                        
                        {!item.has_reviewed && (
                          <button 
                            onClick={() => setReviewingCourse(item)}
                            className="px-6 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 bg-slate-800/30 text-slate-700 font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-800/50 opacity-50">
                        <Lock className="w-4 h-4" /> REWARD LOCKED
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TRIAL DECISION CARD: This is the new ALOKI Shield Logic */}
              {showTrialDecision && (
                <div className="mx-4 md:mx-12 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-emerald-500/20 rounded-3xl text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <RefreshCw className="w-8 h-8 animate-spin-slow" />
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-xl font-black text-white tracking-tight italic uppercase">1st Session Verified</h4>
                        <p className="text-sm text-slate-400 mt-1 max-w-sm font-medium">
                          How was your trial session? You can now release the full payment to the mentor OR claim a 90% refund.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <button 
                        onClick={() => handleTrialDecision(item, true)}
                        className="flex-1 md:px-8 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-900/20"
                      >
                        CONTINUE LEARNING
                      </button>
                      <button 
                        onClick={() => handleTrialDecision(item, false)}
                        className="flex-1 md:px-8 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 py-4 rounded-2xl font-black transition-all border border-white/5"
                      >
                        QUIT & REFUND (90%)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-40 bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-slate-800">
            <BookOpen className="w-16 h-16 text-slate-800 mx-auto mb-6" />
            <p className="text-slate-600 font-black uppercase tracking-[0.3em]">No Active Paths</p>
            <p className="text-slate-700 text-sm mt-2 font-medium italic">Explore the marketplace to find your next exchange.</p>
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {reviewingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">Rate your Experience</h2>
            <p className="text-slate-400 text-sm mb-8 font-medium italic">Mentorship: {reviewingCourse.courses.title}</p>

            <form onSubmit={handlePostReview} className="space-y-8 text-center">
              <div className="flex justify-center gap-4 text-4xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-all duration-300 transform hover:scale-125 ${rating >= star ? 'text-yellow-400 drop-shadow-md' : 'text-slate-800'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                required
                placeholder="Share a testimonial for your mentor..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl p-6 text-white focus:outline-none focus:border-emerald-500 transition-all h-40 font-medium"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setReviewingCourse(null)}
                  className="flex-1 py-4 font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-emerald-900/40 disabled:opacity-50 uppercase tracking-widest"
                >
                  {submitting ? 'Syncing...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}