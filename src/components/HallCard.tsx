import React from "react";
import { Hall } from "@/src/types";
import { Link } from "react-router-dom";
import { Users, MapPin, Star, CheckCircle2, ChevronLeft, Share2 } from "lucide-react";
import { motion } from "motion/react";

export function HallCard({ hall }: { hall: Hall }) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: hall.name,
      text: `اكتشف قاعة ${hall.name} على منصة أفراحي`,
      url: `${window.location.origin}/hall/${hall.id}`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/hall/${hall.id}`);
      alert("تم نسخ الرابط!");
    }
  };

  return (
    <Link to={`/hall/${hall.id}`}>
      <motion.div 
        whileHover={{ y: -10 }}
        className="group bg-surface-dark/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-accent/30 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img 
            src={hall.images[0]} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            alt={hall.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-80"></div>
          
          {/* Badge overlays */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
             <div className="bg-black/60 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
               <Star className="w-3 h-3 text-accent fill-accent" />
               {(hall.rating || 0).toFixed(1)}
             </div>
          </div>

          <button 
            onClick={handleShare}
            className="absolute top-6 left-6 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-accent hover:text-black transition-all z-10"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>{hall.location}</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">{hall.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col flex-1 gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold">{hall.capacity} شخص</span>
            </div>
            <div className="text-accent text-lg font-black tracking-tighter">
              {hall.pricePerNight} <span className="text-[10px] uppercase opacity-50 font-medium">ر.س / ليلة</span>
            </div>
          </div>

          {/* Features Preview */}
          <div className="flex flex-wrap gap-2">
            {(hall.features || []).slice(0, 3).map((feature, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 capitalize">
                <CheckCircle2 className="w-3 h-3 text-accent/50" />
                {feature}
              </span>
            ))}
            {hall.features && hall.features.length > 3 && (
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-zinc-500 font-bold">
                +{hall.features.length - 3} ميزات
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
            احجز الآن <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
