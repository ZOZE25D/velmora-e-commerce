import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, Bell, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact our support team. This may include your name, email address, shipping address, and payment information."
    },
    {
      icon: Shield,
      title: "How We Use Your Information",
      content: "We use the information we collect to process your orders, communicate with you about your account, improve our services, and send you marketing communications if you have opted in to receive them."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. Your payment information is encrypted using secure socket layer technology (SSL)."
    },
    {
      icon: Globe,
      title: "Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to analyze trends, administer the website, track users' movements around the website, and gather demographic information about our user base as a whole."
    },
    {
      icon: Bell,
      title: "Changes to This Policy",
      content: "We may update this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice."
    },
    {
      icon: FileText,
      title: "Contact Us",
      content: "If you have any questions about this privacy policy, please contact us at privacy@velmora.com or through our contact page."
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
            <Shield className="w-8 h-8 text-velmora-900 dark:text-velmora-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-velmora-900 dark:text-white mb-6"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-velmora-500 dark:text-velmora-400 max-w-2xl mx-auto text-lg"
          >
            Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-velmora-800 p-8 rounded-[32px] shadow-sm border border-velmora-100 dark:border-white/5 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <section.icon className="w-6 h-6 text-velmora-900 dark:text-velmora-400" />
              </div>
              <h3 className="text-xl font-bold text-velmora-900 dark:text-white mb-4">{section.title}</h3>
              <p className="text-velmora-600 dark:text-velmora-400 leading-relaxed text-sm">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 p-10 bg-velmora-900 dark:bg-white rounded-[40px] text-center text-white dark:text-velmora-900"
        >
          <h2 className="text-2xl font-display font-bold mb-4">Questions about your data?</h2>
          <p className="opacity-80 mb-8 max-w-md mx-auto">Our data protection officer is here to help you with any privacy concerns.</p>
          <button 
            onClick={() => navigate('/contact')}
            className="px-10 py-4 bg-white dark:bg-velmora-900 text-velmora-900 dark:text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Contact Privacy Team
          </button>
        </motion.div>

        <footer className="mt-12 text-center text-velmora-400 text-xs uppercase tracking-widest font-bold">
          Last Updated: March 18, 2026
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
