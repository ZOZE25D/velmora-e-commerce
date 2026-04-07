import React from 'react';
import { motion } from 'motion/react';
import { Download, ExternalLink, Newspaper, Radio } from 'lucide-react';

const PRESS_RELEASES = [
  {
    date: 'March 10, 2026',
    title: 'Velmora Announces 100% Sustainable Collection for Summer 2026',
    category: 'Sustainability'
  },
  {
    date: 'February 15, 2026',
    title: 'Velmora Opens New Flagship Store in Downtown Cairo',
    category: 'Retail'
  },
  {
    date: 'January 20, 2026',
    title: 'Velmora Partners with Local Artisans for Limited Edition Accessories',
    category: 'Partnership'
  }
];

const Press: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-velmora-900 transition-colors duration-300 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-display text-velmora-900 dark:text-white mb-6"
          >
            Press Room
          </motion.h1>
          <p className="text-xl text-velmora-700 dark:text-velmora-400 max-w-2xl mx-auto">
            The latest news, media assets, and brand updates from Velmora.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center gap-2">
                <Newspaper className="text-velmora-500" /> Latest Releases
              </h2>
              <div className="space-y-6">
                {PRESS_RELEASES.map((release, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-6 rounded-2xl bg-velmora-50 dark:bg-velmora-800 hover:bg-white dark:hover:bg-velmora-700 border border-transparent hover:border-velmora-200 dark:hover:border-velmora-600 transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-velmora-500 uppercase tracking-widest">{release.date}</span>
                    <h3 className="text-xl font-bold dark:text-white mt-2 group-hover:text-velmora-600 transition-colors">
                      {release.title}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-velmora-600 dark:text-velmora-500">{release.category}</span>
                      <ExternalLink size={16} className="text-velmora-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center gap-2">
                <Radio className="text-velmora-500" /> Media Coverage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-velmora-100 dark:border-velmora-800 italic text-velmora-700 dark:text-velmora-400">
                  "Velmora is setting a new standard for ethical fashion in the region."
                  <div className="mt-4 font-bold not-italic text-velmora-900 dark:text-white">— Vogue Arabia</div>
                </div>
                <div className="p-6 rounded-2xl border border-velmora-100 dark:border-velmora-800 italic text-velmora-700 dark:text-velmora-400">
                  "A perfect blend of modern aesthetics and traditional craftsmanship."
                  <div className="mt-4 font-bold not-italic text-velmora-900 dark:text-white">— Elle Middle East</div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 rounded-3xl bg-velmora-900 text-white">
              <h3 className="text-xl font-bold mb-6">Media Kit</h3>
              <p className="text-white/70 text-sm mb-8">
                Download high-resolution logos, brand guidelines, and executive headshots.
              </p>
              <button className="w-full bg-white text-velmora-900 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-velmora-100 transition-all flex items-center justify-center gap-2">
                <Download size={18} /> Download Kit
              </button>
            </div>

            <div className="p-8 rounded-3xl border border-velmora-200 dark:border-velmora-800">
              <h3 className="text-xl font-bold dark:text-white mb-6">Press Contact</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-velmora-500 font-bold uppercase tracking-widest text-[10px]">Email</div>
                  <a href="mailto:press@velmora.com" className="dark:text-velmora-300 hover:text-velmora-600 transition-colors">press@velmora.com</a>
                </div>
                <div>
                  <div className="text-velmora-500 font-bold uppercase tracking-widest text-[10px]">Phone</div>
                  <div className="dark:text-velmora-300">+20 123 456 7890</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Press;
