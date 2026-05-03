import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "@/src/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Save, ArrowRight, Camera, Plus, X, 
  CheckCircle2, Info, MapPin, Users, 
  CreditCard, Layout, Music, Clock, Phone, Trash2
} from "lucide-react";

export function ManageHall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    capacity: 0,
    pricePerNight: 0,
    depositAmount: 0,
    images: [] as string[],
    audioTermsUrl: "",
    features: [] as string[],
    operatingHours: "",
    contactPhone: "",
  });

  const [newImage, setNewImage] = useState("");
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    async function fetchHall() {
      if (!id) return;
      try {
        const docRef = doc(db, "halls", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.adminId !== auth.currentUser?.uid) {
            navigate("/admin/dashboard");
            return;
          }
          setForm({
            name: data.name || "",
            description: data.description || "",
            location: data.location || "",
            capacity: data.capacity || 0,
            pricePerNight: data.pricePerNight || 0,
            depositAmount: data.depositAmount || 0,
            images: data.images || [],
            audioTermsUrl: data.audioTermsUrl || "",
            features: data.features || [],
            operatingHours: data.operatingHours || "",
            contactPhone: data.contactPhone || "",
          });
        }
      } catch (error) {
        console.error("Error fetching hall:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHall();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    if (!form.name || !form.location || form.images.length === 0) {
      alert("الرجاء إكمال البيانات الأساسية (الاسم، الموقع، وصورة واحدة على الأقل)");
      return;
    }

    setSaving(true);
    try {
      const hallData = {
        ...form,
        adminId: auth.currentUser.uid,
        updatedAt: new Date(),
        rating: id ? undefined : 0, // Initial rating for new halls
      };

      if (id) {
        await updateDoc(doc(db, "halls", id), hallData);
        alert("تم تحديث القاعة بنجاح");
      } else {
        await addDoc(collection(db, "halls"), { ...hallData, rating: 5.0 }); // Default start rating
        alert("تمت إضافة القاعة بنجاح");
      }
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error saving hall:", error);
      alert("فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setForm(prev => ({ ...prev, images: [...prev.images, newImage] }));
      setNewImage("");
    }
  };

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm(prev => ({ ...prev, features: [...prev.features, newFeature] }));
      setNewFeature("");
    }
  };

  const removeFeature = (idx: number) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="p-20 text-center text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto py-20 px-4 space-y-16 pb-40">
      <div className="flex items-center justify-between gap-6">
         <div className="space-y-4">
            <button onClick={() => navigate("/admin/dashboard")} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
               <ArrowRight className="w-4 h-4 ml-1" /> العودة للوحة التحكم
            </button>
            <h1 className="text-5xl font-black text-white font-display">
               {id ? "تعديل بيانات القاعة" : "إضافة قاعة جديدة"}
            </h1>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Main Form Fields */}
         <div className="lg:col-span-8 space-y-12">
            
            {/* Basic Info */}
            <section className="bg-surface-dark/50 border border-white/5 p-10 rounded-[3rem] space-y-8">
               <div className="flex items-center gap-3 text-accent uppercase text-[10px] font-black tracking-widest">
                  <Info className="w-4 h-4" /> المعلومات الأساسية
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pr-4">اسم القاعة</label>
                     <input 
                       type="text" 
                       value={form.name}
                       onChange={(e) => setForm({ ...form, name: e.target.value })}
                       className="w-full bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                       placeholder="مثلاً: قاعة القصر الملكي"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pr-4">الموقع / الحي</label>
                     <input 
                       type="text" 
                       value={form.location}
                       onChange={(e) => setForm({ ...form, location: e.target.value })}
                       className="w-full bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                       placeholder="مثلاً: الرياض - حي الملقا"
                     />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pr-4">وصف مختصر</label>
                     <textarea 
                       value={form.description}
                       onChange={(e) => setForm({ ...form, description: e.target.value })}
                       className="w-full bg-bg-dark border border-white/5 rounded-3xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all min-h-[120px]"
                       placeholder="اكتب تفاصيل جذابة عن القاعة وتجهيزاتها..."
                     />
                  </div>
               </div>
            </section>

            {/* Images Management */}
            <section className="bg-surface-dark/50 border border-white/5 p-10 rounded-[3rem] space-y-8">
               <div className="flex items-center gap-3 text-accent uppercase text-[10px] font-black tracking-widest">
                  <Camera className="w-4 h-4" /> معرض الصور
               </div>
               
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <input 
                       type="text" 
                       value={newImage}
                       onChange={(e) => setNewImage(e.target.value)}
                       className="flex-1 bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                       placeholder="رابط الصورة (URL)..."
                     />
                     <button onClick={addImage} className="bg-accent text-black p-4 rounded-2xl glow-amber hover:bg-amber-400">
                        <Plus className="w-6 h-6" />
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {form.images.map((img, idx) => (
                       <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                          <img src={img} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* Features Management */}
            <section className="bg-surface-dark/50 border border-white/5 p-10 rounded-[3rem] space-y-8">
               <div className="flex items-center gap-3 text-accent uppercase text-[10px] font-black tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> المميزات والخدمات
               </div>
               
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <input 
                       type="text" 
                       value={newFeature}
                       onChange={(e) => setNewFeature(e.target.value)}
                       className="flex-1 bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                       placeholder="إضافة ميزة (مثلاً: تكييف مركزي، شاشات LED)..."
                     />
                     <button onClick={addFeature} className="bg-white/5 text-white border border-white/10 p-4 rounded-2xl hover:bg-accent hover:text-black transition-all">
                        <Plus className="w-6 h-6" />
                     </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                     {form.features.map((feature, idx) => (
                       <span key={idx} className="bg-bg-dark border border-white/10 px-6 py-3 rounded-2xl text-zinc-300 font-bold flex items-center gap-4 group">
                          {feature}
                          <button onClick={() => removeFeature(idx)} className="text-red-500/40 hover:text-red-500 transition-colors">
                             <X className="w-4 h-4" />
                          </button>
                       </span>
                     ))}
                  </div>
               </div>
            </section>
         </div>

         {/* Sidebar: Capacities & Pricing */}
         <div className="lg:col-span-4 space-y-12">
            <aside className="bg-surface-dark border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl"></div>
               
               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <Users className="w-4 h-4" /> السعة القصوى
                     </label>
                     <input 
                       type="number" 
                       value={form.capacity || ""}
                       onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                       className="w-full bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                       placeholder="عدد الأشخاص"
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> سعر الليلة (ر.س)
                     </label>
                     <input 
                       type="number" 
                       value={form.pricePerNight || ""}
                       onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })}
                       className="w-full bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                       placeholder="0.00"
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <Info className="w-4 h-4" /> مبلغ العربون للتأكيد
                     </label>
                     <input 
                       type="number" 
                       value={form.depositAmount || ""}
                       onChange={(e) => setForm({ ...form, depositAmount: Number(e.target.value) })}
                       className="w-full bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all border-accent/20 bg-accent/5"
                       placeholder="0.00"
                     />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-2">
                        <Music className="w-4 h-4" /> رابط التعليمات الصوتية
                     </label>
                     <input 
                       type="text" 
                       value={form.audioTermsUrl}
                       onChange={(e) => setForm({ ...form, audioTermsUrl: e.target.value })}
                       className="w-full bg-bg-dark border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                       placeholder="رابط ملف MP3..."
                     />
                  </div>

                  <button 
                    disabled={saving}
                    onClick={handleSubmit}
                    className="w-full bg-accent text-black font-black py-6 rounded-3xl text-lg uppercase tracking-widest glow-amber hover:bg-amber-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                     {saving ? <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div> : <Save className="w-6 h-6" />}
                     {id ? "تحديث البيانات" : "حفظ القاعة"}
                  </button>
               </div>
            </aside>

            {/* Quick Tips */}
            <div className="bg-accent/5 border border-accent/10 rounded-[2.5rem] p-8 space-y-4">
               <div className="flex items-center gap-3 text-accent uppercase text-[10px] font-black tracking-widest">
                  <Clock className="w-4 h-4" /> معلومات إضافية
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-600">ساعات العمل</label>
                     <input 
                       value={form.operatingHours} 
                       onChange={(e) => setForm({...form, operatingHours: e.target.value})}
                       className="w-full bg-transparent border-b border-white/10 outline-none text-white text-xs py-1"
                       placeholder="مثلاً: 8ص - 12م"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-600">رقم التواصل للقاعة</label>
                     <input 
                       value={form.contactPhone} 
                       onChange={(e) => setForm({...form, contactPhone: e.target.value})}
                       className="w-full bg-transparent border-b border-white/10 outline-none text-white text-xs py-1"
                       placeholder="05xxxxxxx"
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
