import api from './api';

/**
 * Universal game session logger for ReminiPlay research metrics.
 * Safely posts to backend /api/analytics/session and alerts any listening dashboards.
 *
 * @param {Object} data
 * @param {string} data.gameType - Name/ID of game (e.g., 'memoryLane', 'patternQuest', 'gestureRubik', 'gestureDraw')
 * @param {number} data.correctAttempts - Number of correct moves/answers
 * @param {number} data.incorrectAttempts - Number of incorrect moves/answers
 * @param {number} data.missedAttempts - Number of timed-out or skipped moves
 * @param {number} data.totalAttempts - Total moves/actions
 * @param {number} data.startedTasks - Tasks/levels started (usually 1 per session/stage)
 * @param {number} data.completedTasks - Tasks/levels completed (1 if cleared, 0 if abandoned/lost)
 * @param {number[]} data.responseTimes - Array of reaction/response times in seconds
 * @param {number} data.sessionDuration - Total seconds spent in session
 * @param {number} data.stage - Level or stage number
 * @param {number} data.score - Points scored in this session
 */
export async function logGameSession(data) {
  try {
    let userId = null;
    try {
      const stored = localStorage.getItem('reminiplay_user');
      if (stored) {
        const u = JSON.parse(stored);
        userId = u?.id || null;
      }
    } catch (e) {}

    const payload = {
      gameType: data.gameType || 'unknown',
      correctAttempts: Number(data.correctAttempts || 0),
      incorrectAttempts: Number(data.incorrectAttempts || 0),
      missedAttempts: Number(data.missedAttempts || 0),
      totalAttempts: Number(
        data.totalAttempts !== undefined
          ? data.totalAttempts
          : (data.correctAttempts || 0) + (data.incorrectAttempts || 0) + (data.missedAttempts || 0)
      ),
      startedTasks: Number(data.startedTasks !== undefined ? data.startedTasks : 1),
      completedTasks: Number(data.completedTasks !== undefined ? data.completedTasks : 1),
      responseTimes: Array.isArray(data.responseTimes) ? data.responseTimes : [],
      sessionDuration: Number(data.sessionDuration || 0),
      stage: Number(data.stage || 1),
      score: Number(data.score || 0),
      userId,
    };

    const res = await api.post('/api/analytics/session', payload);

    // Notify open tabs / dashboard components to re-fetch live metrics instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('reminiplay_session_logged', { detail: { payload, response: res.data } })
      );
    }

    return res.data;
  } catch (err) {
    console.warn('Analytics session logging warning (ignored for gameplay stability):', err?.message);
    return null;
  }
}

export default logGameSession;
