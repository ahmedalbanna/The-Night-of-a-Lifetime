import { useState, useEffect } from "react";
import { auth, db } from "@/src/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { User, Phone, Clock, FileText, Settings, Save, ShieldCheck } from "lucide-react";

export function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "",
    contactPhone: "",
    operatingHours: "",
    description: "",
    services: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        ...profile,
        role: "admin",
        updatedAt: new Date(),
      }, { merge: true });
      alert("تم حفظ الملف الشخصي بنجاح");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-10">
         <div className="relative">
            <div className="w-40 h-40 rounded-[3rem] bg-accent/20 border-2 border-accent/30 flex items-center justify-center text-accent overflow-hidden">
               {auth.currentUser?.photoURL ? <img src={auth.currentUser.photoURL} /> : <User className="w-20 h-20" />}
            </div>
            <div className="absolute -bottom-4 -right-4 bg-accent p-3 rounded-2xl text-black">
               <ShieldCheck className="w-6 h-6" />
            </div>
         </div>
         <div className="text-center md:text-right space-y-2">
            <h1 className="text-5xl font-black text-white font-display">إدارة القاعة</h1>
            <p className="text-zinc-500 font-bold">قم بتحديث معلوماتك لتظهر للعملاء في صفحات القاعات</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-4">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block pr-2">الاسم التجاري</label>
            <div className="relative">
               <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/50" />
               <input 
                 type="text" 
                 value={profile.name}
                 onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                 className="w-full bg-surface-dark border border-white/5 rounded-2xl py-5 pr-14 pl-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                 placeholder="اسم المسؤول أو القاعة"
               />
            </div>
         </div>
         <div className="space-y-4">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block pr-2">رقم التواصل</label>
            <div className="relative">
               <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/50" />
               <input 
                 type="text" 
                 value={profile.contactPhone}
                 onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
                 className="w-full bg-surface-dark border border-white/5 rounded-2xl py-5 pr-14 pl-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                 placeholder="05xxxxxxx"
               />
            </div>
         </div>
         <div className="space-y-4">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block pr-2">أوقات العمل</label>
            <div className="relative">
               <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/50" />
               <input 
                 type="text" 
                 value={profile.operatingHours}
                 onChange={(e) => setProfile({ ...profile, operatingHours: e.target.value })}
                 className="w-full bg-surface-dark border border-white/5 rounded-2xl py-5 pr-14 pl-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                 placeholder="مثلاً: يومياً 8 ص - 12 م"
               />
            </div>
         </div>
         <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block pr-2">وصف القاعة والخدمات</label>
            <div className="relative">
               <FileText className="absolute right-5 top-8 w-5 h-5 text-accent/50" />
               <textarea 
                 value={profile.description}
                 onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                 className="w-full bg-surface-dark border border-white/5 rounded-3xl py-6 pr-14 pl-6 text-white font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all min-h-[150px]"
                 placeholder="اكتب وصفاً جذاباً لقاعتك..."
               />
            </div>
         </div>
      </div>

      <button 
        disabled={saving}
        onClick={handleSave}
        className="w-full bg-accent text-black font-black py-6 rounded-3xl text-xl uppercase tracking-widest hover:bg-amber-400 transition-all glow-amber flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {saving ? <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div> : <Save className="w-6 h-6" />}
        حفظ البيانات التوثيقية
      </button>
    </div>
  );
}
