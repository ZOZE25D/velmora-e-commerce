import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Recycle, Droplets, Wind } from 'lucide-react';

const Sustainability: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-velmora-950 transition-colors duration-300">
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1920"
            alt="Sustainability Hero"
            className="w-full h-full object-cover opacity-70 dark:opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-velmora-950" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display text-velmora-900 dark:text-white mb-4"
          >
            Sustainability
          </motion.h1>
          <p className="text-xl text-velmora-700 dark:text-velmora-400 font-sans italic">
            Fashion with a Conscience
          </p>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <Leaf size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white">Eco-Fabrics</h3>
            <p className="text-velmora-600 dark:text-velmora-400 text-sm">
              We prioritize organic cotton, recycled polyester, and Tencel™ to reduce our environmental footprint.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
              <Droplets size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white">Water Saving</h3>
            <p className="text-velmora-600 dark:text-velmora-400 text-sm">
              Our dyeing processes use 70% less water than industry standards through innovative closed-loop systems.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto text-orange-600">
              <Recycle size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white">Zero Waste</h3>
            <p className="text-velmora-600 dark:text-velmora-400 text-sm">
              We repurpose fabric scraps into accessories and use 100% compostable packaging for all shipments.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto text-purple-600">
              <Wind size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white">Carbon Neutral</h3>
            <p className="text-velmora-600 dark:text-velmora-400 text-sm">
              We offset our entire supply chain's carbon emissions through global reforestation projects.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Section */}
      <section className="py-24 bg-velmora-50 dark:bg-velmora-900 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display text-velmora-900 dark:text-white mb-6">
              Our Ethical Commitment
            </h2>
            <div className="space-y-6 text-velmora-700 dark:text-velmora-300 leading-relaxed">
              <p>
                At Velmora, sustainability isn't just a buzzword—it's the foundation of everything we do. We believe that fashion should be a force for good, respecting both the people who make our clothes and the planet we all share.
              </p>
              <p>
                We work exclusively with factories that provide fair wages, safe working conditions, and respect for workers' rights. Every partner in our supply chain is audited annually to ensure they meet our high ethical standards.
              </p>
              <p>
                By choosing Velmora, you're supporting a slower, more intentional approach to fashion that values quality over quantity and longevity over trends.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"
              alt="Ethical Production"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Sustainability;
