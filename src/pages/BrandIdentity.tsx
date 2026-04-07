import React from 'react';
import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';

const BrandIdentity: React.FC = () => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const colors = [
    { name: 'Velmora 50', hex: '#FDFBF7', text: 'text-velmora-900', bg: 'bg-velmora-50' },
    { name: 'Velmora 100', hex: '#F7F3EB', text: 'text-velmora-900', bg: 'bg-velmora-100' },
    { name: 'Velmora 200', hex: '#EEE7D7', text: 'text-velmora-900', bg: 'bg-velmora-200' },
    { name: 'Velmora 300', hex: '#E0D5BC', text: 'text-velmora-900', bg: 'bg-velmora-300' },
    { name: 'Velmora 400', hex: '#C5A059', text: 'text-white', bg: 'bg-velmora-400' },
    { name: 'Velmora 500', hex: '#9C7E41', text: 'text-white', bg: 'bg-velmora-500' },
    { name: 'Velmora 600', hex: '#7D6534', text: 'text-white', bg: 'bg-velmora-600' },
    { name: 'Velmora 700', hex: '#5E4C27', text: 'text-white', bg: 'bg-velmora-700' },
    { name: 'Velmora 800', hex: '#3F331A', text: 'text-white', bg: 'bg-velmora-800' },
    { name: 'Velmora 900', hex: '#1A160F', text: 'text-white', bg: 'bg-velmora-900' },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-velmora-950 pt-32 pb-20 px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl font-display font-bold tracking-tighter mb-4 dark:text-white">VELMORA</h1>
          <p className="text-velmora-500 dark:text-velmora-400 uppercase tracking-[0.3em] text-sm">Brand Identity & Visual Palette</p>
        </motion.div>

        {/* Color Palette Section */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-10 border-b border-velmora-100 pb-4">
            <h2 className="text-2xl font-display italic">01. Color Palette</h2>
            <span className="text-[10px] uppercase tracking-widest text-velmora-400">Warm Organic / Luxury</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {colors.map((color, index) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div 
                  className={`aspect-square rounded-2xl ${color.bg} shadow-sm border border-black/5 flex flex-col justify-end p-4 transition-transform group-hover:-translate-y-1`}
                >
                  <button 
                    onClick={() => handleCopy(color.hex)}
                    className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied === color.hex ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-white" />}
                  </button>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${color.text} opacity-60 mb-1`}>{color.name}</p>
                  <p className={`text-sm font-mono font-bold ${color.text}`}>{color.hex}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-10 border-b border-velmora-100 pb-4">
            <h2 className="text-2xl font-display italic">02. Typography</h2>
            <span className="text-[10px] uppercase tracking-widest text-velmora-400">Google Fonts Integration</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-widest text-velmora-400 mb-4">Display Font</p>
              <h3 className="text-6xl font-display font-bold">Playfair Display</h3>
              <p className="text-velmora-600 leading-relaxed italic">
                Used for headings and brand statements to convey elegance, heritage, and luxury.
              </p>
              <div className="flex space-x-4 text-4xl font-display">
                <span>Aa</span> <span>Bb</span> <span>Cc</span> <span>Dd</span> <span>Ee</span>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-widest text-velmora-400 mb-4">Sans-Serif Font</p>
              <h3 className="text-6xl font-sans font-bold">Inter</h3>
              <p className="text-velmora-600 leading-relaxed">
                Used for body text, navigation, and UI elements to ensure maximum legibility and a modern feel.
              </p>
              <div className="flex space-x-4 text-4xl font-sans">
                <span>Aa</span> <span>Bb</span> <span>Cc</span> <span>Dd</span> <span>Ee</span>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Elements */}
        <section>
          <div className="flex items-center justify-between mb-10 border-b border-velmora-100 pb-4">
            <h2 className="text-2xl font-display italic">03. Visual Elements</h2>
            <span className="text-[10px] uppercase tracking-widest text-velmora-400">UI Components Style</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-velmora-50 rounded-3xl border border-velmora-100">
              <div className="w-12 h-12 bg-velmora-900 rounded-xl mb-6 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full" />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-2">Soft Radii</h4>
              <p className="text-xs text-velmora-500 leading-relaxed">
                Components use a 24px-32px border radius to maintain an organic and approachable feel.
              </p>
            </div>

            <div className="p-8 bg-velmora-900 rounded-3xl text-white">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl mb-6 flex items-center justify-center">
                <div className="w-6 h-[1px] bg-white rotate-45" />
                <div className="w-6 h-[1px] bg-white -rotate-45 absolute" />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-2">Dark Mode</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                High-contrast dark theme using Zinc-950 and Velmora accents for a premium night experience.
              </p>
            </div>

            <div className="p-8 border border-velmora-200 rounded-3xl">
              <div className="w-12 h-12 border border-velmora-200 rounded-xl mb-6 flex items-center justify-center">
                <div className="w-4 h-4 bg-velmora-200 rounded-full animate-pulse" />
              </div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-2">Micro-Interactions</h4>
              <p className="text-xs text-velmora-500 leading-relaxed">
                Subtle spring animations and hover states using Framer Motion for a tactile interface.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-32 pt-10 border-t border-velmora-100 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-velmora-300">© 2026 VELMORA LUXURY APPAREL</p>
        </div>
      </div>
    </div>
  );
};

export default BrandIdentity;
