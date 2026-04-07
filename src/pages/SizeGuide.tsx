import React from 'react';
import { motion } from 'motion/react';
import { Ruler, Info } from 'lucide-react';

const SizeGuide: React.FC = () => {
  const sizes = [
    { label: 'XS', chest: '82-86', waist: '64-68', hips: '88-92' },
    { label: 'S', chest: '86-90', waist: '68-72', hips: '92-96' },
    { label: 'M', chest: '90-94', waist: '72-76', hips: '96-100' },
    { label: 'L', chest: '94-100', waist: '76-82', hips: '100-106' },
    { label: 'XL', chest: '100-106', waist: '82-88', hips: '106-112' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-velmora-950 transition-colors duration-300 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display text-velmora-900 dark:text-white mb-4"
          >
            Size Guide
          </motion.h1>
          <p className="text-velmora-600 dark:text-velmora-400">Find your perfect fit with our detailed measurement guide.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-20">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <Ruler className="text-velmora-500" /> How to Measure
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-velmora-100 dark:bg-velmora-900 flex items-center justify-center font-bold text-xs dark:text-white">1</div>
                <div>
                  <h4 className="font-bold dark:text-white">Chest</h4>
                  <p className="text-sm text-velmora-600 dark:text-velmora-400">Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-velmora-100 dark:bg-velmora-900 flex items-center justify-center font-bold text-xs dark:text-white">2</div>
                <div>
                  <h4 className="font-bold dark:text-white">Waist</h4>
                  <p className="text-sm text-velmora-600 dark:text-velmora-400">Measure around the narrowest part of your waistline.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-velmora-100 dark:bg-velmora-900 flex items-center justify-center font-bold text-xs dark:text-white">3</div>
                <div>
                  <h4 className="font-bold dark:text-white">Hips</h4>
                  <p className="text-sm text-velmora-600 dark:text-velmora-400">Measure around the fullest part of your hips, about 20cm below your waistline.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-velmora-50 dark:bg-velmora-900 rounded-3xl p-8 border border-velmora-100 dark:border-velmora-800">
            <img 
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800" 
              alt="Measurement Guide" 
              className="w-full h-auto rounded-2xl mb-6"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-start gap-3 text-xs text-velmora-600 dark:text-velmora-400 italic">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <p>Measurements are in centimeters. If you are between sizes, we recommend choosing the larger size for a more comfortable fit.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-velmora-200 dark:border-velmora-800">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-velmora-500">Size</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-velmora-500">Chest (cm)</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-velmora-500">Waist (cm)</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-velmora-500">Hips (cm)</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.label} className="border-b border-velmora-100 dark:border-velmora-900 hover:bg-velmora-50 dark:hover:bg-velmora-900/50 transition-colors">
                  <td className="py-4 px-6 font-bold dark:text-white">{size.label}</td>
                  <td className="py-4 px-6 text-sm text-velmora-700 dark:text-velmora-400">{size.chest}</td>
                  <td className="py-4 px-6 text-sm text-velmora-700 dark:text-velmora-400">{size.waist}</td>
                  <td className="py-4 px-6 text-sm text-velmora-700 dark:text-velmora-400">{size.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
