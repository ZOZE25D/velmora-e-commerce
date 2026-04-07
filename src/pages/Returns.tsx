import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

const Returns: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-display text-velmora-900 dark:text-white mb-4"
          >
            Returns & Exchanges
          </motion.h1>
          <p className="text-velmora-600 dark:text-zinc-400">We want you to love your Velmora pieces. If not, we're here to help.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-velmora-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-velmora-900 dark:text-white">
              <RefreshCcw size={28} />
            </div>
            <h3 className="font-bold dark:text-white">14-Day Returns</h3>
            <p className="text-xs text-velmora-600 dark:text-zinc-500">Return any item within 14 days of delivery.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-velmora-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-velmora-900 dark:text-white">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-bold dark:text-white">Easy Exchanges</h3>
            <p className="text-xs text-velmora-600 dark:text-zinc-500">Swap for a different size or color instantly.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-velmora-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-velmora-900 dark:text-white">
              <AlertCircle size={28} />
            </div>
            <h3 className="font-bold dark:text-white">Full Refunds</h3>
            <p className="text-xs text-velmora-600 dark:text-zinc-500">Get your money back to the original payment method.</p>
          </div>
        </div>

        <div className="bg-velmora-50 dark:bg-zinc-900 rounded-3xl p-8 md:p-12 space-y-10 border border-velmora-100 dark:border-zinc-800">
          <section>
            <h2 className="text-2xl font-bold dark:text-white mb-4">Return Policy</h2>
            <p className="text-velmora-700 dark:text-zinc-400 leading-relaxed text-sm">
              Items must be returned in their original condition: unworn, unwashed, with all tags attached and in the original packaging. For hygiene reasons, earrings, swimwear, and undergarments cannot be returned unless faulty.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold dark:text-white mb-4">How to Return</h2>
            <ol className="space-y-4 text-sm text-velmora-700 dark:text-zinc-400">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-velmora-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Log in to your account and go to "My Orders".</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-velmora-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Select the order and items you wish to return and choose a reason.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-velmora-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Print the prepaid return label and drop off the package at any authorized courier location.</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold dark:text-white mb-4">Refunds</h2>
            <p className="text-velmora-700 dark:text-zinc-400 leading-relaxed text-sm">
              Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. Approved refunds are processed within 5-10 business days.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-velmora-600 dark:text-zinc-500 text-sm flex items-center justify-center gap-2">
            <HelpCircle size={16} /> Still have questions? <a href="/contact" className="text-velmora-900 dark:text-white font-bold underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Returns;
