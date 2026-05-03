import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Hall } from "@/src/types";
import { HallCard } from "../components/HallCard";
import { motion } from "motion/react";
import { Search, MapPin, Users, Sparkles } from "lucide-react";

export function Home() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHalls() {
      try {
        const querySnapshot = await getDocs(collection(db, "halls"));
        const hallsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hall));
        setHalls(hallsData);
      } catch (error) {
        console.error("Error fetching halls:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHalls();
  }, []);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[700px] rounded-[3rem] overflow-hidden bg-bg-dark border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-l from-bg-dark via-bg-dark/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Wedding Hall"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/10 text-accent text-xs font-black uppercase tracking-widest mb-8 border border-accent/20">
              <Sparkles className="w-4 h-4" />
              <span>لحظات استثنائية لليلة من العمر</span>
            </div>
            <h1 className="font-display text-6xl md:text-8xl font-black text-white mb-10 leading-[1.1]">
              نحن نرسم <br /> <span className="text-accent italic drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">أحلامكم</span> واقعاً
            </h1>
            
            {/* Search Bar */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-3xl md:rounded-full flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-2xl mx-auto w-full shadow-2xl">
              <div className="flex-1 flex items-center px-6 gap-3 border-b md:border-b-0 md:border-l border-white/10">
                <Search className="w-5 h-5 text-accent" />
                <input 
                  type="text" 
                  placeholder="ابحث عن صالة أو منطقة..." 
                  className="w-full py-4 bg-transparent outline-none text-white text-sm placeholder:text-zinc-500"
                />
              </div>
              <button className="bg-accent text-black px-10 py-4 rounded-2xl md:rounded-full font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-all glow-amber active:scale-95">
                تصفح الآن
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Halls Grid */}
      <section>
        <div className="flex items-end justify-between mb-16 px-4">
          <div>
            <span className="text-accent text-xs font-black uppercase tracking-[0.2em] mb-4 block">قاعاتنا المختارة</span>
            <h2 className="font-display text-4xl font-bold text-white leading-tight">ابدأ رحلة البحث <br /> عن التميز</h2>
          </div>
          <button className="text-zinc-500 text-sm hover:text-accent transition-colors flex items-center gap-2 group">
            عرض كافة القاعات <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] bg-surface-dark animate-pulse rounded-[2.5rem] border border-white/5"></div>
            ))}
          </div>
        ) : halls.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {halls.map((hall, index) => (
              <motion.div
                key={hall.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <HallCard hall={hall} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24 bg-surface-dark/50 border border-white/5 rounded-[3rem]">
            <p className="text-zinc-500">لا توجد قاعات متاحة في الوقت الحالي.</p>
          </div>
        )}
      </section>
    </div>
  );
}
import { ChevronLeft } from "lucide-react";
