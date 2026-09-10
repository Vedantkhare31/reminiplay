import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Activity, AlertTriangle, Brain, TrendingUp, TrendingDown, Eye, MessageCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { t } = useTranslation();

  const [patients] = useState([
    { id: 1, name: 'Ram Kumar', age: 72, cognitiveScore: 78, status: 'Active', lastActive: '2024-01-15' },
    { id: 2, name: 'Sita Devi', age: 68, cognitiveScore: 45, status: 'Critical', lastActive: '2024-01-14' },
    { id: 3, name: 'Mohan Singh', age: 75, cognitiveScore: 62, status: 'Stable', lastActive: '2024-01-13' },
    { id: 4, name: 'Lakshmi Bai', age: 70, cognitiveScore: 88, status: 'Active', lastActive: '2024-01-15' },
  ]);

  const stats = [
    { label: t('doctor.totalPatients'), value: '24', icon: Users, color: 'text-blue-500' },
    { label: t('doctor.criticalAlerts'), value: '3', icon: AlertTriangle, color: 'text-red-500' },
    { label: t('doctor.avgCognitiveScore'), value: '68%', icon: Brain, color: 'text-purple-500' },
    { label: t('doctor.activeToday'), value: '18', icon: Activity, color: 'text-green-500' },
  ];

  const getStatusColor = (status) => {
    const statusMap = {
      'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'Stable': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('doctor.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('doctor.patientList')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm">{t('patients.title')}</th>
                <th className="px-4 py-3 text-left text-sm">{t('patients.cognitiveScore')}</th>
                <th className="px-4 py-3 text-left text-sm">{t('patients.status')}</th>
                <th className="px-4 py-3 text-left text-sm">{t('patients.lastActive')}</th>
                <th className="px-4 py-3 text-left text-sm">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="font-semibold text-primary-600">{patient.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.age} {t('common.years')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      patient.cognitiveScore > 70 ? 'bg-green-100 text-green-700' :
                      patient.cognitiveScore > 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {patient.cognitiveScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                      {t(`patients.${patient.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{patient.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-5 h-5 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;