import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, User, Phone, Mail, Calendar, Activity, Eye, MessageCircle, 
  Plus, X, Save, Edit2, Trash2, Users as UsersIcon, AlertCircle,
  CheckCircle, Clock
} from 'lucide-react';

// PatientModal Component
const PatientModal = ({ isOpen, onClose, onSubmit, title, submitText, formData, handleInputChange }) => {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('patients.fullName')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={t('patients.placeholder.name')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('patients.age')}
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={t('patients.placeholder.age')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('patients.gender')}
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Male">{t('patients.male')}</option>
                  <option value="Female">{t('patients.female')}</option>
                  <option value="Other">{t('patients.other')}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('patients.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={t('patients.placeholder.phone')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('patients.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={t('patients.placeholder.email')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('patients.caregiver')}
              </label>
              <input
                type="text"
                name="caregiver"
                value={formData.caregiver}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={t('patients.placeholder.caregiver')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('patients.address')}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder={t('patients.placeholder.address')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('patients.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Active">{t('patients.active')}</option>
                <option value="Stable">{t('patients.stable')}</option>
                <option value="Critical">{t('patients.critical')}</option>
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-primary-500/30"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Patients = () => {
  const { t } = useTranslation();
  
  // Load patients from localStorage or use default
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('reminiplay_patients');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { 
        id: 1, 
        name: 'Ram Kumar', 
        age: 72, 
        gender: 'Male',
        cognitiveScore: 78, 
        status: 'Active',
        lastActive: '2024-01-15',
        phone: '+91 98765 43210',
        email: 'ram@email.com',
        caregiver: 'Priya Sharma',
        address: '123, Green Park, Delhi'
      },
      { 
        id: 2, 
        name: 'Sita Devi', 
        age: 68, 
        gender: 'Female',
        cognitiveScore: 45, 
        status: 'Critical',
        lastActive: '2024-01-14',
        phone: '+91 98765 43211',
        email: 'sita@email.com',
        caregiver: 'Rahul Singh',
        address: '456, Blue Apartments, Mumbai'
      },
      { 
        id: 3, 
        name: 'Mohan Singh', 
        age: 75, 
        gender: 'Male',
        cognitiveScore: 62, 
        status: 'Stable',
        lastActive: '2024-01-13',
        phone: '+91 98765 43212',
        email: 'mohan@email.com',
        caregiver: 'Anita Verma',
        address: '789, Rose Villa, Bangalore'
      },
    ];
  });

  // Save to localStorage whenever patients change
  useEffect(() => {
    localStorage.setItem('reminiplay_patients', JSON.stringify(patients));
  }, [patients]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    caregiver: '',
    address: '',
    status: 'Active'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPatient = () => {
    const newPatient = {
      id: Date.now(),
      ...formData,
      cognitiveScore: Math.floor(Math.random() * 40) + 50,
      lastActive: new Date().toISOString().split('T')[0],
    };
    setPatients([...patients, newPatient]);
    setShowAddModal(false);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      caregiver: '',
      address: '',
      status: 'Active'
    });
  };

  const handleEditPatient = () => {
    setPatients(patients.map(p => 
      p.id === selectedPatient.id ? { ...selectedPatient, ...formData } : p
    ));
    setShowEditModal(false);
    setSelectedPatient(null);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      caregiver: '',
      address: '',
      status: 'Active'
    });
  };

  const handleDeletePatient = (id) => {
    if (window.confirm(t('patients.deleteConfirm'))) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData(patient);
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Critical': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
      case 'Stable': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score > 70) return 'text-emerald-600 dark:text-emerald-400';
    if (score > 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.caregiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            {t('patients.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t('patients.subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('patients.addPatient')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('patients.total')}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('patients.active')}</p>
          <p className="text-3xl font-bold text-emerald-600">{patients.filter(p => p.status === 'Active').length}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('patients.critical')}</p>
          <p className="text-3xl font-bold text-rose-600">{patients.filter(p => p.status === 'Critical').length}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('patients.avgScore')}</p>
          <p className="text-3xl font-bold text-primary-600">
            {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.cognitiveScore, 0) / patients.length) : 0}%
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('patients.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Patient List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-50/50 to-indigo-50/50 dark:from-primary-900/20 dark:to-indigo-900/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('patients.title')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('patients.cognitiveScore')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('patients.status')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('patients.caregiver')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('patients.lastActive')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('patients.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-indigo-400 flex items-center justify-center text-white font-semibold text-lg">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{patient.age} {t('common.years')} • {patient.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${getScoreColor(patient.cognitiveScore)}`}>
                      {patient.cognitiveScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {patient.caregiver}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {patient.lastActive}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/patient/${patient.id}`}
                        className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5 text-gray-500 hover:text-primary-600" />
                      </Link>
                      <button 
                        onClick={() => openEditModal(patient)}
                        className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-gray-500 hover:text-amber-600" />
                      </button>
                      <button 
                        onClick={() => handleDeletePatient(patient.id)}
                        className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-gray-500 hover:text-rose-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPatient}
        title={t('patients.addTitle')}
        submitText={t('patients.save')}
        formData={formData}
        handleInputChange={handleInputChange}
      />
      
      <PatientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditPatient}
        title={t('patients.editTitle')}
        submitText={t('common.save')}
        formData={formData}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default Patients;