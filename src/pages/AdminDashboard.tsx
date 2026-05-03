import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "@/src/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Hall } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Edit, Trash2, Users, MapPin, Star, 
  LayoutDashboard, Building2, PlusCircle, AlertCircle 
} from "lucide-react";

export function AdminDashboard() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyHalls() {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, "halls"), where("adminId", "==", auth.currentUser.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hall));
        setHalls(data);
      } catch (error) {
        console.error("Error fetching admin halls:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyHalls();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "halls", id));
      setHalls(prev => prev.filter(h => h.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("فشل حذف القاعة");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 space-y-8 animate-pulse">
        <div className="h-40 bg-surface-dark rounded-[3rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[1, 2].map(i => <div key={i} className="h-64 bg-surface-dark rounded-[2.5rem]"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-20 px-4 space-y-16 pb-32">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 bg-surface-dark/50 border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px]"></div>
         <div className="space-y-4 text-center md:text-right">
            <h1 className="text-5xl font-black text-white font-display flex items-center justify-center md:justify-start gap-4">
               <LayoutDashboard className="w-10 h-10 text-accent" />
               لوحة الإدارة
            </h1>
            <p className="text-zinc-500 font-bold max-w-md">أهلاً بك في منصة التحكم الخاصة بك. من هنا يمكنك إدارة جميع قاعاتك وتتبع الطلبات والتفاعلات.</p>
         </div>
         <Link 
          to="/admin/manage-hall" 
          className="bg-accent text-black px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-all glow-amber flex items-center gap-3 active:scale-95"
         >
            <PlusCircle className="w-5 h-5" /> إضافة قاعة جديدة
         </Link>
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <div className="bg-surface-dark border border-white/5 p-8 rounded-[2rem] text-center space-y-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">إجمالي القاعات</span>
            <p className="text-4xl font-black text-white leading-none">{halls.length}</p>
         </div>
         <div className="bg-surface-dark border border-white/5 p-8 rounded-[2rem] text-center space-y-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">متوسط التقييم</span>
            <p className="text-4xl font-black text-accent leading-none">
               {(halls.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (halls.length || 1)).toFixed(1)}
            </p>
         </div>
      </div>

      {/* Halls List */}
      <div className="space-y-8">
         <h2 className="text-2xl font-black text-white font-display">قاعاتي المسجلة</h2>
         {halls.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {halls.map((hall) => (
                <motion.div 
                  key={hall.id}
                  layout
                  className="bg-surface-dark/30 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col hover:border-accent/20 transition-all group"
                >
                   <div className="h-64 relative overflow-hidden">
                      <img src={hall.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="hall" />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-6 right-6 flex items-center gap-2">
                         <div className="bg-black/40 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                           <Star className="w-3 h-3 text-accent fill-accent" />
                           {hall.rating.toFixed(1)}
                         </div>
                      </div>
                   </div>

                   <div className="p-8 space-y-6">
                      <div className="space-y-1">
                         <h3 className="text-2xl font-bold text-white">{hall.name}</h3>
                         <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold">
                            <MapPin className="w-4 h-4 text-accent" />
                            {hall.location}
                         </div>
                      </div>

                      <div className="flex items-center gap-6 py-4 border-y border-white/5">
                         <div className="flex items-center gap-2 text-zinc-400 text-xs">
                            <Users className="w-4 h-4" />
                            <span>{hall.capacity} شخص</span>
                         </div>
                         <div className="text-accent text-lg font-black tracking-tighter">
                            {hall.pricePerNight} <span className="text-[10px] text-zinc-600 font-medium">ر.س</span>
                         </div>
                      </div>

                      <div className="flex gap-4">
                         <Link 
                          to={`/admin/manage-hall/${hall.id}`}
                          className="flex-1 bg-white/5 hover:bg-accent hover:text-black text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                         >
                            <Edit className="w-4 h-4" /> تعديل
                         </Link>
                         <button 
                          onClick={() => setDeleteId(hall.id)}
                          className="w-16 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all rounded-2xl flex items-center justify-center"
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
         ) : (
           <div className="text-center py-32 bg-surface-dark/20 border border-white/5 rounded-[4rem]">
              <Building2 className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
              <p className="text-zinc-600 mb-8">لم تقم بإضافة أي قاعة حتى الآن</p>
              <Link to="/admin/manage-hall" className="text-accent underline underline-offset-8 font-black uppercase tracking-widest text-xs">ابدأ بإضافة قاعتك الأولى الآن</Link>
           </div>
         )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
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
                   <AlertCircle className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                   <h2 className="text-3xl font-black text-white">حذف القاعة؟</h2>
                   <p className="text-zinc-500">هذا الإجراء سيؤدي لحذف جميع بيانات القاعة والصور نهائياً. هل أنت متأكد؟</p>
                </div>
                <div className="flex flex-col gap-3">
                   <button 
                    onClick={() => handleDelete(deleteId)}
                    className="w-full bg-red-500 text-white font-black py-5 rounded-2xl text-lg uppercase tracking-widest hover:bg-red-600 transition-all"
                   >
                     نعم، احذف القاعة
                   </button>
                   <button 
                    onClick={() => setDeleteId(null)}
                    className="w-full py-4 text-zinc-600 font-bold hover:text-white transition-all"
                   >
                     إلغاء التراجع
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
