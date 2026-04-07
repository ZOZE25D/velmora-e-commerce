import React from 'react';
import { motion } from 'motion/react';
import { Truck, Globe, Clock, ShieldCheck } from 'lucide-react';

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-velmora-900 transition-colors duration-300 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display text-velmora-900 dark:text-white mb-4"
          >
            Shipping Information
          </motion.h1>
          <p className="text-velmora-600 dark:text-velmora-400">Everything you need to know about getting your Velmora pieces.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl bg-velmora-50 dark:bg-velmora-800 border border-velmora-100 dark:border-velmora-700">
            <Truck className="text-velmora-600 mb-4" size={32} />
            <h3 className="text-xl font-bold dark:text-white mb-2">Domestic Shipping</h3>
            <p className="text-sm text-velmora-700 dark:text-velmora-400 leading-relaxed">
              We offer flat-rate shipping across Egypt. Orders are typically processed within 24-48 hours.
            </p>
            <ul className="mt-4 space-y-2 text-sm font-medium dark:text-velmora-300">
              <li>• Cairo & Giza: 2-3 business days</li>
              <li>• Alexandria: 3-4 business days</li>
              <li>• Other Governorates: 5-7 business days</li>
            </ul>
          </div>
          <div className="p-8 rounded-3xl bg-velmora-50 dark:bg-velmora-800 border border-velmora-100 dark:border-velmora-700">
            <Globe className="text-velmora-600 mb-4" size={32} />
            <h3 className="text-xl font-bold dark:text-white mb-2">International Shipping</h3>
            <p className="text-sm text-velmora-700 dark:text-velmora-400 leading-relaxed">
              We ship to over 50 countries worldwide. International rates are calculated at checkout based on weight and destination.
            </p>
            <ul className="mt-4 space-y-2 text-sm font-medium dark:text-velmora-300">
              <li>• Express: 3-5 business days</li>
              <li>• Standard: 7-14 business days</li>
            </ul>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
              <Clock className="text-velmora-500" size={24} /> Confirmation Times
            </h2>
            <p className="text-velmora-700 dark:text-velmora-400 leading-relaxed">
              Orders placed before 12:00 PM CLT are usually dispatched the same day. During peak seasons or sale events, confirmation may take up to 3 business days. You will receive a confirmation email with tracking details as soon as your order leaves our warehouse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-velmora-500" size={24} /> Shipping Protection
            </h2>
            <p className="text-velmora-700 dark:text-velmora-400 leading-relaxed">
              All Velmora shipments are insured against theft and accidental damage while in transit. Once the package has been delivered and signed for, it is no longer covered by our insurance.
            </p>
          </section>

          <div className="p-8 rounded-3xl bg-velmora-900 text-white text-center">
            <h3 className="text-xl font-bold mb-4">Free Shipping</h3>
            <p className="text-white/70 mb-6">We offer free standard shipping on all domestic orders over $150.</p>
            <button className="px-8 py-3 bg-white text-velmora-900 rounded-full font-bold uppercase tracking-widest hover:bg-velmora-100 transition-colors">
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
