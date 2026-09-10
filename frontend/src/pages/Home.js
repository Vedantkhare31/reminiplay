import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, Gamepad2, Heart, Users } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="ReminiPlay" className="h-32 w-32" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          {t('home.title')}
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
        <div className="mt-8 flex justify-center space-x-4 flex-wrap gap-4">
          <Link
            to="/games"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-lg font-semibold transition-colors"
          >
            <Gamepad2 className="w-6 h-6 inline mr-2" />
            {t('home.playGames')}
          </Link>
          <Link
            to="/doctor"
            className="px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl text-lg font-semibold transition-colors"
          >
            <Users className="w-6 h-6 inline mr-2" />
            {t('home.doctorDashboard')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Brain, title: t('home.features.games'), description: t('home.features.gamesDesc') },
          { icon: Heart, title: t('home.features.ai'), description: t('home.features.aiDesc') },
          { icon: Users, title: t('home.features.caregiver'), description: t('home.features.caregiverDesc') }
        ].map((feature, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900">
                <feature.icon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;