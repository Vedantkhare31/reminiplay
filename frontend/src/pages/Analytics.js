import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, TrendingDown, Activity, Brain, Users, Calendar,
  ArrowUp, ArrowDown, Download, Filter, RefreshCw, Zap,
  Clock, Award, Target
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveData, setLiveData] = useState({
    cognitiveScore: 72,
    gamesPlayed: 1247,
    activePatients: 18,
    completionRate: 68
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.random() > 0.7 ? (Math.random() - 0.5) * 5 : 0;
      setLiveData(prev => ({
        cognitiveScore: Math.min(100, Math.max(0, prev.cognitiveScore + change)),
        gamesPlayed: prev.gamesPlayed + Math.floor(Math.random() * 3),
        activePatients: prev.activePatients + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        completionRate: Math.min(100, Math.max(0, prev.completionRate + (Math.random() - 0.5) * 2))
      }));
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const cognitiveData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: t('analytics.cognitiveTrend'),
        data: [65, 68, 72, 70, 75, 78, Math.round(liveData.cognitiveScore)],
        borderColor: 'rgb(79, 109, 245)',
        backgroundColor: 'rgba(79, 109, 245, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: t('analytics.memoryScore'),
        data: [60, 63, 67, 70, 72, 76, Math.round(liveData.cognitiveScore * 0.95)],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: t('analytics.attentionScore'),
        data: [55, 58, 62, 65, 68, 70, Math.round(liveData.cognitiveScore * 0.88)],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const gamePerformanceData = {
    labels: [t('games.memoryLane'), t('games.routineBuilder'), t('games.patternQuest'), t('games.storyWeaver'), t('games.facePlace')],
    datasets: [
      {
        label: t('analytics.gamePerformance'),
        data: [78, 65, 82, 70, 75],
        backgroundColor: [
          'rgba(79, 109, 245, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(236, 72, 153, 0.6)',
        ],
        borderColor: [
          'rgb(79, 109, 245)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const riskDistributionData = {
    labels: [t('analytics.lowRisk'), t('analytics.moderateRisk'), t('analytics.highRisk')],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const stats = [
    { label: t('analytics.avgCognitiveScore'), value: `${Math.round(liveData.cognitiveScore)}%`, change: '+8%', trend: 'up', icon: Brain },
    { label: t('analytics.gamesPlayed'), value: liveData.gamesPlayed.toLocaleString(), change: '+12%', trend: 'up', icon: Activity },
    { label: t('analytics.activePatients'), value: liveData.activePatients, change: '+3', trend: 'up', icon: Users },
    { label: t('analytics.completionRate'), value: `${Math.round(liveData.completionRate)}%`, change: '-2%', trend: 'down', icon: Calendar },
  ];

  const recentActivities = [
    { patient: 'Ram Kumar', activity: `${t('games.memoryLane')} Level 5`, time: '2 hours ago', score: '+15' },
    { patient: 'Sita Devi', activity: t('games.patternQuest'), time: '3 hours ago', score: '-10' },
    { patient: 'Mohan Singh', activity: `${t('games.routineBuilder')} Level 8`, time: '5 hours ago', score: '+20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-500 bg-clip-text text-transparent">
            {t('analytics.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 flex items-center">
            <span>{t('analytics.subtitle')}</span>
            <span className="ml-3 text-sm text-emerald-500 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
              {t('analytics.live')}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {t('analytics.updated')}: {lastUpdated.toLocaleTimeString()}
          </span>
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 glass-card rounded-xl text-gray-900 dark:text-white"
          >
            <option value="week">{t('analytics.thisWeek')}</option>
            <option value="month">{t('analytics.thisMonth')}</option>
            <option value="quarter">{t('analytics.quarter')}</option>
          </select>
          <button 
            onClick={handleRefresh}
            className={`px-4 py-2 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center hover:shadow-xl ${isLoading ? 'opacity-50' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('analytics.refresh')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card rounded-xl p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-lg">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-medium flex items-center ${
                stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
            {t('analytics.cognitiveTrend')}
          </h3>
          <Line data={cognitiveData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } }
            },
            scales: {
              y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { grid: { display: false } }
            }
          }} />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-500" />
            {t('analytics.gamePerformance')}
          </h3>
          <Bar data={gamePerformanceData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { grid: { display: false } }
            }
          }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-amber-500" />
            {t('analytics.riskDistribution')}
          </h3>
          <div className="flex justify-center">
            <Doughnut data={riskDistributionData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
              },
              cutout: '60%'
            }} />
          </div>
        </div>

        <div className="col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-500" />
            {t('analytics.recentActivity')}
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/30 rounded-xl hover-lift">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.patient}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.activity}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-lg ${
                    activity.score.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {activity.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;