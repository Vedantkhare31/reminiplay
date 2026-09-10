import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, Calendar, MapPin, Edit2, Save, 
  Shield, Award, Trophy, Clock, Star, Heart, 
  Settings, LogOut, Camera, CheckCircle
} from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    address: user?.address || '',
  });

  const [stats, setStats] = useState({
    totalGames: 0,
    totalScore: 0,
    avgScore: 0,
    bestScore: 0,
    achievements: [],
  });

  useEffect(() => {
    // Load stats
    const saved = localStorage.getItem('reminiplay_game_history');
    if (saved) {
      const history = JSON.parse(saved);
      if (history.length > 0) {
        const totalGames = history.length;
        const totalScore = history.reduce((sum, s) => sum + (s.score || 0), 0);
        const avgScore = Math.round(totalScore / totalGames);
        const bestScore = Math.max(...history.map(s => s.score || 0));
        setStats({ totalGames, totalScore, avgScore, bestScore, achievements: [] });
      }
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Save to localStorage
    const userData = {
      ...user,
      ...formData,
    };
    localStorage.setItem('reminiplay_user', JSON.stringify(userData));
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            {t('profile.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your personal information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center"
        >
          {isEditing ? <Save className="w-5 h-5 mr-2" /> : <Edit2 className="w-5 h-5 mr-2" />}
          {isEditing ? t('common.save') : t('profile.editProfile')}
        </button>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-400 to-indigo-400 flex items-center justify-center text-white text-3xl font-bold">
              {getInitials(formData.name)}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profile.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profile.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profile.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profile.age')}
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('profile.gender')}
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Male">{t('patients.male')}</option>
                      <option value="Female">{t('patients.female')}</option>
                      <option value="Other">{t('patients.other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('patients.address')}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.name')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.phone')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.age')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.age || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.gender')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.gender}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('patients.address')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGames}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.gamesPlayed')}</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <Star className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.avgScore')}</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bestScore}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('game.finalScore')}</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalScore}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all flex items-center"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
};

export default Profile;