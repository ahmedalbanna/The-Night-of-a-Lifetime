import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const sampleHalls = [
  {
    name: "قاعة رويال الذهبية",
    description: "قاعة ملكية تتميز بالديكور الكلاسيكي الفخم، سقف عالٍ مع ثريات كريستال عملاقة، ومساحة واسعة للرقص ومنصة ملكية للعروسين. مجهزة بأحدث أنظمة الإضاءة الليزرية والصوتيات المحيطية.",
    location: "الرياض، حي النخيل",
    capacity: 500,
    pricePerNight: 15000,
    depositAmount: 2000,
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000"
    ],
    audioTermsUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    features: ["تكييف مركزي ممتاز", "غرفة تجهيز العروس", "كادر ضيافة محترف", "أجهزة بخار ومؤثرات"],
    rating: 4.8
  },
  {
    name: "منتجع لؤلؤة الخليج",
    description: "قاعة خارجية تطل على مسبح كبير مع حديقة خلابة، مثالية للمناسبات العصرية وحفلات العشاء الفاخرة. توفر خصوصية تامة وجو ساحر تحت ضوء القمر.",
    location: "جدة، حي أبحر",
    capacity: 300,
    pricePerNight: 12000,
    depositAmount: 1500,
    images: [
      "https://images.unsplash.com/photo-1507502707541-f369a3b18502?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1510076857177-74700760be15?auto=format&fit=crop&q=80&w=1000"
    ],
    audioTermsUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    features: ["موقع مطل على البحر", "بوفيه مفتوح (اختياري)", "نظام إضاءة تحت الماء", "مدخل مستقل"],
    rating: 4.5
  },
  {
    name: "قاعة أفراح القمر",
    description: "قاعة مودرن بتصاميم هندسية حديثة، تتميز بالهدوء والرقي وسهولة الوصول. مناسبة جداً للخطوبات والشبكات والحفلات المتوسطة.",
    location: "الدمام، حي الفيصلية",
    capacity: 200,
    pricePerNight: 8000,
    depositAmount: 1000,
    images: [
      "https://images.unsplash.com/photo-1532706307135-5335375cd9d2?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000"
    ],
    audioTermsUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    features: ["شاشات LED عملاقة", "تنسيق كوشات مجاني", "ستوديو تصوير مجهز", "مواقف واسعة"],
    rating: 4.2
  }
];

async function seed() {
  console.log("Seeding halls...");
  for (const hall of sampleHalls) {
    try {
      await addDoc(collection(db, "halls"), hall);
      console.log(`Added hall: ${hall.name}`);
    } catch (e) {
      console.error("Error adding hall: ", e);
    }
  }
  console.log("Seeding complete.");
}

seed();
