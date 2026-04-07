import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search } from 'lucide-react';

const FAQS = [
  {
    question: "How long does shipping take?",
    answer: "Domestic orders within Egypt typically take 2-5 business days. International orders can take between 5-14 business days depending on the shipping method selected at checkout."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 14-day return policy for all items in their original condition. Please note that for hygiene reasons, certain items like earrings and swimwear cannot be returned."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you will receive an email with a tracking number and a link to our tracking page. You can also track your order directly on our 'Order Tracking' page using your Order ID."
  },
  {
    question: "Are your materials sustainable?",
    answer: "Yes, sustainability is at our core. We use organic cotton, recycled polyester, and other eco-friendly materials. You can read more about our commitment on our Sustainability page."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location and are calculated at checkout."
  }
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-velmora-900 transition-colors duration-300 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display text-velmora-900 dark:text-white mb-6"
          >
            Frequently Asked Questions
          </motion.h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-velmora-400" size={18} />
            <input 
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-full bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white transition-all"
            />
          </div>
        </header>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-velmora-100 dark:border-velmora-800 rounded-2xl overflow-hidden"
              >
                <button 
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-velmora-50 dark:hover:bg-velmora-800 transition-colors"
                >
                  <span className="font-bold dark:text-white">{faq.question}</span>
                  {activeIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-sm text-velmora-600 dark:text-velmora-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-velmora-500">
              No results found for "{searchQuery}". Try a different keyword.
            </div>
          )}
        </div>

        <div className="mt-20 p-10 rounded-3xl bg-velmora-900 text-white text-center">
          <h3 className="text-xl font-bold mb-4">Still need help?</h3>
          <p className="text-white/70 mb-8">Our customer support team is available 24/7 to assist you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-3 bg-white text-velmora-900 rounded-full font-bold uppercase tracking-widest hover:bg-velmora-100 transition-colors">
              Contact Us
            </a>
            <a href="mailto:support@velmora.com" className="px-8 py-3 border border-white/30 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
