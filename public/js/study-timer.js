/* ==========================================================================
   BTechPath AI OS - study-timer.js
   LEGACY SHIM - DO NOT DELETE (referenced by study.html, planner.html, etc.)

   The full StudyTracker implementation now lives in js/study-tracker.js which
   exposes ALL session APIs (startSession, pauseSession, resumeSession,
   endSession, getActiveSession, renderTimerUI, restoreActiveSession, etc.)
   as well as the continuous tracker (getCachedToday, fetchTodayMetrics, etc.)

   This file is a compatibility shim only.
   It defers to window.StudyTracker (set by study-tracker.js).
   It does NOT define a competing StudyTracker object.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // study-tracker.js has already initialized window.StudyTracker.
  // Nothing to do here — all methods are already on the canonical object.
  if (typeof StudyTracker !== 'undefined' && typeof StudyTracker.restoreActiveSession === 'function') {
    StudyTracker.restoreActiveSession();
  }
});
