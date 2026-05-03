import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Hall } from "@/src/types";
import { HallCard } from "../components/HallCard";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Users, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";

export function Home() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [featuredHalls, setFeaturedHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState(0);
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | "">("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Carousel state
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, "halls"));
        const hallsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hall));
        setHalls(hallsData);
        // Featured halls (just take top 3 for demo)
        setFeaturedHalls(hallsData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredHalls = useMemo(() => {
    let result = halls.filter(hall => {
      const matchesSearch = hall.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           hall.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationFilter ? hall.location === locationFilter : true;
      const matchesCapacity = capacityFilter ? hall.capacity >= capacityFilter : true;
      const matchesAmenities = amenityFilter.length > 0 
        ? amenityFilter.every(a => (hall.features || []).includes(a)) 
        : true;
      return matchesSearch && matchesLocation && matchesCapacity && matchesAmenities;
    });

    if (priceSort === "asc") {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (priceSort === "desc") {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    }

    return result;
  }, [halls, searchTerm, locationFilter, capacityFilter, amenityFilter, priceSort]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(halls.map(h => h.location)));
  }, [halls]);

  const allAmenities = useMemo(() => {
    const amenities = new Set<string>();
    halls.forEach(hall => (hall.features || []).forEach(f => amenities.add(f)));
    return Array.from(amenities);
  }, [halls]);

  const nextFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev + 1) % featuredHalls.length);
  };

  const prevFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev - 1 + featuredHalls.length) % featuredHalls.length);
  };

  const toggleAmenity = (amenity: string) => {
    setAmenityFilter(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Featured Carousel Section */}
      {!loading && featuredHalls.length > 0 && (
        <section className="relative h-[700px] rounded-[3rem] overflow-hidden bg-bg-dark border border-white/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeaturedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-l from-bg-dark via-bg-dark/40 to-transparent z-10"></div>
              <img 
                src={featuredHalls[currentFeaturedIndex].images[0]} 
                className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-[5s] hover:scale-110"
                alt={featuredHalls[currentFeaturedIndex].name}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-4xl"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/10 text-accent text-xs font-black uppercase tracking-widest mb-8 border border-accent/20">
                    <Sparkles className="w-4 h-4" />
                    <span>قاعة مختارة بعناية</span>
                  </div>
                  <h1 className="font-display text-6xl md:text-8xl font-black text-white mb-6 leading-[1.1]">
                    {featuredHalls[currentFeaturedIndex].name}
                  </h1>
                  <p className="text-xl text-white/70 mb-10">{featuredHalls[currentFeaturedIndex].location} • {featuredHalls[currentFeaturedIndex].capacity} شخص</p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <button className="bg-accent text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-all glow-amber active:scale-95">
                      احجز الآن
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div className="absolute bottom-10 left-10 z-30 flex gap-4">
            <button onClick={prevFeatured} className="w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
            <button onClick={nextFeatured} className="w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </section>
      )}

      {/* Search & Results Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-8">
            <div className="space-y-4">
              <span className="text-accent text-xs font-black uppercase tracking-[0.2em] block">بحث متقدم</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">استكشف قاعات <br /> الأحلام</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="relative group min-w-[300px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم أو الموقع..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-dark border border-white/5 rounded-2xl md:rounded-full py-4 pr-12 pl-6 text-white text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-2xl md:rounded-full border transition-all flex items-center justify-center gap-2 font-bold text-sm ${showFilters ? 'bg-accent border-accent text-black' : 'bg-surface-dark border-white/5 text-zinc-400 hover:text-white'}`}
              >
                {showFilters ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
                الفلاتر
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-surface-dark/50 border border-white/5 rounded-[2rem] p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">المنطقة</label>
                      <select 
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full bg-bg-dark border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                      >
                        <option value="">جميع المناطق</option>
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">أقل سعة</label>
                      <input 
                        type="number" 
                        placeholder="عدد الضيوف..."
                        value={capacityFilter || ""}
                        onChange={(e) => setCapacityFilter(Number(e.target.value))}
                        className="w-full bg-bg-dark border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">ترتيب السعر</label>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => setPriceSort(priceSort === "asc" ? "" : "asc")}
                          className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${priceSort === "asc" ? 'bg-accent text-black' : 'bg-bg-dark text-zinc-400 border border-white/10'}`}
                         >
                           الأقل سعراً
                         </button>
                         <button 
                          onClick={() => setPriceSort(priceSort === "desc" ? "" : "desc")}
                          className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${priceSort === "desc" ? 'bg-accent text-black' : 'bg-bg-dark text-zinc-400 border border-white/10'}`}
                         >
                           الأغلى سعراً
                         </button>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={() => {
                          setSearchTerm("");
                          setLocationFilter("");
                          setCapacityFilter(0);
                          setAmenityFilter([]);
                          setPriceSort("");
                        }}
                        className="w-full p-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20"
                      >
                        إعادة ضبط
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">المرافق والخدمات</label>
                    <div className="flex flex-wrap gap-3">
                       {allAmenities.map(amenity => (
                         <button 
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${amenityFilter.includes(amenity) ? 'bg-accent border-accent text-black' : 'bg-bg-dark border-white/10 text-zinc-400'}`}
                         >
                           {amenity}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm font-bold">عرض {filteredHalls.length} نتيجة</span>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[4/5] bg-surface-dark animate-pulse rounded-[2.5rem] border border-white/5"></div>
                ))}
              </div>
            ) : filteredHalls.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {filteredHalls.map((hall, index) => (
                  <motion.div
                    key={hall.id}
                    layout
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
              <div className="text-center py-32 bg-surface-dark/30 border border-white/5 rounded-[4rem]">
                <Sparkles className="w-12 h-12 text-accent/20 mx-auto mb-6" />
                <p className="text-zinc-500 text-lg">لم نجد أي نتائج تطابق بحثك... جرب كلمات أخرى</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
