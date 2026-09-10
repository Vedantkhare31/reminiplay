import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, 
  Moon, Sun, Globe, Bell, Volume2, VolumeX,
  Lock, Shield, Trash2, Save, RefreshCw,
  Monitor, Smartphone, Eye, EyeOff
} from 'lucide-react';

const Settings = () => {
  const { t } = useTranslation();
  const { darkMode, toggleTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    language: 'en',
    darkMode: darkMode,
    soundEnabled: true,
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
    dataSharing: false,
    autoSave: true,
    fontSize: 'medium',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('reminiplay_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Save to localStorage
    localStorage.setItem('reminiplay_settings', JSON.stringify(settings));
    
    // Apply dark mode
    if (settings.darkMode !== darkMode) {
      toggleTheme();
    }
    
    // Apply language
    const { i18n } = require('react-i18next');
    i18n.changeLanguage(settings.language);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Settings saved successfully! ✅');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 800);
  };

  const resetSettings = () => {
    if (window.confirm('Reset all settings to default?')) {
      const defaults = {
        language: 'en',
        darkMode: false,
        soundEnabled: true,
        notifications: true,
        emailNotifications: true,
        pushNotifications: true,
        dataSharing: false,
        autoSave: true,
        fontSize: 'medium',
      };
      setSettings(defaults);
      if (darkMode) toggleTheme();
      localStorage.setItem('reminiplay_settings', JSON.stringify(defaults));
      setSaveMessage('Settings reset to default! 🔄');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const SettingToggle = ({ label, value, onChange, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );

  const SettingSelect = ({ label, value, options, onChange, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            {t('settings.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Customize your ReminiPlay experience</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={resetSettings}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-center">
          {saveMessage}
        </div>
      )}

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-primary-500" />
            {t('settings.appearance')}
          </h2>
          <div className="space-y-2">
            <SettingToggle
              label={t('settings.darkMode')}
              value={settings.darkMode}
              onChange={(val) => handleChange('darkMode', val)}
              icon={settings.darkMode ? Moon : Sun}
            />
            <SettingSelect
              label="Font Size"
              value={settings.fontSize}
              onChange={(val) => handleChange('fontSize', val)}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'xlarge', label: 'Extra Large' },
              ]}
              icon={Eye}
            />
          </div>
        </div>

        {/* Language */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary-500" />
            {t('settings.language')}
          </h2>
          <SettingSelect
            label={t('settings.language')}
            value={settings.language}
            onChange={(val) => handleChange('language', val)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिन्दी' },
              { value: 'as', label: 'অসমীয়া' },
              { value: 'bn', label: 'বাংলা' },
              { value: 'mr', label: 'मराठी' },
              { value: 'gu', label: 'ગુજરાતી' },
              { value: 'pa', label: 'ਪੰਜਾਬੀ' },
              { value: 'or', label: 'ଓଡ଼ିଆ' },
              { value: 'te', label: 'తెలుగు' },
              { value: 'ta', label: 'தமிழ்' },
              { value: 'kn', label: 'ಕನ್ನಡ' },
            ]}
            icon={Globe}
          />
        </div>

        {/* Sound */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-primary-500" />
            {t('settings.sound')}
          </h2>
          <div className="space-y-2">
            <SettingToggle
              label={t('settings.soundEffects')}
              value={settings.soundEnabled}
              onChange={(val) => handleChange('soundEnabled', val)}
              icon={settings.soundEnabled ? Volume2 : VolumeX}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-primary-500" />
            {t('settings.notifications')}
          </h2>
          <div className="space-y-2">
            <SettingToggle
              label={t('settings.emailNotifications')}
              value={settings.emailNotifications}
              onChange={(val) => handleChange('emailNotifications', val)}
              icon={Bell}
            />
            <SettingToggle
              label={t('settings.pushNotifications')}
              value={settings.pushNotifications}
              onChange={(val) => handleChange('pushNotifications', val)}
              icon={Smartphone}
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-500" />
            {t('settings.privacy')}
          </h2>
          <div className="space-y-2">
            <SettingToggle
              label={t('settings.dataSharing')}
              value={settings.dataSharing}
              onChange={(val) => handleChange('dataSharing', val)}
              icon={Lock}
            />
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-red-500">{t('settings.deleteAccount')}</span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This cannot be undone!')) {
                    localStorage.clear();
                    window.location.href = '/login';
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;