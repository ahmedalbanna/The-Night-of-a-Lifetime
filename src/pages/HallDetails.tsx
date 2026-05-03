import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { Hall } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Users, Star, CheckCircle2, Play, Pause, Calendar, Info, ShieldCheck, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export function HallDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchHall() {
      if (!id) return;
      try {
        const docRef = doc(db, "halls", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHall({ id: docSnap.id, ...docSnap.data() } as Hall);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching hall:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHall();
  }, [id, navigate]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleBooking = async () => {
    if (!auth.currentUser) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }
    if (!selectedDate) {
      alert("يرجى اختيار تاريخ الحجز");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hallId: hall?.id,
          hallName: hall?.name,
          date: selectedDate,
          amount: hall?.depositAmount,
          userId: auth.currentUser.uid,
        }),
      });

      const session = await response.json();
      const stripe = await stripePromise;
      if (stripe && session.id) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      }
    } catch (error) {
      console.error("Booking failed", error);
      alert("فشل الحجز، يرجى المحاولة لاحقاً");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 py-12 animate-pulse">
        <div className="h-[500px] bg-zinc-200 rounded-[3rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 h-96 bg-zinc-200 rounded-3xl"></div>
           <div className="h-96 bg-zinc-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!hall) return null;

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden rounded-[3rem] border border-white/5 bg-surface-dark mb-10">
      {/* Left Section: Gallery & Main Info */}
      <section className="w-full md:w-[60%] h-full relative overflow-hidden group border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-l from-bg-dark/90 via-transparent to-transparent z-10"></div>
        <img 
          src={hall.images[0]} 
          alt={hall.name}
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
        />
        
        {/* Gallery Preview / Multi-image thumbnails */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-4">
          {hall.images.slice(0, 3).map((img, i) => (
            <div 
              key={i} 
              className={`w-24 h-16 rounded-xl border-2 overflow-hidden ring-4 ring-black/30 transition-all ${i === 0 ? 'border-accent scale-110 shadow-xl shadow-accent/20' : 'border-white/10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-105'}`}
            >
              <img src={img} className="w-full h-full object-cover" alt="prev" />
            </div>
          ))}
        </div>

        <div className="absolute top-16 right-16 z-20">
          <span className="bg-accent/90 text-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full">متاح للحجز</span>
          <h1 className="text-6xl font-black text-white mt-6 drop-shadow-2xl leading-tight font-display">{hall.name}</h1>
          <p className="text-xl text-white/70 mt-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            {hall.location} • يتسع لـ {hall.capacity} شخص
          </p>
        </div>
      </section>

      {/* Right Section: Booking & Details */}
      <section className="w-full md:w-[40%] h-full p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar bg-surface-dark">
        <div className="space-y-12">
          {/* Audio Terms Player */}
          <div className="space-y-5">
            <h2 className="text-accent text-xs font-black uppercase tracking-[0.2em]">شروط مسؤول الحجز</h2>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group/audio">
              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleAudio}
                  className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-accent transition-all hover:bg-accent hover:text-black hover:scale-105"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                <div className="flex-1 space-y-2">
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isPlaying ? "100%" : "0%" }}
                        transition={{ duration: 60, ease: "linear" }}
                        className="h-full bg-accent"
                      />
                   </div>
                   <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      <span>{isPlaying ? 'جاري الاستماع' : 'متوقف'}</span>
                      <span>02:15</span>
                   </div>
                </div>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed italic mt-6 border-t border-white/5 pt-4">
                "يرجى الاستماع جيداً للرسالة الصوتية من إدارة القاعة قبل إتمام عملية دفع العربون."
              </p>
              <audio 
                ref={audioRef} 
                src={hall.audioTermsUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
               <div className="space-y-1">
                 <span className="text-white/40 text-xs font-bold uppercase tracking-widest">السعر الكلي للمناسبة</span>
                 <p className="text-4xl font-black text-white">{hall.pricePerNight} <span className="text-sm font-normal text-white/40">ر.س</span></p>
               </div>
               <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 text-left">
                  <span className="text-accent text-[10px] font-black uppercase tracking-widest block mb-1">العربون المستحق</span>
                  <span className="text-2xl font-black text-accent">{hall.depositAmount} <span className="text-xs">ر.س</span></span>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-black text-white/40 uppercase tracking-widest block">اختر موعد ليلة العمر</label>
               <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all custom-date-picker"
                />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-12">
          <button 
            disabled={bookingLoading}
            onClick={handleBooking}
            className="w-full bg-accent hover:bg-amber-400 text-black font-black py-6 rounded-3xl text-xl uppercase tracking-widest transition-all glow-amber hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {bookingLoading ? (
              <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                <CreditCard className="w-7 h-7" />
                 تأكيد الحجز ودفع العربون
              </>
            )}
          </button>
          
          <div className="flex justify-center gap-4 opacity-30 grayscale brightness-200">
             <div className="w-10 h-6 border border-white/20 rounded-md"></div>
             <div className="w-10 h-6 border border-white/20 rounded-md"></div>
             <div className="w-10 h-6 border border-white/20 rounded-md"></div>
          </div>
          <p className="text-[9px] text-center text-white/30 uppercase tracking-[0.3em] font-black">Secure Payment Gateway • AES-256 Bit Encryption</p>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/><path d="M20 3h4"/><path d="M22 1v4"/><path d="M18 5h2"/><path d="M4 11h2"/><path d="M2 12h4"/><path d="M4 13h2"/></svg>
  )
}

function MusicIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  )
}
