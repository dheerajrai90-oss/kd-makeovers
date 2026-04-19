import { useState, useEffect } from 'react';
import { db } from '@/src/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { GalleryItem } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Maximize2 } from 'lucide-react';

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    url: 'https://images.pexels.com/photos/34955446/pexels-photo-34955446.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Traditional Bridal Elegance',
    category: 'Bridal',
    createdAt: new Date()
  },
  {
    url: 'https://images.pexels.com/photos/32917374/pexels-photo-32917374.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Bridal Henna & Floral Art',
    category: 'Bridal',
    createdAt: new Date()
  },
  {
    url: 'https://images.pexels.com/photos/33945853/pexels-photo-33945853.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Professional Artistry',
    category: 'Makeup',
    createdAt: new Date()
  },
  {
    url: 'https://images.pexels.com/photos/8065441/pexels-photo-8065441.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Hair Styling Excellence',
    category: 'Hair',
    createdAt: new Date()
  }
];

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      setItems(galleryData.length > 0 ? galleryData : DEFAULT_GALLERY);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', ...new Set(items.map(item => item.category))];
  const filteredItems = filter === 'All' ? items : items.filter(item => item.category === filter);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4">Bridal Gallery</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            A glimpse into our world of beauty. Explore our portfolio of stunning bridal and party makeovers.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat 
                ? 'bg-maroon text-white shadow-lg' 
                : 'bg-soft-pink text-maroon hover:bg-maroon/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id || index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative overflow-hidden border-none shadow-md aspect-[3/4]">
                  <CardContent className="p-0 h-full">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon/90 via-maroon/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <Badge className="w-fit mb-2 bg-gold text-maroon border-none">{item.category}</Badge>
                      <h3 className="text-white font-serif text-xl mb-1">{item.title}</h3>
                      <div className="flex items-center text-soft-pink/80 text-xs">
                        <Camera className="w-3 h-3 mr-1" />
                        <span>KD Makeovers</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
