import { User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { Link } from "react-router-dom";
import { Heart, User as UserIcon, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="glass sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-black rounded-sm rotate-45"></div>
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-white">أفراحي</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-accent transition-colors">الرئيسية</Link>
          <button className="text-sm font-medium text-zinc-400 hover:text-accent transition-colors">عن المنصة</button>
          <button className="text-sm font-medium text-zinc-400 hover:text-accent transition-colors">اتصل بنا</button>
          
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
              className="bg-accent text-black px-6 py-2.5 rounded-full text-sm font-bold glow-amber hover:bg-amber-400 transition-all active:scale-95"
            >
              تسجيل الدخول
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="w-6 h-6 text-zinc-600" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-100 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 text-zinc-600 font-medium">الرئيسية</Link>
              <button className="py-2 text-zinc-600 font-medium text-right">عن المنصة</button>
              <button className="py-2 text-zinc-600 font-medium text-right">اتصل بنا</button>
              {user ? (
                <div className="flex items-center justify-between py-2 border-t pt-4">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || ""} alt="" className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium">{user.displayName}</span>
                  </div>
                  <button onClick={handleLogout} className="text-red-500"><LogOut className="w-5 h-5" /></button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
