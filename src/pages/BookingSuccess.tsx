import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { motion } from "motion/react";
import { CheckCircle, Heart, ChevronRight, Share2 } from "lucide-react";

export function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const hallId = searchParams.get("hall_id");
    const date = searchParams.get("date");
    const userId = searchParams.get("user_id");

    if (sessionId && hallId && date && userId && !saved) {
      async function saveBooking() {
        try {
          await addDoc(collection(db, "bookings"), {
            hallId,
            userId,
            date,
            stripeSessionId: sessionId,
            status: "confirmed",
            depositPaid: true,
            createdAt: serverTimestamp(),
          });
          setSaved(true);
        } catch (error) {
          console.error("Error saving booking:", error);
        }
      }
      saveBooking();
    }
  }, [searchParams, saved]);

  const handleShare = () => {
    const text = `تم حجز قاعة أحلامي! التاريخ: ${searchParams.get("date")}. تابع تفاصيل المناسبة معنا!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-surface-dark border border-white/10 rounded-[3.5rem] p-16 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-accent rounded-b-full"></div>
        
        <div className="w-28 h-28 bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
           <CheckCircle className="w-14 h-14" />
        </div>
        
        <h1 className="font-display text-5xl font-black text-white mb-6 tracking-tight">تم الحجز بنجاح!</h1>
        <p className="text-zinc-500 mb-12 leading-relaxed text-lg">
          لقد أتممت خطوتك الأولى نحو ليلة العمر المثالية. <br /> تهانينا للعروسين مقدمًا
          <Heart className="inline-block w-5 h-5 text-accent mx-2 fill-accent animate-pulse" />
        </p>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 mb-12 flex items-center justify-between text-right">
           <div className="space-y-1">
              <span className="text-[10px] text-accent uppercase font-black tracking-[0.2em]">تاريخ الحجز</span>
              <p className="font-black text-white text-xl">{searchParams.get("date")}</p>
           </div>
           <div className="w-px h-12 bg-white/10"></div>
           <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">رقم المعاملة</span>
              <p className="font-mono text-xs text-zinc-400">{searchParams.get("session_id")?.slice(0, 15)}...</p>
           </div>
        </div>

        <div className="flex flex-col gap-6">
          <Link 
            to="/" 
            className="bg-accent text-black py-5 rounded-2xl font-black text-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-3 glow-amber group"
          >
            العودة للرئيسية
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={handleShare}
            className="text-zinc-500 hover:text-white transition-colors font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 py-2"
          >
             <Share2 className="w-4 h-4" />
             مشاركة تفاصيل الحجز عبر الواتساب
          </button>
        </div>
      </motion.div>
    </div>
  );
}
