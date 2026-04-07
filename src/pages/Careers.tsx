import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FirestoreService } from '../services/FirestoreService';

const JOBS = [
  {
    id: '1',
    title: 'Senior Fashion Designer',
    location: 'Cairo, Egypt',
    type: 'Full-time',
    department: 'Design'
  },
  {
    id: '2',
    title: 'E-commerce Manager',
    location: 'Remote',
    type: 'Full-time',
    department: 'Marketing'
  },
  {
    id: '3',
    title: 'Supply Chain Coordinator',
    location: 'Alexandria, Egypt',
    type: 'Full-time',
    department: 'Operations'
  }
];

const Careers: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    resumeUrl: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setStatus('loading');
    try {
      await addDoc(collection(db, 'applications'), {
        ...formData,
        position: JOBS.find(j => j.id === selectedJob)?.title,
        createdAt: new Date().toISOString()
      });

      // Add notification for admin
      const position = JOBS.find(j => j.id === selectedJob)?.title;
      await FirestoreService.addNotification({
        title: 'New Job Application',
        message: `${formData.fullName} applied for ${position}.`,
        type: 'order',
        link: '/admin/applications'
      });

      setStatus('success');
      setFormData({ fullName: '', email: '', resumeUrl: '', message: '' });
      setTimeout(() => {
        setStatus('idle');
        setSelectedJob(null);
      }, 5000);
    } catch (error) {
      console.error('Application error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-velmora-900 transition-colors duration-300 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-display text-velmora-900 dark:text-white mb-6"
          >
            Join the Team
          </motion.h1>
          <p className="text-xl text-velmora-700 dark:text-velmora-400 max-w-2xl mx-auto">
            We're looking for passionate individuals to help us redefine modern fashion.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Job List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold dark:text-white mb-8">Open Positions</h2>
            {JOBS.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-2xl bg-white dark:bg-velmora-800 shadow-sm border-2 transition-all cursor-pointer ${
                  selectedJob === job.id ? 'border-velmora-600' : 'border-transparent'
                }`}
                onClick={() => setSelectedJob(job.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-velmora-600 dark:text-velmora-400">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {job.department}</span>
                    </div>
                  </div>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      selectedJob === job.id 
                        ? 'bg-velmora-600 text-white' 
                        : 'bg-velmora-100 dark:bg-velmora-700 text-velmora-900 dark:text-white'
                    }`}
                  >
                    {selectedJob === job.id ? 'Selected' : 'Apply'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AnimatePresence mode="wait">
                {!selectedJob ? (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 rounded-3xl bg-velmora-100 dark:bg-velmora-800 text-center border-2 border-dashed border-velmora-300 dark:border-velmora-700"
                  >
                    <Briefcase className="mx-auto mb-4 text-velmora-400" size={48} />
                    <p className="text-velmora-600 dark:text-velmora-400">Select a position to start your application.</p>
                  </motion.div>
                ) : status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-3xl bg-green-50 dark:bg-green-900/20 text-center border-2 border-green-200 dark:border-green-900/50"
                  >
                    <CheckCircle2 className="mx-auto mb-4 text-green-500" size={48} />
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">Application Sent!</h3>
                    <p className="text-green-700 dark:text-green-500/80 text-sm">We'll review your profile and get back to you soon.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="p-8 rounded-3xl bg-white dark:bg-velmora-800 shadow-xl space-y-4"
                  >
                    <h3 className="text-xl font-bold dark:text-white mb-4">Apply for {JOBS.find(j => j.id === selectedJob)?.title}</h3>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-1">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-1">Resume Link (URL)</label>
                      <input
                        required
                        type="url"
                        placeholder="LinkedIn or Drive link"
                        value={formData.resumeUrl}
                        onChange={e => setFormData({...formData, resumeUrl: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-velmora-500 mb-1">Message</label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Application</>}
                    </button>
                    {status === 'error' && <p className="text-red-500 text-xs text-center">Failed to send. Please try again.</p>}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
