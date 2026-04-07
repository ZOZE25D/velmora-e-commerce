import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: new Date().toISOString()
      });

      // Add notification for admin
      const { FirestoreService } = await import('../services/FirestoreService');
      await FirestoreService.addNotification({
        title: 'New Message Received',
        message: `${formData.name} sent a message: ${formData.subject}`,
        type: 'message',
        link: '/admin/messages'
      });

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-velmora-900 transition-colors duration-300 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display text-velmora-900 dark:text-white mb-6"
          >
            Get in Touch
          </motion.h1>
          <p className="text-xl text-velmora-700 dark:text-velmora-400 max-w-2xl mx-auto">
            Have a question or just want to say hello? We'd love to hear from you.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-velmora-50 dark:bg-velmora-800 space-y-4">
                <div className="w-12 h-12 bg-velmora-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-velmora-900">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-bold dark:text-white">Email Us</h3>
                <p className="text-velmora-600 dark:text-velmora-400 text-sm">Our team is here to help.</p>
                <a href="mailto:hello@velmora.com" className="block font-bold text-velmora-900 dark:text-white hover:text-velmora-600 transition-colors">
                  hello@velmora.com
                </a>
              </div>
              <div className="p-8 rounded-3xl bg-velmora-50 dark:bg-velmora-800 space-y-4">
                <div className="w-12 h-12 bg-velmora-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-velmora-900">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-bold dark:text-white">Call Us</h3>
                <p className="text-velmora-600 dark:text-velmora-400 text-sm">Mon-Fri from 9am to 6pm.</p>
                <a href="tel:+201234567890" className="block font-bold text-velmora-900 dark:text-white hover:text-velmora-600 transition-colors">
                  +20 123 456 7890
                </a>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-velmora-900 text-white space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Visit Our Flagship</h3>
                  <p className="text-white/70 leading-relaxed">
                    123 Fashion Avenue, Downtown Cairo<br />
                    Egypt, 11511
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex gap-6">
                  {['Instagram', 'Twitter', 'Facebook'].map(social => (
                    <a key={social} href="#" className="text-white/60 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-velmora-50 dark:bg-velmora-800 rounded-3xl border-2 border-green-200 dark:border-green-900/30"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-display text-velmora-900 dark:text-white mb-4">Message Received!</h2>
                  <p className="text-velmora-600 dark:text-velmora-400 mb-8">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-sm font-bold uppercase tracking-widest border-b-2 border-velmora-900 dark:border-white pb-1"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-2">Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-2">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-2">Subject</label>
                    <input
                      required
                      type="text"
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-2">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all flex items-center justify-center gap-3 group"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Send Message
                      </>
                    )}
                  </button>
                  {status === 'error' && (
                    <p className="text-red-500 text-sm text-center font-medium">
                      Failed to send message. Please try again.
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
