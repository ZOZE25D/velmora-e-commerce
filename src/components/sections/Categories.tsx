import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

const Categories: React.FC = () => {
  const { t } = useTranslation();

  const categories = [
    {
      title: t('nav.women'),
      slug: "women",
      image: "../../../public/images/women ctegory.jfif",
      className: "md:col-span-2 md:row-span-2 h-[600px] md:h-full"
    },
    {
      title: t('nav.men'),
      slug: "men",
      image: "../../../public/images/men ctegory.jfif",
      className: "md:col-span-1 md:row-span-1 h-[300px] md:h-full"
    },
    {
      title: t('nav.accessories'),
      slug: "accessories",
      image: "../../../public/images/accessories ctegory.jfif",
      className: "md:col-span-1 md:row-span-1 h-[300px] md:h-full"
    },
    {
      title: t('nav.shoes'),
      slug: "shoes",
      image: "../../../public/images/shoes ctegory.jfif",
      className: "md:col-span-3 md:row-span-1 h-[300px] md:h-full"
    }
  ];

  return (
    <section className="py-32 px-6 bg-velmora-50 dark:bg-velmora-900/40 transition-colors duration-500 relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-velmora-200/20 dark:bg-velmora-800/10 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-velmora-100/30 dark:bg-velmora-700/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-bold uppercase tracking-[0.5em] text-velmora-600 dark:text-velmora-400 block mb-6"
            >
              {t('home.explore')}
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold tracking-tighter dark:text-velmora-50 leading-none"
            >
              {t('home.shopByCategory')}
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-velmora-600/60 dark:text-velmora-100/40 max-w-xs text-sm font-light leading-relaxed"
          >
            Discover our curated collections designed for every occasion and style preference.
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:h-[900px]"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
                }
              }}
              className={`relative overflow-hidden group cursor-pointer rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 ${cat.className}`}
            >
              <Link to={`/category/${cat.slug}`} className="block h-full">
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 mb-2 block">
                        0{i + 1}
                      </span>
                      <h3 className="text-white text-4xl md:text-5xl font-display font-bold tracking-tight">
                        {cat.title}
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;
