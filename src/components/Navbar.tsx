import { User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth, db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Heart, User as UserIcon, LogOut, Menu, Calendar, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } else {
        setUserData(null);
      }
    }
    fetchUserData();
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-black rounded-sm rotate-45"></div>
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-white">أفراحي</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-zinc-400 hover:text-accent transition-colors">الرئيسية</Link>
          {user && (
            <>
              <Link to="/my-bookings" className="text-sm font-bold text-zinc-400 hover:text-accent transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" /> حجوزاتي
              </Link>
              {userData?.role === "admin" && (
                <Link to="/admin/profile" className="text-sm font-bold text-zinc-400 hover:text-accent transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" /> إدارة القاعة
                </Link>
              )}
            </>
          )}
          
          {user ? (
            <div className="flex items-center gap-4 border-r pr-8 mr-4 border-white/10">
              <div className="flex items-center gap-3">
                <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-white/20" />
                <span className="text-sm font-medium text-white">{user.displayName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-accent text-black px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest glow-amber hover:bg-amber-400 transition-all active:scale-95"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - Horizontal Scrollable Strip */}
      <div className="md:hidden overflow-x-auto custom-scrollbar-hide border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-8 px-6 py-4 whitespace-nowrap min-w-max">
          <Link to="/" className="text-[10px] font-black text-accent uppercase tracking-widest">الرئيسية</Link>
          {user && (
            <>
              <Link to="/my-bookings" className="text-[10px] font-black text-zinc-400 hover:text-accent transition-colors flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> حجوزاتي
              </Link>
              {userData?.role === "admin" && (
                <Link to="/admin/profile" className="text-[10px] font-black text-zinc-400 hover:text-accent transition-colors flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> إدارة القاعة
                </Link>
              )}
            </>
          )}
          {user ? (
            <button 
              onClick={handleLogout}
              className="text-[10px] font-black text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> خروج
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="text-[10px] font-black text-white hover:text-accent transition-colors uppercase tracking-widest"
            >
              دخول
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
