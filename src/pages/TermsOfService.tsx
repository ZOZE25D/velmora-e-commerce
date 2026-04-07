import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, AlertCircle, ShoppingBag, CreditCard, Truck, ShieldCheck } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();
  
  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleAgree = () => {
    navigate('/');
  };

  const sections = [
    {
      icon: ShoppingBag,
      title: "Use of Our Services",
      content: "By accessing or using our services, you agree to be bound by these terms. You must be at least 18 years old to use our services or have the consent of a parent or guardian."
    },
    {
      icon: CreditCard,
      title: "Payments and Billing",
      content: "All payments are processed securely. You agree to provide accurate and complete billing information. We reserve the right to refuse or cancel any order at our discretion."
    },
    {
      icon: Truck,
      title: "Shipping and Delivery",
      content: "We aim to deliver your orders as quickly as possible. However, delivery times are estimates and not guaranteed. Risk of loss and title for items pass to you upon delivery to the carrier."
    },
    {
      icon: ShieldCheck,
      title: "Intellectual Property",
      content: "All content on our website, including text, graphics, logos, and images, is the property of Velmora and is protected by copyright and other intellectual property laws."
    },
    {
      icon: AlertCircle,
      title: "Limitation of Liability",
      content: "Velmora shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services."
    },
    {
      icon: CheckCircle2,
      title: "Governing Law",
      content: "These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Velmora operates, without regard to its conflict of law provisions."
    }
  ];

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-velmora-900 transition-colors duration-300 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block p-4 bg-white dark:bg-velmora-800 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5 mb-6"
          >
            <FileText className="w-8 h-8 text-velmora-900 dark:text-velmora-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-velmora-900 dark:text-white mb-6"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-velmora-500 dark:text-velmora-400 max-w-2xl mx-auto text-lg"
          >
            Please read these terms carefully before using our services. By using Velmora, you agree to these terms.
          </motion.p>
        </header>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-velmora-800 p-8 rounded-[32px] shadow-sm border border-velmora-100 dark:border-white/5 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 bg-velmora-50 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                <section.icon className="w-8 h-8 text-velmora-900 dark:text-velmora-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-velmora-900 dark:text-white mb-4">{section.title}</h3>
                <p className="text-velmora-600 dark:text-velmora-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 p-12 bg-white dark:bg-velmora-800 rounded-[40px] text-center border border-velmora-100 dark:border-white/5 shadow-sm"
        >
          <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white mb-4">Acceptance of Terms</h2>
          <p className="text-velmora-500 dark:text-velmora-400 mb-8 max-w-md mx-auto">By continuing to use our website, you acknowledge that you have read and understood these Terms of Service.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              type="button"
              onClick={handleAgree}
              className="px-10 py-4 bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              I Agree
            </button>
            <button 
              type="button"
              onClick={handlePrint}
              className="px-10 py-4 bg-velmora-50 dark:bg-white/5 text-velmora-900 dark:text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-100 dark:hover:bg-white/10 transition-colors"
            >
              Print Terms
            </button>
          </div>
        </motion.div>

        <footer className="mt-12 text-center text-velmora-400 text-xs uppercase tracking-widest font-bold">
          Last Updated: March 18, 2026
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
