import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Target, AlertCircle, CheckCircle, XCircle, Clock,
  Activity, Calendar, RefreshCw, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, LogIn
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (v, decimals = 1) =>
  v === null || v === undefined ? '—' : Number(v).toFixed(decimals);

const EMPTY_METRICS = {
  cognitiveScore: 0,
  accuracy: 0,
  errorRate: 0,
  taskCompletionRate: 0,
  missedAttemptRate: 0,
  medianResponseTime: 0,
  gamesPlayed: 0,
  engagementDays: 0,
  byGame: [],
};

// ─── KPI Card ───────────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, unit = '', formula, color, trend }) => {
  const colors = {
    blue:   { bg: 'bg-blue-500/10 dark:bg-blue-500/20',   icon: 'text-blue-500',   border: 'border-blue-500/20' },
    green:  { bg: 'bg-green-500/10 dark:bg-green-500/20', icon: 'text-green-500',  border: 'border-green-500/20' },
    red:    { bg: 'bg-red-500/10 dark:bg-red-500/20',     icon: 'text-red-500',    border: 'border-red-500/20' },
    purple: { bg: 'bg-purple-500/10 dark:bg-purple-500/20',icon: 'text-purple-500',border: 'border-purple-500/20' },
    orange: { bg: 'bg-orange-500/10 dark:bg-orange-500/20',icon: 'text-orange-500',border: 'border-orange-500/20' },
    cyan:   { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',   icon: 'text-cyan-500',   border: 'border-cyan-500/20' },
    indigo: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',icon: 'text-indigo-500',border: 'border-indigo-500/20' },
    amber:  { bg: 'bg-amber-500/10 dark:bg-amber-500/20', icon: 'text-amber-500',  border: 'border-amber-500/20' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`rounded-2xl p-5 border ${c.border} bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
        {value}<span className="text-lg font-medium text-gray-400 ml-0.5">{unit}</span>
      </p>
      <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
      {formula && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-mono">{formula}</p>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Analytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [sessions, setSessions] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeframe, setTimeframe] = useState('month');
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
      const [meRes, trendRes] = await Promise.all([
        api.get('/api/analytics/me'),
        api.get(`/api/analytics/trend?days=${days}`),
      ]);
      if (meRes.data && meRes.data.success) {
        setMetrics(meRes.data.metrics || EMPTY_METRICS);
        setSessions(meRes.data.sessions || []);
      }
      if (trendRes.data && trendRes.data.success) {
        setTrend(trendRes.data.trend || []);
      }
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.warn('Analytics fetch notice:', err?.response?.data || err?.message);
      // If 401/403 or network, don't crash the screen — allow the dashboard UI to stay visible
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('unauthorized');
      } else {
        // Still keep empty metrics so the full dashboard layout and KPI cards are visible
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe]);

  // Initial fetch + 10-second polling + live event listener on session log
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(), 10000);

    const onSessionLogged = () => {
      fetchData(false);
    };
    window.addEventListener('reminiplay_session_logged', onSessionLogged);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('reminiplay_session_logged', onSessionLogged);
    };
  }, [fetchData]);

  const handleRefresh = () => fetchData(true);

  // ── Filter sessions by timeframe ─────────────────────────────────────────
  const filteredSessions = sessions.filter(s => {
    const daysAgo = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : Infinity;
    if (!isFinite(daysAgo)) return true;
    return new Date(s.createdAt) >= new Date(Date.now() - daysAgo * 86400000);
  });

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading analytics…</p>
      </div>
    );
  }

  const hasData = metrics.gamesPlayed > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Section 1: Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Research Analytics Dashboard
            <span className="flex items-center gap-1.5 text-sm font-normal text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </h1>
          {lastUpdated && (
            <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time filter */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
            {[['week', 'Week'], ['month', 'Month'], ['all', 'All Time']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTimeframe(val)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeframe === val
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Guest / Auth reminder banner */}
      {error === 'unauthorized' ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm gap-3">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-blue-500 shrink-0" />
            <span>You are viewing local session data. Sign in to sync and protect your permanent clinical records.</span>
          </div>
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs whitespace-nowrap transition-colors shadow-sm"
          >
            Sign In
          </Link>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      ) : null}

      {/* Empty state */}
      {!hasData && !error && (
        <div className="text-center py-16 rounded-2xl bg-white dark:bg-slate-800 border border-dashed border-gray-200 dark:border-slate-700">
          <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">No game sessions recorded yet</h3>
          <p className="text-sm text-gray-400 mt-2">Play a game to see your analytics appear here in real time.</p>
        </div>
      )}

      {/* ── Section 2: KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Brain}
          label="Cognitive Score"
          value={fmt(metrics.cognitiveScore)}
          unit="%"
          formula="(Correct / Total) × 100"
          color="blue"
        />
        <KpiCard
          icon={Target}
          label="Accuracy"
          value={fmt(metrics.accuracy)}
          unit="%"
          formula="(Correct / Scored) × 100"
          color="green"
        />
        <KpiCard
          icon={AlertCircle}
          label="Error Rate"
          value={fmt(metrics.errorRate)}
          unit="%"
          formula="(Incorrect / Scored) × 100"
          color="red"
        />
        <KpiCard
          icon={CheckCircle}
          label="Completion Rate"
          value={fmt(metrics.taskCompletionRate)}
          unit="%"
          formula="(Completed / Started) × 100"
          color="purple"
        />
        <KpiCard
          icon={XCircle}
          label="Missed-Attempt Rate"
          value={fmt(metrics.missedAttemptRate)}
          unit="%"
          formula="(Missed / Total) × 100"
          color="orange"
        />
        <KpiCard
          icon={Clock}
          label="Median Response Time"
          value={fmt(metrics.medianResponseTime, 2)}
          unit="s"
          formula="median(responseTimes)"
          color="cyan"
        />
        <KpiCard
          icon={Activity}
          label="Games Played"
          value={metrics.gamesPlayed}
          formula="Total sessions"
          color="indigo"
        />
        <KpiCard
          icon={Calendar}
          label="Engagement"
          value={`${metrics.engagementDays} / 30`}
          formula="Active days (last 30)"
          color="amber"
        />
      </div>

      {/* ── Section 3: Charts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cognitive Score Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Cognitive Score &amp; Accuracy Trend
          </h3>
          {trend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              No trend data for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                  formatter={(val) => [`${Number(val).toFixed(1)}%`]}
                />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="cognitiveScore" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Cognitive Score" />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Accuracy" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Game Performance Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-emerald-500" />
            Game Performance Breakdown
          </h3>
          {(!metrics.byGame || metrics.byGame.length === 0) ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              No game breakdown data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.byGame} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                  formatter={(val, name) => name === 'accuracy' ? [`${val}%`, 'Accuracy'] : [val, name]}
                />
                <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} name="Accuracy (%)" />
                <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Section 4: Sessions Table ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Recent Sessions
            <span className="ml-auto text-xs font-normal text-gray-400">Last 10 sessions</span>
          </h3>
        </div>
        {filteredSessions.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No sessions recorded for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                  {['Game', 'Stage', 'Score', 'Accuracy', 'Completion', 'Duration', 'Date'].map(h => (
                    <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {filteredSessions.slice(0, 10).map((s, i) => {
                  const scored = s.correctAttempts + s.incorrectAttempts;
                  const acc = scored > 0 ? ((s.correctAttempts / scored) * 100).toFixed(1) : '—';
                  const comp = s.startedTasks > 0 ? ((s.completedTasks / s.startedTasks) * 100).toFixed(1) : '—';
                  const dur = s.sessionDuration > 0
                    ? s.sessionDuration >= 60
                      ? `${Math.floor(s.sessionDuration / 60)}m ${s.sessionDuration % 60}s`
                      : `${s.sessionDuration}s`
                    : '—';
                  const date = new Date(s.createdAt).toLocaleDateString();
                  return (
                    <tr key={s.id || i} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-white capitalize">
                        {s.gameType === 'gestureRubik' ? 'Gesture Rubik' : s.gameType === 'gestureDraw' ? 'Gesture Draw' : s.gameType}
                      </td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{s.stage}</td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{s.score}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          acc !== '—' && Number(acc) >= 65
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {acc !== '—' ? `${acc}%` : acc}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{comp !== '—' ? `${comp}%` : comp}</td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{dur}</td>
                      <td className="px-6 py-3 text-gray-400 text-xs">{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
