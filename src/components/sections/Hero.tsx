import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  const collageImages = [
    {
      id: 1,
      src: "../../../public/images/hero1.jfif",
      className: "absolute top-[18%] left-[5%] w-[18%] aspect-[3/4] z-10",
      delay: 0.2,
      rotation: -1,
      hasTape: true,
      label: "super cute",
      labelPos: "top-[20%] right-[-60px]"
    },
    {
      id: 2,
      src: "../../../public/images/hero2.jfif",
      className: "absolute top-[10%] left-[38%] w-[18%] aspect-[4/3] z-0",
      delay: 0.4,
      rotation: 0,
      hasTape: false
    },
    {
      id: 3,
      src: "../../../public/images/hero3.jpg",
      className: "absolute top-[12%] right-[12%] w-[16%] aspect-[3/4] z-10",
      delay: 0.6,
      rotation: 1,
      hasTape: false
    },
    {
      id: 4,
      src: "../../../public/images/hero4.jfif",
      className: "absolute bottom-[8%] left-[20%] w-[18%] aspect-[3/4] z-20",
      delay: 0.8,
      rotation: 0,
      hasTape: true
    },
    {
      id: 5,
      src: "../../../public/images/hero5.jfif",
      className: "absolute bottom-[5%] left-[55%] w-[14%] aspect-[3/4] z-10",
      delay: 1.0,
      rotation: 0,
      hasTape: true,
      label: "our favorite",
      labelPos: "bottom-[10%] right-[-90px]"
    },
    {
      id: 6,
      src: "../../../public/images/hero6.jfif",
      className: "absolute bottom-[18%] right-[4%] w-[15%] aspect-[3/4] z-0",
      delay: 1.2,
      rotation: 0,
      hasTape: true
    }
  ];

  const arrivalsText = t('nav.newArrivals').split(' ');

  return (
    <section className="relative min-h-[110vh] w-full bg-velmora-50 dark:bg-velmora-900 pt-40 pb-20 px-6 overflow-hidden flex items-center justify-center">
      {/* Subtle Texture Overlay - Natural Paper Feel */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-multiply dark:mix-blend-overlay" />
      
      {/* Subtle Background Radial Gradient - Warm Center Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,196,174,0.25),transparent_80%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_80%)] pointer-events-none" />
      
      {/* Soft Warm Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(212,196,174,0.08)_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(0,0,0,0.1)_100%)] pointer-events-none" />
      
      {/* Scattered Images Collage */}
      <div className="absolute inset-0 w-full h-full hidden lg:block">
        {collageImages.map((img) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 40, rotate: img.rotation }}
            animate={{ opacity: 1, y: 0, rotate: img.rotation }}
            transition={{ duration: 1.2, delay: img.delay, ease: [0.22, 1, 0.36, 1] }}
            className={img.className}
          >
            <div className="relative w-full h-full group">
              {/* Tape Effect */}
              {img.hasTape && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-white/30 backdrop-blur-sm border border-white/10 z-30 rotate-[-1deg]" />
              )}
              
              {/* Image Container */}
              <div className="w-full h-full overflow-hidden shadow-xl shadow-black/5">
                <img 
                  src={img.src} 
                  alt="Collage" 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Handwritten Label */}
              {img.label && (
                <span className={`absolute ${img.labelPos} font-serif italic text-velmora-900/30 dark:text-white/30 text-2xl tracking-tighter whitespace-nowrap pointer-events-none`}>
                  {img.label}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Central Content */}
      <div className="relative z-30 text-center flex flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* "NEW" with Oval Stroke */}
          <div className="relative px-14 py-4 mb-4">
            <svg className="absolute inset-0 w-full h-full text-velmora-900 dark:text-white pointer-events-none" viewBox="0 0 200 80" preserveAspectRatio="none">
              <motion.ellipse 
                cx="100" cy="40" rx="95" ry="38" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.75"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
              />
            </svg>
            <span className="text-5xl md:text-7xl font-display font-medium text-velmora-950 dark:text-white uppercase tracking-[0.15em]">
              {arrivalsText[0]}
            </span>
          </div>

          {/* "ARRIVALS" */}
          <h1 className="text-6xl md:text-[10rem] font-display font-medium text-velmora-950 dark:text-white uppercase tracking-[-0.03em] leading-[0.8]">
            {arrivalsText[1] || 'ARRIVALS'}
          </h1>
        </motion.div>

        {/* Shop Now Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-4"
        >
          <Link to="/category/new-arrivals">
            <button className="px-16 py-5 border-2 border-velmora-900 dark:border-white text-velmora-900 dark:text-white text-[14px] font-black uppercase tracking-[0.4em] hover:bg-velmora-900 hover:text-white dark:hover:bg-white dark:hover:text-velmora-900 transition-all duration-500 shadow-xl hover:shadow-velmora-900/40 dark:hover:shadow-white/20 relative overflow-hidden group">
              <span className="relative z-10">{t('SHOP NOW')}</span>
              <div className="absolute inset-0 bg-velmora-900 dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Mobile Collage (Simplified) */}
      <div className="absolute inset-0 w-full h-full lg:hidden pointer-events-none opacity-30">
        <img 
          src="../../../public/images/samll hero 11.jfif" 
          className="absolute top-[10%] left-[-10%] w-1/2 aspect-[3/4] object-cover"
          referrerPolicy="no-referrer"
        />
        <img 
          src="../../../public/images/samll hero 21.jfif" 
          className="absolute bottom-[10%] right-[-10%] w-1/2 aspect-[3/4] object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
};

export default Hero;
