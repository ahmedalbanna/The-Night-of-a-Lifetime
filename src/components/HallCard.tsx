import { Hall } from "@/src/types";
import { Link } from "react-router-dom";
import { Users, MapPin, Star, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

interface HallCardProps {
  hall: Hall;
}

export function HallCard({ hall }: HallCardProps) {
  return (
    <Link to={`/halls/${hall.id}`} className="group block relative">
      <div className="bg-surface-dark rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 border border-white/5 h-full flex flex-col group-hover:border-accent/30 group-hover:shadow-accent/5">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img 
            src={hall.images[0]} 
            alt={hall.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface-dark via-surface-dark/80 to-transparent"></div>
          
          <div className="absolute top-6 right-6 glass px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
            <Star className="w-3 h-3 text-accent fill-accent" />
            <span className="text-[11px] font-black text-white">{hall.rating}</span>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1 block">{hall.location}</span>
            <h3 className="font-display text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors leading-tight">{hall.name}</h3>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-400">حتى {hall.capacity} شخص</span>
              </div>
              <div className="text-white font-black text-lg">
                {hall.pricePerNight} <span className="text-[10px] font-normal text-zinc-500">ر.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
