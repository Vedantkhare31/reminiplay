import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, Plus, Check, Clock, Calendar, Pill, Droplet, Coffee, 
  Activity, X, Filter, Save, Trash2, AlertCircle, CheckCircle,
  Clock as ClockIcon, BellRing
} from 'lucide-react';

// ReminderModal Component
const ReminderModal = ({ isOpen, onClose, onSubmit, formData, handleInputChange, patients }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            <BellRing className="w-6 h-6 inline mr-2 text-primary-500" />
            {t('reminders.addTitle')}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reminders.type')}
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="medication">{t('reminders.medication')}</option>
                <option value="hydration">{t('reminders.hydration')}</option>
                <option value="appointment">{t('reminders.appointment')}</option>
                <option value="activity">{t('reminders.activity')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reminders.titleLabel')}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={t('reminders.placeholder.title')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reminders.time')}
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={t('reminders.placeholder.time')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reminders.date')}
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={t('reminders.placeholder.date')}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reminders.patient')}
              </label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('reminders.selectPatient')}</option>
                {patients.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {t('reminders.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Reminders = () => {
  const { t } = useTranslation();
  
  // Load reminders from localStorage
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('reminiplay_reminders');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 1, type: 'medication', title: 'Take Blood Pressure Medicine', time: '08:00 AM', date: '2024-01-16', status: 'pending', patient: 'Ram Kumar' },
      { id: 2, type: 'hydration', title: 'Drink Water', time: '10:00 AM', date: '2024-01-16', status: 'completed', patient: 'Sita Devi' },
      { id: 3, type: 'appointment', title: 'Doctor Appointment', time: '02:30 PM', date: '2024-01-16', status: 'pending', patient: 'Mohan Singh' },
      { id: 4, type: 'medication', title: 'Take Evening Medicine', time: '06:00 PM', date: '2024-01-16', status: 'pending', patient: 'Lakshmi Bai' },
      { id: 5, type: 'activity', title: 'Morning Walk', time: '07:00 AM', date: '2024-01-16', status: 'completed', patient: 'Ram Kumar' },
    ];
  });

  // Save to localStorage whenever reminders change
  useEffect(() => {
    localStorage.setItem('reminiplay_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Load patients from localStorage
  const [allPatients, setAllPatients] = useState(() => {
    const saved = localStorage.getItem('reminiplay_patients');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Listen for changes in patients data from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('reminiplay_patients');
      if (saved) {
        setAllPatients(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const saved = localStorage.getItem('reminiplay_patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(allPatients)) {
          setAllPatients(parsed);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [allPatients]);

  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'medication',
    title: '',
    time: '',
    date: '',
    patient: '',
    status: 'pending'
  });

  // Get unique patient names for the dropdown
  const patients = [...new Set(allPatients.map(p => p.name))];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'medication': return <Pill className="w-5 h-5 text-rose-500" />;
      case 'hydration': return <Droplet className="w-5 h-5 text-cyan-500" />;
      case 'appointment': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'activity': return <Activity className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'medication': return 'border-rose-500 bg-rose-50 dark:bg-rose-900/10';
      case 'hydration': return 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10';
      case 'appointment': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/10';
      case 'activity': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddReminder = () => {
    const newReminder = {
      id: Date.now(),
      ...formData,
    };
    setReminders([newReminder, ...reminders]);
    setShowAddModal(false);
    setFormData({
      type: 'medication',
      title: '',
      time: '',
      date: '',
      patient: '',
      status: 'pending'
    });
  };

  const toggleStatus = (id) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: r.status === 'completed' ? 'pending' : 'completed' } : r
    ));
  };

  const deleteReminder = (id) => {
    if (window.confirm(t('reminders.deleteConfirm'))) {
      setReminders(reminders.filter(r => r.id !== id));
    }
  };

  const filteredReminders = filter === 'all' 
    ? reminders 
    : reminders.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-500 bg-clip-text text-transparent">
            {t('reminders.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t('reminders.subtitle')}</p>
          <p className="text-sm text-gray-500 mt-1">👤 {patients.length} {t('patients.title').toLowerCase()} {t('reminders.all')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('reminders.newReminder')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('reminders.total')}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{reminders.length}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('reminders.pending')}</p>
          <p className="text-3xl font-bold text-amber-600">{reminders.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('reminders.completed')}</p>
          <p className="text-3xl font-bold text-emerald-600">{reminders.filter(r => r.status === 'completed').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all' ? 'bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-lg shadow-primary-500/30' : 'glass text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/20'
          }`}
        >
          {t('common.all')}
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'pending' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 'glass text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/20'
          }`}
        >
          ⏳ {t('reminders.pending')}
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'glass text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
          }`}
        >
          ✅ {t('reminders.completed')}
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.map((reminder) => (
          <div 
            key={reminder.id}
            className={`glass-card rounded-xl border-l-4 ${getTypeColor(reminder.type)} p-4 transition-all hover:shadow-xl hover-lift`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {getTypeIcon(reminder.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {reminder.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {reminder.time}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {reminder.date}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      👤 {reminder.patient}
                    </span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      reminder.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {reminder.status === 'completed' ? '✅ ' + t('reminders.completed') : '⏳ ' + t('reminders.pending')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => toggleStatus(reminder.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    reminder.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}
                >
                  {reminder.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReminders.length === 0 && (
          <div className="text-center py-12 glass-card rounded-xl">
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">{t('reminders.noReminders')}</h3>
            <p className="text-gray-500 dark:text-gray-500">{t('reminders.noRemindersDesc')}</p>
          </div>
        )}
      </div>

      <ReminderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddReminder}
        formData={formData}
        handleInputChange={handleInputChange}
        patients={patients}
      />
    </div>
  );
};

export default Reminders;