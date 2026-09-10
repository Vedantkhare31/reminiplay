import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, Activity, Calendar, Clock, Heart, User } from 'lucide-react';

const PatientProfile = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  
  const patient = {
    name: 'Ram Kumar',
    age: 72,
    gender: 'Male',
    cognitiveScore: 78,
    lastActive: '2024-01-15',
    gamesPlayed: 45,
    averageScore: 72,
    trend: 'improving'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">{patient.age} {t('common.years')} • {t(`patients.${patient.gender.toLowerCase()}`)}</p>
            <div className="mt-4 flex space-x-4">
              <span className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <span className="font-semibold">{patient.cognitiveScore}% {t('dashboard.cognitiveScore')}</span>
              </span>
              <span className="flex items-center space-x-2 text-green-500">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">Trend: {patient.trend}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <Clock className="w-8 h-8 text-blue-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{patient.gamesPlayed}</p>
          <p className="text-gray-500">{t('dashboard.gamesPlayed')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <Activity className="w-8 h-8 text-green-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{patient.averageScore}%</p>
          <p className="text-gray-500">{t('dashboard.avgScore')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <Calendar className="w-8 h-8 text-purple-500 mb-4" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{patient.lastActive}</p>
          <p className="text-gray-500">{t('patients.lastActive')}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;