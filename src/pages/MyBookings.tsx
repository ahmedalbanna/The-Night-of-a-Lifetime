import { useState, useEffect } from "react";
import { auth, db } from "@/src/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Booking, Hall } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, X, AlertTriangle, CheckCircle, Clock, Bell } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function MyBookings() {
  const [bookings, setBookings] = useState<(Booking & { hall?: Hall })[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, "bookings"), where("userId", "==", auth.currentUser.uid));
        const snap = await getDocs(q);
        const bookingsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        
        // Fetch halls for each booking
        const fullBookings = await Promise.all(bookingsData.map(async (b) => {
          const hallSnap = await getDoc(doc(db, "halls", b.hallId));
          const hallData = hallSnap.data();
          return { ...b, hall: hallSnap.exists() && hallData ? { id: hallSnap.id, ...(hallData as any) } as Hall : undefined };
        }));
        
        setBookings(fullBookings);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await deleteDoc(doc(db, "bookings", id));
      setBookings(prev => prev.filter(b => b.id !== id));
      setShowConfirmCancel(null);
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("فشل إلغاء الحجز");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="p-20 text-center text-white">جاري تحميل حجوزاتك...</div>;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 space-y-12 pb-32">
      <div className="space-y-4 text-center md:text-right">
         <span className="text-accent text-xs font-black uppercase tracking-[0.2em] block">جدول المناسبات</span>
         <h1 className="text-5xl font-black text-white font-display">حجوزاتي القادمة</h1>
      </div>

      <div className="space-y-8">
         {bookings.length > 0 ? (
           bookings.map((booking) => (
             <motion.div 
               key={booking.id}
               layout
               className="bg-surface-dark/50 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10 group"
             >
                <div className="w-full md:w-48 h-48 rounded-3xl overflow-hidden border border-white/10 shrink-0">
                   <img src={booking.hall?.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="hall" />
                </div>

                <div className="flex-1 space-y-6 w-full">
                   <div className="flex items-start justify-between">
                      <div className="space-y-2">
                         <h3 className="text-3xl font-black text-white">{booking.hall?.name}</h3>
                         <div className="flex items-center gap-2 text-zinc-500 font-bold">
                            <MapPin className="w-4 h-4 text-accent" />
                            {booking.hall?.location}
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <div className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5" /> مؤكد
                         </div>
                         <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">عربون مدفوع</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> التاريخ
                         </span>
                         <p className="text-lg font-bold text-white uppercase">{booking.date}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> الوقت
                         </span>
                         <p className="text-lg font-bold text-white">مسائي / كامل</p>
                      </div>
                      <div className="space-y-1 hidden md:block">
                         <span className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                             <Bell className="w-3.5 h-3.5" /> التذكير
                         </span>
                         <p className="text-xs font-bold text-accent">نشط (24 ساعة)</p>
                      </div>
                      <div className="md:col-span-1 flex items-end justify-end">
                         <button 
                          onClick={() => setShowConfirmCancel(booking.id)}
                          className="text-red-500/40 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                         >
                            <X className="w-4 h-4" /> إلغاء الحجز
                         </button>
                      </div>
                   </div>
                </div>
             </motion.div>
           ))
         ) : (
           <div className="text-center py-32 bg-surface-dark/20 border border-white/5 rounded-[4rem]">
              <Calendar className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
              <p className="text-zinc-500 text-xl">لا توجد حجوزات نشطة حالياً</p>
           </div>
         )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showConfirmCancel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg-dark/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-md w-full bg-surface-dark border border-red-500/20 rounded-[3rem] p-10 text-center space-y-8"
             >
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                   <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                   <h2 className="text-3xl font-black text-white">هل أنت متأكد؟</h2>
                   <p className="text-zinc-500">إلغاء الحجز قد يترتب عليه فقدان العربون حسب سياسة القاعة.</p>
                </div>
                <div className="flex flex-col gap-3">
                   <button 
                    onClick={() => handleCancel(showConfirmCancel)}
                    disabled={!!cancellingId}
                    className="w-full bg-red-500 text-white font-black py-5 rounded-2xl text-lg uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3"
                   >
                     {cancellingId ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "نعم، إلغاء الحجز"}
                   </button>
                   <button 
                    onClick={() => setShowConfirmCancel(null)}
                    className="w-full py-4 text-zinc-600 font-bold hover:text-white transition-all"
                   >
                     التراجع عن القرار
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to fetch hall doc
import { getDoc as firestoreGetDoc } from "firebase/firestore";
async function getDoc(ref: any) {
  return await firestoreGetDoc(ref);
}
