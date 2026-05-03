import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { Hall, Review } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, Users, Star, CheckCircle2, Play, Pause, 
  Calendar, Info, ShieldCheck, CreditCard, ChevronLeft, 
  ChevronRight, X, User, MessageCircle, Clock, Phone,
  Camera, ArrowLeft, Send
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { loadStripe } from "@stripe/stripe-js";
import { handleFirestoreError, OperationType } from "@/src/lib/firestoreUtils";

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export function HallDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState<Hall | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Gallery states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  
  // Booking confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Review input state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const docRef = doc(db, "halls", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHall({ id: docSnap.id, ...docSnap.data() } as Hall);
          
          // Fetch reviews
          const reviewsQuery = query(collection(db, "reviews"), where("hallId", "==", id));
          const reviewsSnap = await getDocs(reviewsQuery);
          const reviewsData = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
          setReviews(reviewsData);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
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

    // Basic date validation
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(selectedDate) < today) {
      alert("لا يمكن حجز تاريخ في الماضي");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmAndProceed = async () => {
    setShowConfirmModal(false);
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
          userId: auth.currentUser?.uid,
        }),
      });

      const session = await response.json();
      const stripe = await stripePromise;
      if (stripe && session.id) {
        await (stripe as any).redirectToCheckout({ sessionId: session.id });
      }
    } catch (error) {
      console.error("Booking failed", error);
      alert("فشل الحجز، يرجى المحاولة لاحقاً");
    } finally {
      setBookingLoading(false);
    }
  };

  const submitReview = async () => {
    if (!auth.currentUser || !hall) return;
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        hallId: hall.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "مستخدم مجهول",
        userPhoto: auth.currentUser.photoURL || "",
        rating: newRating,
        comment: newComment,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      setReviews([{ id: docRef.id, ...reviewData, createdAt: new Date() } as Review, ...reviews]);
      setNewComment("");
      setNewRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const nextImage = () => {
    if (hall) setCurrentImageIndex((prev) => (prev + 1) % hall.images.length);
  };

  const prevImage = () => {
    if (hall) setCurrentImageIndex((prev) => (prev - 1 + hall.images.length) % hall.images.length);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 py-12 animate-pulse px-4">
        <div className="h-[500px] bg-surface-dark rounded-[3rem] border border-white/5"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 h-96 bg-surface-dark rounded-[2.5rem] border border-white/5"></div>
           <div className="h-96 bg-surface-dark rounded-[2.5rem] border border-white/5"></div>
        </div>
      </div>
    );
  }

  if (!hall) return null;

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 space-y-12">
      {/* Immersive Gallery Section */}
      <section className="relative h-[70vh] rounded-[3rem] overflow-hidden group/main bg-bg-dark border border-white/5">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIndex}
            src={hall.images[currentImageIndex]} 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
            alt={hall.name}
            onClick={() => setShowGalleryModal(true)}
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-90"></div>
        
        {/* Carousel Navigation */}
        <div className="absolute inset-0 flex items-center justify-between px-10 opacity-0 group-hover/main:opacity-100 transition-opacity">
          <button onClick={prevImage} className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all">
            <ChevronRight className="w-8 h-8" />
          </button>
          <button onClick={nextImage} className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all">
            <ChevronLeft className="w-8 h-8" />
          </button>
        </div>

        <div className="absolute bottom-12 right-12 z-20">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl p-2 pr-6 rounded-full border border-white/10">
             <div className="flex -space-x-3 rtl:space-x-reverse">
                {hall.images.slice(0, 4).map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-12 h-12 rounded-full border-2 overflow-hidden cursor-pointer transition-all ${i === currentImageIndex ? 'border-accent scale-110 z-10' : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </div>
                ))}
             </div>
             <button onClick={() => setShowGalleryModal(true)} className="text-[10px] font-black text-white/70 uppercase tracking-widest pl-4">عرض كل الصور (+{hall.images.length})</button>
          </div>
        </div>

        <div className="absolute top-12 right-12 z-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-accent text-black text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              قاعة موثقة
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight font-display drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
               {hall.name}
            </h1>
            <div className="flex items-center gap-6 text-white/80">
               <div className="flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-accent" />
                 <span className="text-lg font-bold">{hall.location}</span>
               </div>
               <div className="flex items-center gap-2 border-r border-white/10 pr-6">
                 <Users className="w-5 h-5 text-accent" />
                 <span className="text-lg font-bold">{hall.capacity} شخص</span>
               </div>
               <div className="flex items-center gap-2 border-r border-white/10 pr-6">
                 <Star className="w-5 h-5 text-accent fill-accent" />
                 <span className="text-lg font-bold">{hall.rating.toFixed(1)} <span className="text-sm font-normal text-white/50">({reviews.length} تقييم)</span></span>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Details Content */}
        <div className="lg:col-span-8 space-y-16">
          {/* Description */}
          <section className="space-y-6">
            <h2 className="font-display text-4xl font-bold text-white flex items-center gap-4">
               <Info className="w-8 h-8 text-accent" />
               عن القاعة
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed font-light">
              {hall.description || "قاعة فاخرة مصممة بأحدث الطرازات العالمية لتناسب كافة مناسباتكم السعيدة. تتميز القاعة بمساحاتها الواسعة وتجهيزاتها المتكاملة التي تضمن لكم ليلة لا تُنسى."}
            </p>
          </section>

          {/* Features Grid */}
          <section className="space-y-8">
            <h2 className="font-display text-4xl font-bold text-white">المميزات والخدمات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hall.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-6 bg-surface-dark border border-white/5 rounded-3xl hover:border-accent/30 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-zinc-300 capitalize">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Admin Info Section */}
          <section className="bg-surface-dark/50 border border-white/5 rounded-[3rem] p-10 space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                      <User className="w-10 h-10" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white">إدارة القاعة</h3>
                      <p className="text-zinc-500 font-bold">للتواصل المباشر والاستفسارات</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-accent hover:text-black transition-all">
                      <Phone className="w-6 h-6" />
                   </button>
                   <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-accent hover:text-black transition-all">
                      <MessageCircle className="w-6 h-6" />
                   </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-3">
                   <span className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> أوقات العمل
                   </span>
                   <p className="text-lg font-bold text-white">{hall.operatingHours || "يومياً من 8:00 صباحاً حتى 12:00 منتصف الليل"}</p>
                </div>
                <div className="space-y-3">
                   <span className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                       <MessageCircle className="w-3.5 h-3.5" /> خدمات إضافية
                   </span>
                   <p className="text-lg font-bold text-white">خدمات ضيافة، تصوير فوتوغرافي، تجهيزات صوتية</p>
                </div>
             </div>
          </section>

          {/* Reviews Section */}
          <section className="space-y-12">
             <div className="flex items-center justify-between">
                <h2 className="font-display text-4xl font-bold text-white">آراء العملاء</h2>
                <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                   <Star className="w-5 h-5 text-accent fill-accent" />
                   <span className="text-accent font-black text-xl">{hall.rating.toFixed(1)}</span>
                </div>
             </div>

             {/* Add Review */}
             {auth.currentUser && (
               <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-bold text-zinc-400">تقييمك:</span>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <Star 
                            key={s} 
                            onClick={() => setNewRating(s)}
                            className={`w-6 h-6 cursor-pointer transition-all ${s <= newRating ? 'text-accent fill-accent scale-110' : 'text-zinc-700'}`} 
                           />
                        ))}
                     </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      placeholder="شاركنا رأيك في القاعة وبجودة الخدمات..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-bg-dark border border-white/5 rounded-3xl p-6 text-white text-lg min-h-[150px] focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-zinc-600"
                    />
                    <button 
                      onClick={submitReview}
                      disabled={submittingReview || !newComment.trim()}
                      className="absolute bottom-4 left-4 bg-accent text-black px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingReview ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                      نشر التقاييم
                    </button>
                  </div>
               </div>
             )}

             <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="bg-surface-dark/30 border border-white/5 p-8 rounded-[2.5rem] space-y-6"
                    >
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                                {review.userPhoto ? <img src={review.userPhoto} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-zinc-600" />}
                             </div>
                             <div>
                                <h4 className="text-lg font-bold text-white">{review.userName}</h4>
                                <div className="flex gap-0.5">
                                   {[...Array(5)].map((_, i) => (
                                     <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-accent fill-accent' : 'text-zinc-800'}`} />
                                   ))}
                                </div>
                             </div>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{review.createdAt?.seconds ? format(new Date(review.createdAt.seconds * 1000), 'd MMMM yyyy', { locale: ar }) : 'الآن'}</span>
                       </div>
                       <p className="text-lg text-zinc-400 font-light leading-relaxed">{review.comment}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-surface-dark/20 border border-white/5 rounded-[3rem]">
                     <MessageCircle className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                     <p className="text-zinc-600">لا توجد مراجعات بعد... كن أول من يشارك تجربته</p>
                  </div>
                )}
             </div>
          </section>
        </div>

        {/* Sidebar: Booking Panel */}
        <div className="lg:col-span-4">
           <div className="sticky top-28 space-y-8">
              <div className="bg-surface-dark border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl shadow-accent/5 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px]"></div>
                 
                 <div className="space-y-4">
                    <h2 className="text-accent text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                       <Calendar className="w-4 h-4" /> حجز القاعة
                    </h2>
                    <div className="flex justify-between items-end border-b border-white/5 pb-8">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">السعر الكلي</span>
                        <p className="text-5xl font-black text-white tracking-tighter">{hall.pricePerNight} <span className="text-sm font-normal text-zinc-600">ر.س</span></p>
                      </div>
                      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 text-center">
                        <span className="text-accent text-[9px] font-black uppercase tracking-widest block mb-1 underline underline-offset-4 decoration-accent/30">عربون التأكيد</span>
                        <span className="text-xl font-black text-accent">{hall.depositAmount} <span className="text-xs">ر.س</span></span>
                      </div>
                    </div>
                 </div>

                 {/* Advanced Audio Player */}
                 <div className="space-y-4">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">التعليمات الصوتية</span>
                   <div className="bg-bg-dark rounded-3xl p-5 border border-white/5 space-y-4">
                      <div className="flex items-center gap-4">
                         <button 
                          onClick={toggleAudio}
                          className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-black hover:bg-amber-400 transition-all hover:scale-105"
                         >
                           {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                         </button>
                         <div className="flex-1 space-y-1.5">
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                className="h-full bg-accent"
                                style={{ width: `${audioProgress}%` }}
                                transition={{ ease: "linear" }}
                               />
                            </div>
                            <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                               <span>00:00</span>
                               <span>شروط الإدارة</span>
                               <span>02:15</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   <audio 
                    ref={audioRef} 
                    src={hall.audioTermsUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => { setIsPlaying(false); setAudioProgress(100); }}
                   />
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block pr-2">تاريخ المناسبة</label>
                       <div className="relative">
                          <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                          <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-bg-dark border border-white/5 rounded-2xl py-5 pr-14 pl-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm custom-date-picker"
                          />
                       </div>
                    </div>

                    <button 
                      disabled={bookingLoading || !selectedDate}
                      onClick={handleBooking}
                      className="group w-full bg-accent hover:bg-amber-400 text-black font-black py-6 rounded-3xl text-lg uppercase tracking-widest transition-all glow-amber disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      {bookingLoading ? (
                        <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CreditCard className="w-6 h-6" />
                          إتمام الحجز الآن
                        </>
                      )}
                    </button>
                    
                    <div className="flex flex-col items-center gap-4 py-4 border-t border-white/5">
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">بوابة دفع آمنة 256 بت</p>
                        <div className="flex justify-center gap-4 opacity-20 grayscale brightness-200">
                           <div className="h-4 w-10 border border-white/20 rounded"></div>
                           <div className="h-4 w-10 border border-white/20 rounded"></div>
                           <div className="h-4 w-10 border border-white/20 rounded"></div>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="bg-accent/5 border border-accent/10 rounded-[2.5rem] p-8 space-y-4">
                 <div className="flex items-center gap-3 text-accent uppercase text-[10px] font-black tracking-widest">
                    <ShieldCheck className="w-4 h-4" /> ضمان الخدمة
                 </div>
                 <p className="text-zinc-500 text-xs leading-relaxed font-bold">يتم دفع العربون لتأكيد حجز التاريخ المختار. المبلغ المتبقي يتم تسويته مباشرة مع إدارة القاعة وفقاً للاتفاق المبرم.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-10 md:p-20"
          >
             <button 
               onClick={() => setShowGalleryModal(false)}
               className="absolute top-10 right-10 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-red-500 transition-all z-[110]"
             >
               <X className="w-8 h-8" />
             </button>

             <button 
               onClick={prevImage}
               className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all"
             >
               <ChevronRight className="w-10 h-10" />
             </button>
             
             <motion.img 
               key={currentImageIndex}
               src={hall.images[currentImageIndex]}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-full max-h-full object-contain rounded-3xl"
             />

             <button 
               onClick={nextImage}
               className="absolute right-10 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all"
             >
               <ChevronLeft className="w-10 h-10" />
             </button>

             <div className="absolute bottom-10 left-10 right-10 flex justify-center gap-3">
                {hall.images.map((_, i) => (
                  <div 
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`h-2 transition-all rounded-full cursor-pointer ${i === currentImageIndex ? 'w-12 bg-accent' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg-dark/80 backdrop-blur-2xl flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="max-w-xl w-full bg-surface-dark border border-accent/20 rounded-[3.5rem] p-12 space-y-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
             >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-accent/50 rounded-full blur-md"></div>
                
                <div className="w-24 h-24 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center text-accent mx-auto">
                   <Calendar className="w-12 h-12" />
                </div>

                <div className="space-y-4">
                   <h2 className="text-4xl font-black text-white font-display">تأكيد عملية الحجز</h2>
                   <p className="text-zinc-500 text-lg">أنت على وشك حجز قاعة <span className="text-white font-bold">{hall.name}</span></p>
                </div>

                <div className="bg-bg-dark/50 rounded-3xl p-8 grid grid-cols-2 gap-8 border border-white/5">
                   <div className="text-right space-y-1">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">تاريخ المناسبة</span>
                      <p className="text-xl font-bold text-white uppercase">{selectedDate}</p>
                   </div>
                   <div className="text-left space-y-1 border-r border-white/10 pr-8">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">مبلغ العربون</span>
                      <p className="text-2xl font-black text-accent">{hall.depositAmount} <span className="text-xs">ر.س</span></p>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                   <button 
                    onClick={confirmAndProceed}
                    className="w-full bg-accent text-black font-black py-6 rounded-3xl text-xl uppercase tracking-widest hover:bg-amber-400 transition-all glow-amber"
                   >
                     نعم، الانتقال للدفع الآمن
                   </button>
                   <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full bg-transparent text-zinc-600 font-bold py-4 rounded-2xl hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                     <ArrowLeft className="w-4 h-4" /> العودة للتعديل
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
