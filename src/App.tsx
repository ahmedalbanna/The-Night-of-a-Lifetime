import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { Home } from "./pages/Home";
import { HallDetails } from "./pages/HallDetails";
import { BookingSuccess } from "./pages/BookingSuccess";
import { Navbar } from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-height-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-dark font-sans" dir="rtl">
        <Navbar user={user} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/halls/:id" element={<HallDetails />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
          </Routes>
        </main>
        <footer className="bg-black text-zinc-500 py-20 border-t border-white/5">
          <div className="container mx-auto px-4 text-center space-y-8">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent fill-accent" />
               </div>
               <h2 className="font-display text-4xl text-white font-black tracking-tight">أفراحي</h2>
            </div>
            <p className="max-w-md mx-auto text-sm leading-relaxed">منصتك الرقمية الأولى لحجز قاعات المناسبات بكل سهولة وأمان. نحن هنا لنوثق ذكرياتكم الأجمل.</p>
            <div className="flex justify-center gap-8 text-xs font-black uppercase tracking-widest text-zinc-400">
               <button className="hover:text-accent transition-colors">عن المنصة</button>
               <button className="hover:text-accent transition-colors">سياسة الحجز</button>
               <button className="hover:text-accent transition-colors">اتصل بنا</button>
            </div>
            <div className="text-[10px] pt-12 border-t border-white/5 uppercase tracking-widest font-bold opacity-30">
              &copy; {new Date().getFullYear()} AFRAHI RESERVATIONS PLATFORM. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
import { Heart } from "lucide-react";
