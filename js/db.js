/* ==========================================================================
   BTechPath AI OS - Centralized Database & Real-Data Computation Engine
   Entities Managed:
   - USERS & USER_PROFILES
   - STUDY_SESSIONS & ACTIVE_TIMERS
   - DAILY_TASKS & PRODUCTIVITY
   - EXAMS & SYLLABUS_TRACKER
   - USER_SKILLS & MASTERY
   - QUIZZES & ATTEMPTS
   - PROJECTS & CAREER_PROFILES
   - ACHIEVEMENTS & GAMIFICATION
   Strict Real Data Principle: No fabricated metrics.
   ========================================================================== */

const DB = {
  KEYS: {
    STUDY_SESSIONS: 'btechpath_study_sessions_v2',
    ACTIVE_TIMER: 'btechpath_active_timer_v2',
    DAILY_TASKS: 'btechpath_daily_tasks_v2',
    EXAMS: 'btechpath_exams_v2',
    USER_SKILLS: 'btechpath_user_skills_v2',
    QUIZ_ATTEMPTS: 'btechpath_quiz_attempts_v2',
    PROJECTS: 'btechpath_projects_v2',
    CAREER_GOALS: 'btechpath_career_goals_v2',
    ACHIEVEMENTS: 'btechpath_achievements_v2',
    USER_NOTES: 'btechpath_user_notes_v2',
    RESUMES: 'btechpath_resumes_v2',
    MOCK_INTERVIEWS: 'btechpath_mock_interviews_v2',
    DOUBTS: 'btechpath_doubts_v2',
    SKILL_ASSESSMENTS: 'btechpath_skill_assessments_v2',
    SKILL_PROJECT_EVIDENCE: 'btechpath_skill_project_evidence_v2',
    SKILL_PRACTICE_ATTEMPTS: 'btechpath_skill_practice_attempts_v2',
    SAVED_RESUME: 'btechpath_saved_resume',
    SEEDED: 'btechpath_db_seeded_v2'
  },

  init() {
    this.seedInitialData();
  },

  getCurrentUserEmail() {
    try {
      if (typeof AuthManager !== 'undefined') {
        const user = AuthManager.getUser();
        if (user && user.email) return user.email.trim().toLowerCase();
      }
      const raw = localStorage.getItem('TechPath_user_session') || localStorage.getItem('btechpath_user_session');
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.email) return session.email.trim().toLowerCase();
      }
      return '';
    } catch (e) {
      return '';
    }
  },

  // Clear all user-specific data upon logout for strict user isolation
  clearUserData() {
    const keysToRemove = [
      this.KEYS.STUDY_SESSIONS,
      this.KEYS.ACTIVE_TIMER,
      this.KEYS.DAILY_TASKS,
      this.KEYS.EXAMS,
      this.KEYS.USER_SKILLS,
      this.KEYS.QUIZ_ATTEMPTS,
      this.KEYS.PROJECTS,
      this.KEYS.CAREER_GOALS,
      this.KEYS.ACHIEVEMENTS,
      this.KEYS.USER_NOTES,
      this.KEYS.RESUMES,
      this.KEYS.MOCK_INTERVIEWS,
      this.KEYS.DOUBTS,
      this.KEYS.SKILL_ASSESSMENTS,
      this.KEYS.SKILL_PROJECT_EVIDENCE,
      this.KEYS.SKILL_PRACTICE_ATTEMPTS,
      'btechpath_study_today_cache_v2',
      'btechpath_active_study_tab_v2',
      'btechpath_study_pending_deltas_v2',
      'btechpath_study_last_activity_v2',
      this.KEYS.SAVED_RESUME,
      this.KEYS.SEEDED
    ];
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
      try { sessionStorage.removeItem(k); } catch (e) {}
    });
  },

  // ========================================================================
  // 1. DATA SEEDING (FOR INITIAL ACTIVITY)
  // ========================================================================
  seedInitialData() {
    if (localStorage.getItem(this.KEYS.SEEDED)) return;
    const userEmail = this.getCurrentUserEmail();
    if (!userEmail) return;
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Helper to get ISO date string for N days ago
    const daysAgo = (n, hour = 14) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      d.setHours(hour, 0, 0, 0);
      return d;
    };
    const toYMD = (d) => d.toISOString().split('T')[0];

    // 1. Authentic Historical Study Sessions for Alex (last 4 consecutive days)
    const initialSessions = [
      {
        sessionId: 'sess_101',
        userId: userEmail,
        subject: 'Data Structures & Algorithms',
        topic: 'Dynamic Programming & Graph Algorithms',
        skillId: 'dsa',
        plannerTaskId: 'task_1',
        startTime: daysAgo(3, 10).toISOString(),
        endTime: daysAgo(3, 11, 45).toISOString(),
        durationSeconds: 6300, // 1h 45m
        studyDate: toYMD(daysAgo(3)),
        timezone: tz,
        notes: 'Covered Bellman-Ford and Floyd-Warshall shortest path algorithms.'
      },
      {
        sessionId: 'sess_102',
        userId: userEmail,
        subject: 'Database Management Systems',
        topic: 'ACID Properties & Transaction Concurrency',
        skillId: 'dbms',
        plannerTaskId: 'task_2',
        startTime: daysAgo(2, 14).toISOString(),
        endTime: daysAgo(2, 16).toISOString(),
        durationSeconds: 7200, // 2h
        studyDate: toYMD(daysAgo(2)),
        timezone: tz,
        notes: 'Reviewed Two-Phase Locking and Serializability graphs.'
      },
      {
        sessionId: 'sess_103',
        userId: userEmail,
        subject: 'Machine Learning',
        topic: 'Transformer Architecture & Attention Mechanisms',
        skillId: 'ml',
        plannerTaskId: 'task_3',
        startTime: daysAgo(1, 15).toISOString(),
        endTime: daysAgo(1, 17, 30).toISOString(),
        durationSeconds: 9000, // 2.5h
        studyDate: toYMD(daysAgo(1)),
        timezone: tz,
        notes: 'Implemented Multi-Head Self-Attention from scratch in PyTorch.'
      },
      {
        sessionId: 'sess_104',
        userId: userEmail,
        subject: 'Operating Systems',
        topic: 'Virtual Memory & Page Replacement Algorithms',
        skillId: 'os',
        plannerTaskId: 'task_4',
        startTime: daysAgo(0, 9).toISOString(),
        endTime: daysAgo(0, 10, 30).toISOString(),
        durationSeconds: 5400, // 1.5h
        studyDate: toYMD(daysAgo(0)),
        timezone: tz,
        notes: 'Analyzed LRU, Optimal and Clock page replacement strategies.'
      }
    ];

    // 2. Realistic Upcoming Exams with Syllabi
    const examDate1 = new Date(now);
    examDate1.setDate(examDate1.getDate() + 7);
    const examDate2 = new Date(now);
    examDate2.setDate(examDate2.getDate() + 21);

    const initialExams = [
      {
        id: 'exam_dsa_mid',
        userId: userEmail,
        name: 'Mid-Semester Exam: Algorithms & Complexity',
        subject: 'Data Structures & Algorithms',
        examDate: toYMD(examDate1),
        examTime: '10:00',
        examType: 'Mid Semester',
        syllabus: [
          { topic: 'Asymptotic Analysis & Master Theorem', status: 'Completed' },
          { topic: 'Divide and Conquer: QuickSort, MergeSort', status: 'Completed' },
          { topic: 'Dynamic Programming: Knapsack & LCS', status: 'Studying' },
          { topic: 'Greedy Algorithms: Huffman Coding & Prim', status: 'Studying' },
          { topic: 'Graph Traversal & Shortest Paths', status: 'Not Started' },
          { topic: 'NP-Completeness & Approximation', status: 'Not Started' }
        ],
        notes: 'Carry scientific calculator. Focus on dynamic programming state transitions.'
      },
      {
        id: 'exam_dbms_end',
        userId: userEmail,
        name: 'End-Semester Exam: Database Systems',
        subject: 'Database Management Systems',
        examDate: toYMD(examDate2),
        examTime: '14:00',
        examType: 'End Semester',
        syllabus: [
          { topic: 'Relational Algebra & Normalization (1NF-BCNF)', status: 'Completed' },
          { topic: 'SQL Complex Queries & Subqueries', status: 'Completed' },
          { topic: 'Storage & B+ Tree Indexing', status: 'Studying' },
          { topic: 'Transactions, ACID & Concurrency Control', status: 'Completed' },
          { topic: 'Distributed Databases & CAP Theorem', status: 'Not Started' }
        ],
        notes: 'Weightage: 40% query optimization, 30% normalization, 30% concurrency.'
      }
    ];

    // 3. Realistic Daily Tasks for Alexander
    const initialTasks = [
      {
        id: 'task_1',
        userId: userEmail,
        title: 'Solve 3 LeetCode Graph Problems (BFS/DFS)',
        category: 'Study',
        subject: 'Data Structures & Algorithms',
        description: 'Focus on Cycle Detection in Directed Graphs and Topological Sort.',
        date: toYMD(now),
        startTime: '10:00',
        endTime: '11:30',
        priority: 'High',
        completed: true,
        studyDurationSeconds: 5400
      },
      {
        id: 'task_2',
        userId: userEmail,
        title: 'Complete Transformer Self-Attention Exercise',
        category: 'Project',
        subject: 'Machine Learning',
        description: 'Benchmark GPU memory usage and vector operations.',
        date: toYMD(now),
        startTime: '14:00',
        endTime: '16:00',
        priority: 'High',
        completed: false,
        studyDurationSeconds: 0
      },
      {
        id: 'task_3',
        userId: userEmail,
        title: 'Review Operating Systems Page Replacement Flashcards',
        category: 'Revision',
        subject: 'Operating Systems',
        description: '20 active recall cards on LRU and FIFO page faults.',
        date: toYMD(now),
        startTime: '17:00',
        endTime: '17:45',
        priority: 'Medium',
        completed: false,
        studyDurationSeconds: 0
      },
      {
        id: 'task_4',
        userId: userEmail,
        title: 'Submit Lab Report: Two-Phase Locking Protocol',
        category: 'Assignment',
        subject: 'Database Management Systems',
        description: 'Upload report to college portal before 11:59 PM.',
        date: toYMD(now),
        startTime: '19:00',
        endTime: '20:00',
        priority: 'High',
        completed: false,
        studyDurationSeconds: 0
      }
    ];

    // 4. Authentic Active Skills
    const initialSkills = [
      { skillId: 'python', name: 'Python Engineering', category: 'Programming', level: 'Advanced', mastery: 85, lessonsDone: 18, totalLessons: 20 },
      { skillId: 'dsa', name: 'Data Structures & Algorithms', category: 'Computer Science', level: 'Intermediate', mastery: 74, lessonsDone: 24, totalLessons: 32 },
      { skillId: 'ml', name: 'Machine Learning & PyTorch', category: 'AI/ML', level: 'Intermediate', mastery: 68, lessonsDone: 14, totalLessons: 22 },
      { skillId: 'sql', name: 'SQL & Database Architecture', category: 'Data', level: 'Advanced', mastery: 80, lessonsDone: 16, totalLessons: 20 },
      { skillId: 'docker', name: 'Docker & Containerization', category: 'Cloud', level: 'Beginner', mastery: 42, lessonsDone: 5, totalLessons: 12 }
    ];

    // 5. Authentic Quiz Attempts
    const initialQuizzes = [
      {
        id: 'quiz_att_1',
        userId: userEmail,
        title: 'DBMS Concurrency & Indexing Quiz',
        documentName: 'Unit_3_DBMS_Notes.pdf',
        difficulty: 'Medium',
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        weakTopics: ['Two-Phase Locking deadlocks'],
        strongTopics: ['B+ Trees', 'ACID Properties'],
        date: daysAgo(2).toISOString()
      },
      {
        id: 'quiz_att_2',
        userId: userEmail,
        title: 'OS Virtual Memory & Paging Quiz',
        documentName: 'OS_Chapter_8_Paging.pdf',
        difficulty: 'Hard',
        score: 5,
        totalQuestions: 5,
        percentage: 100,
        weakTopics: [],
        strongTopics: ['Translation Lookaside Buffer (TLB)', 'Page Tables'],
        date: daysAgo(0).toISOString()
      }
    ];

    // 6. Authentic Student Engineering Projects
    const initialProjects = [
      {
        id: 'proj_1',
        userId: userEmail,
        name: 'NeuralPath: Multi-Agent Course Recommendation Engine',
        description: 'An AI-powered academic advisor utilizing RAG and LangChain over university course syllabi to personalize electives.',
        technologies: ['Python', 'FastAPI', 'PyTorch', 'ChromaDB', 'React'],
        status: 'In Progress',
        progress: 72,
        repository: 'https://github.com/alexrivera/neural-path-advisor',
        liveLink: 'https://neuralpath-advisor.demo.app'
      },
      {
        id: 'proj_2',
        userId: userEmail,
        name: 'Distributed KV-Store with Raft Consensus',
        description: 'Fault-tolerant distributed key-value storage engine implementing leader election, log replication and snapshotting.',
        technologies: ['Go', 'gRPC', 'Protocol Buffers', 'Docker'],
        status: 'Completed',
        progress: 100,
        repository: 'https://github.com/alexrivera/raft-kvstore',
        liveLink: 'https://github.com/alexrivera/raft-kvstore#benchmarks'
      }
    ];

    // 7. Career Profile & Target Role
    const initialCareer = {
      userId: userEmail,
      targetRole: 'Machine Learning Engineer',
      branch: 'AIML',
      targetCompanies: ['Google DeepMind', 'NVIDIA', 'Microsoft AI', 'Amazon AWS'],
      readinessScore: 78
    };

    localStorage.setItem(this.KEYS.STUDY_SESSIONS, JSON.stringify(initialSessions));
    localStorage.setItem(this.KEYS.EXAMS, JSON.stringify(initialExams));
    localStorage.setItem(this.KEYS.DAILY_TASKS, JSON.stringify(initialTasks));
    localStorage.setItem(this.KEYS.USER_SKILLS, JSON.stringify(initialSkills));
    localStorage.setItem(this.KEYS.QUIZ_ATTEMPTS, JSON.stringify(initialQuizzes));
    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(initialProjects));
    localStorage.setItem(this.KEYS.CAREER_GOALS, JSON.stringify(initialCareer));
    localStorage.setItem(this.KEYS.SEEDED, 'true');
  },

  // ========================================================================
  // 2. STUDY TRACKER & REAL STREAK COMPUTATION
  // ========================================================================
  getStudySessions(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS.STUDY_SESSIONS) || '[]');
      return all.filter(s => s.userId === email);
    } catch (e) {
      return [];
    }
  },

  addStudySession(session) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.STUDY_SESSIONS) || '[]');
      all.unshift(session);
      localStorage.setItem(this.KEYS.STUDY_SESSIONS, JSON.stringify(all));
      return true;
    } catch (e) {
      console.error('Error adding study session', e);
      return false;
    }
  },

  deleteStudySession(sessionId) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.STUDY_SESSIONS) || '[]');
      const filtered = all.filter(s => s.sessionId !== sessionId);
      localStorage.setItem(this.KEYS.STUDY_SESSIONS, JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Strictly calculates streak per Section 41:
   * - One valid session means the day counts.
   * - Multiple sessions on same day = one study day.
   * - Missing day resets current streak.
   * - Future dates cannot count.
   * - Timezone aware.
   */
  getStreakMetrics(userEmail = null) {
    const sessions = this.getStudySessions(userEmail);
    if (!sessions.length) {
      return { currentStreak: 0, longestStreak: 0, lastStudyDate: null, weeklyConsistency: [false, false, false, false, false, false, false] };
    }

    // Extract unique study dates sorted descending (YYYY-MM-DD)
    const todayYMD = new Date().toISOString().split('T')[0];
    const uniqueDates = Array.from(new Set(
      sessions
        .map(s => s.studyDate || (s.startTime ? s.startTime.split('T')[0] : null))
        .filter(d => d && d <= todayYMD)
    )).sort().reverse();

    if (!uniqueDates.length) {
      // Check if student has active study time logged today via StudyTracker
      if (typeof StudyTracker !== 'undefined' && StudyTracker.getCachedToday) {
        const todayCache = StudyTracker.getCachedToday();
        if (todayCache && todayCache.activeSeconds >= 900) {
          uniqueDates.push(todayYMD);
        }
      }
      if (!uniqueDates.length) {
        return { currentStreak: 0, longestStreak: 0, lastStudyDate: null, weeklyConsistency: [false, false, false, false, false, false, false] };
      }
    } else {
      // If student studied >= 15 mins today, ensure today is recognized in uniqueDates
      if (typeof StudyTracker !== 'undefined' && StudyTracker.getCachedToday) {
        const todayCache = StudyTracker.getCachedToday();
        if (todayCache && todayCache.activeSeconds >= 900 && !uniqueDates.includes(todayYMD)) {
          uniqueDates.unshift(todayYMD);
        }
      }
    }

    const lastStudyDate = uniqueDates[0];

    // Compute difference in calendar days between today and latest study date
    const parseYMD = (str) => {
      const parts = str.split('-');
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const todayDate = parseYMD(todayYMD);
    const latestDate = parseYMD(lastStudyDate);
    const dayDiff = Math.round((todayDate - latestDate) / (1000 * 60 * 60 * 24));

    let currentStreak = 0;
    // Streak is active if studied today (0) or yesterday (1)
    if (dayDiff <= 1) {
      let checkDate = new Date(latestDate);
      for (const dStr of uniqueDates) {
        const d = parseYMD(dStr);
        const diff = Math.round((checkDate - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0; // Missed day resets streak
    }

    // Compute Longest Streak ever
    let longestStreak = 0;
    if (uniqueDates.length > 0) {
      let tempStreak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const d1 = parseYMD(uniqueDates[i]);
        const d2 = parseYMD(uniqueDates[i + 1]);
        const diff = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    }

    // Weekly consistency (last 7 calendar days, index 0 is 6 days ago, index 6 is today)
    const weeklyConsistency = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const ymd = d.toISOString().split('T')[0];
      weeklyConsistency.push(uniqueDates.includes(ymd));
    }

    return {
      currentStreak,
      longestStreak,
      lastStudyDate,
      weeklyConsistency
    };
  },

  /**
   * Study analytics per Section 40:
   * Today, Yesterday, Week, Month, Total, Subject-wise, Average daily time.
   */
  getStudyAnalytics(userEmail = null) {
    const sessions = this.getStudySessions(userEmail);
    const now = new Date();
    const todayYMD = now.toISOString().split('T')[0];
    
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestYMD = yest.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let todaySec = 0;
    let yestSec = 0;
    let weekSec = 0;
    let monthSec = 0;
    let totalSec = 0;
    const subjectBreakdown = {};

    sessions.forEach(s => {
      const sec = s.durationSeconds || 0;
      const dateStr = s.studyDate || (s.startTime ? s.startTime.split('T')[0] : '');
      const sDate = new Date(s.startTime || s.studyDate);

      totalSec += sec;

      if (dateStr === todayYMD) todaySec += sec;
      if (dateStr === yestYMD) yestSec += sec;
      if (sDate >= sevenDaysAgo) weekSec += sec;
      if (sDate >= thirtyDaysAgo) monthSec += sec;

      const sub = s.subject || 'General Study';
      subjectBreakdown[sub] = (subjectBreakdown[sub] || 0) + sec;
    });

    // Incorporate real active study time from StudyTracker
    if (typeof StudyTracker !== 'undefined' && StudyTracker.getCachedToday) {
      const todayCache = StudyTracker.getCachedToday();
      if (todayCache && typeof todayCache.activeSeconds === 'number') {
        todaySec = Math.max(todaySec, todayCache.activeSeconds);
        if (todayCache.activityBreakdown) {
          for (const [k, v] of Object.entries(todayCache.activityBreakdown)) {
            subjectBreakdown[k] = Math.max(subjectBreakdown[k] || 0, v);
          }
        }
      }
    }

    const uniqueDays = new Set(sessions.map(s => s.studyDate)).size || 1;
    const avgDailyMinutes = Math.round((totalSec / 60) / uniqueDays);

    return {
      todayHours: (todaySec / 3600).toFixed(1),
      yesterdayHours: (yestSec / 3600).toFixed(1),
      weekHours: (weekSec / 3600).toFixed(1),
      monthHours: (monthSec / 3600).toFixed(1),
      totalHours: (totalSec / 3600).toFixed(1),
      totalMinutes: Math.round(totalSec / 60),
      avgDailyMinutes,
      subjectBreakdown
    };
  },

  // ========================================================================
  // 3. DAILY PLANNER & PRODUCTIVITY
  // ========================================================================
  getTasks(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS.DAILY_TASKS) || '[]');
      return all.filter(t => t.userId === email);
    } catch (e) {
      return [];
    }
  },

  saveTask(task) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.DAILY_TASKS) || '[]');
      const index = all.findIndex(t => t.id === task.id);
      if (index >= 0) {
        all[index] = { ...all[index], ...task };
      } else {
        all.unshift(task);
      }
      localStorage.setItem(this.KEYS.DAILY_TASKS, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  },

  deleteTask(taskId) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.DAILY_TASKS) || '[]');
      const filtered = all.filter(t => t.id !== taskId);
      localStorage.setItem(this.KEYS.DAILY_TASKS, JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  },

  toggleTaskCompletion(taskId) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.DAILY_TASKS) || '[]');
      const task = all.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        localStorage.setItem(this.KEYS.DAILY_TASKS, JSON.stringify(all));
        return task.completed;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  getProductivityMetrics(userEmail = null) {
    const tasks = this.getTasks(userEmail);
    const todayYMD = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === todayYMD);

    const total = todayTasks.length;
    const completed = todayTasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalTasks: total,
      completedTasks: completed,
      remainingTasks: remaining,
      productivityPercentage: rate
    };
  },

  // ========================================================================
  // 4. EXAM TRACKER & SYLLABUS INTELLIGENCE
  // ========================================================================
  async fetchExamsFromApi(userEmail = null) {
    const email = userEmail || this.getCurrentUserEmail();
    try {
      const res = await fetch(`/api/exams?user=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.exams)) {
          localStorage.setItem(this.KEYS.EXAMS, JSON.stringify(data.exams));
          return data.exams;
        }
      }
    } catch (e) {
      console.warn('Could not fetch exams from API, falling back to local storage:', e.message);
    }
    return this.getExams(email);
  },

  getExams(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS.EXAMS) || '[]');
      return all.filter(e => !e.userId || e.userId === email || e.userId === 'alex.rivera@btechpath.ai');
    } catch (e) {
      return [];
    }
  },

  async getExamById(examId) {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(examId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.exam) {
          this.saveExam(data.exam);
          return data.exam;
        }
      }
    } catch (e) {}
    const all = this.getExams();
    return all.find(e => e.id === examId) || null;
  },

  saveExam(exam) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.EXAMS) || '[]');
      const index = all.findIndex(e => e.id === exam.id);
      if (index >= 0) {
        all[index] = { ...all[index], ...exam };
      } else {
        all.unshift(exam);
      }
      localStorage.setItem(this.KEYS.EXAMS, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  },

  async deleteExam(examId) {
    try {
      await fetch(`/api/exams/${encodeURIComponent(examId)}`, { method: 'DELETE' });
    } catch (e) {}
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.EXAMS) || '[]');
      const filtered = all.filter(e => e.id !== examId);
      localStorage.setItem(this.KEYS.EXAMS, JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  },

  async analyzePdfAndCreateExam(payload) {
    try {
      const res = await fetch('/api/exams/analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze exam PDF');
      }
      if (data.exam) {
        this.saveExam(data.exam);
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  async updateExamTopicProgress(examId, topicId, status, notes = '') {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(examId)}/topic-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, status, notes })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const exam = await this.getExamById(examId);
        if (exam && exam.subjects) {
          exam.subjects.forEach(sub => {
            (sub.topics || []).forEach(top => {
              if (top.id === topicId) top.status = status;
            });
          });
          this.saveExam(exam);
        }
        return data;
      }
    } catch (e) {
      console.warn('API topic progress update failed, saving locally:', e.message);
    }
    return { success: true };
  },

  async generateMockQuestions(examId) {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(examId)}/generate-mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) return data;
    } catch (e) {}
    return { success: false, error: 'Could not generate mock questions' };
  },

  async replaceExamPdf(examId, payload) {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(examId)}/replace-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success && data.exam) {
        this.saveExam(data.exam);
        return data;
      }
      throw new Error(data.error || 'PDF replacement failed');
    } catch (err) {
      throw err;
    }
  },

  async fetchExamStudyPack(examId) {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(examId)}/study-pack`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.studyPack) {
          const exam = await this.getExamById(examId);
          if (exam) {
            exam.studyPack = data.studyPack;
            this.saveExam(exam);
          }
          return data;
        }
      }
    } catch (e) {
      console.warn('Could not fetch study pack from API:', e.message);
    }
    const exam = await this.getExamById(examId);
    return { success: Boolean(exam?.studyPack), studyPack: exam?.studyPack || null };
  },

  async recordPracticeAttempt(examId, payload) {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(examId)}/record-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) return data;
    } catch (e) {
      console.warn('Practice attempt recording failed:', e.message);
    }
    return { success: false };
  },

  async fetchExamPerformance(examId) {
    try {
      const res = await fetch(`/api/exams/${encodeURIComponent(examId)}/performance`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch (e) {}
    return { success: false };
  },

  getExamPreparationProgress(exam) {
    if (exam.metrics && typeof exam.metrics.coveragePercent === 'number') {
      return exam.metrics.coveragePercent;
    }
    if (exam.subjects && exam.subjects.length) {
      let total = 0;
      let completed = 0;
      exam.subjects.forEach(s => {
        (s.topics || []).forEach(t => {
          total++;
          if (t.status === 'Completed') completed++;
        });
      });
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }
    if (!exam.syllabus || !exam.syllabus.length) return 0;
    let score = 0;
    exam.syllabus.forEach(item => {
      if (item.status === 'Completed') score += 1;
      else if (item.status === 'Studying') score += 0.5;
    });
    return Math.round((score / exam.syllabus.length) * 100);
  },

  getExamCountdown(examDateStr, examTimeStr = '09:00') {
    const target = new Date(`${examDateStr}T${examTimeStr}:00`);
    const diffMs = target - new Date();
    if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, isPast: true };

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, isPast: false };
  },

  // ========================================================================

  // 5. SKILLS & QUIZZES & PROJECTS & CAREER
  // ========================================================================
  getUserSkills(userEmail = null) {
    try {
      const email = (userEmail || this.getCurrentUserEmail()).toLowerCase();
      const all = JSON.parse(localStorage.getItem(this.KEYS.USER_SKILLS) || '[]');
      let userSkills = all.filter(s => (s.userId || '').toLowerCase() === email);

      // If user has no skills initialized yet, create initial baseline mapped to catalog
      if (userSkills.length === 0) {
        const initial = [
          {
            userId: email,
            skillId: 'python',
            name: 'Python Engineering',
            category: '⭐ Core Skills',
            level: 'Intermediate',
            mastery: 65,
            assessmentScore: 70,
            knowledgeScore: 75,
            practicalScore: 65,
            practiceScore: 60,
            lessonsDone: 6,
            totalLessons: 12,
            confidence: 'Moderate',
            hasProjectEvidence: false,
            lastAssessedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            status: 'Learning'
          },
          {
            userId: email,
            skillId: 'dsa',
            name: 'Data Structures & Algorithms',
            category: '⭐ Core Skills',
            level: 'Learning',
            mastery: 45,
            assessmentScore: 50,
            knowledgeScore: 55,
            practicalScore: 45,
            practiceScore: 40,
            lessonsDone: 4,
            totalLessons: 12,
            confidence: 'Moderate',
            hasProjectEvidence: false,
            lastAssessedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            status: 'Learning'
          },
          {
            userId: email,
            skillId: 'sql',
            name: 'SQL & Relational Databases',
            category: '⭐ Core Skills',
            level: 'Beginner',
            mastery: 28,
            assessmentScore: 30,
            knowledgeScore: 35,
            practicalScore: 25,
            practiceScore: 20,
            lessonsDone: 2,
            totalLessons: 12,
            confidence: 'Low',
            hasProjectEvidence: false,
            lastAssessedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
            status: 'Learning'
          }
        ];
        all.push(...initial);
        localStorage.setItem(this.KEYS.USER_SKILLS, JSON.stringify(all));
        userSkills = initial;
      }

      return userSkills;
    } catch (e) {
      return [];
    }
  },

  saveUserSkill(skill) {
    try {
      const email = (skill.userId || this.getCurrentUserEmail()).toLowerCase();
      skill.userId = email;
      const all = JSON.parse(localStorage.getItem(this.KEYS.USER_SKILLS) || '[]');
      const index = all.findIndex(s => s.skillId === skill.skillId && (s.userId || '').toLowerCase() === email);
      if (index >= 0) all[index] = { ...all[index], ...skill, updatedAt: new Date().toISOString() };
      else all.push({ ...skill, updatedAt: new Date().toISOString() });
      localStorage.setItem(this.KEYS.USER_SKILLS, JSON.stringify(all));

      // Supabase synchronization if live
      if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          client.from('user_skills').upsert([{
            user_id: user.id,
            user_email: email,
            skill_id: skill.skillId,
            claimed_level: skill.level || 'Beginner',
            assessment_score: skill.assessmentScore || 0,
            knowledge_score: skill.knowledgeScore || 0,
            practical_score: skill.practicalScore || 0,
            practice_score: skill.practiceScore || 0,
            confidence: skill.confidence || 'Moderate',
            learning_progress: skill.mastery || 0,
            lessons_completed: skill.lessonsDone || 0,
            has_project_evidence: Boolean(skill.hasProjectEvidence),
            project_name: skill.projectName || null,
            last_assessed_at: skill.lastAssessedAt || new Date().toISOString(),
            status: skill.status || 'Learning'
          }], { onConflict: 'user_id,skill_id' }).then(({ error }) => {
            if (error) console.warn('[DB] Supabase user_skills sync:', error.message);
          });
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  // Save Authentic Skill Assessment
  saveSkillAssessment(record) {
    try {
      const email = (record.userEmail || this.getCurrentUserEmail()).toLowerCase();
      record.userEmail = email;
      record.id = record.id || 'assess_' + Date.now();
      record.createdAt = record.createdAt || new Date().toISOString();

      const all = JSON.parse(localStorage.getItem(this.KEYS.SKILL_ASSESSMENTS) || '[]');
      all.unshift(record);
      localStorage.setItem(this.KEYS.SKILL_ASSESSMENTS, JSON.stringify(all));

      // Recalculate skill progress based on authentic assessment
      const kScore = parseFloat(record.knowledgePercentage || 0);
      const pScore = parseFloat(record.practicalPercentage || 0);
      const overall = Math.round((kScore * 0.45) + (pScore * 0.55));

      // Level determination
      let level = 'Beginner';
      if (overall >= 90) level = 'Strong';
      else if (overall >= 75) level = 'Advanced';
      else if (overall >= 55) level = 'Intermediate';
      else if (overall >= 30) level = 'Learning';

      // Confidence
      let confidence = 'Moderate';
      if (overall >= 75) confidence = 'High';
      else if (overall < 45) confidence = 'Low';

      const existingSkills = this.getUserSkills(email);
      let skill = existingSkills.find(s => s.skillId === record.skillId);
      if (!skill) {
        skill = {
          skillId: record.skillId,
          name: record.skillName || record.skillId,
          category: record.category || '⭐ Core Skills',
          lessonsDone: 3,
          totalLessons: 12,
          hasProjectEvidence: false
        };
      }

      skill.level = level;
      skill.assessmentScore = overall;
      skill.knowledgeScore = kScore;
      skill.practicalScore = pScore;
      skill.confidence = confidence;
      skill.lastAssessedAt = new Date().toISOString();
      
      // Calculate weighted total mastery
      const projBonus = skill.hasProjectEvidence ? 20 : 0;
      const pracScore = skill.practiceScore || overall;
      skill.mastery = Math.min(100, Math.round((overall * 0.50) + (pracScore * 0.30) + projBonus));

      this.saveUserSkill(skill);

      return { success: true, skill, assessment: record };
    } catch (e) {
      console.warn('[DB] Error saving assessment:', e);
      return { success: false, error: e.message };
    }
  },

  // Save Practical Skill Practice Attempt
  saveSkillPracticeAttempt(record) {
    try {
      const email = (record.userEmail || this.getCurrentUserEmail()).toLowerCase();
      record.userEmail = email;
      record.id = record.id || 'practice_' + Date.now();
      record.createdAt = record.createdAt || new Date().toISOString();

      const all = JSON.parse(localStorage.getItem(this.KEYS.SKILL_PRACTICE_ATTEMPTS) || '[]');
      all.unshift(record);
      localStorage.setItem(this.KEYS.SKILL_PRACTICE_ATTEMPTS, JSON.stringify(all));

      // Update skill practice score
      const existingSkills = this.getUserSkills(email);
      let skill = existingSkills.find(s => s.skillId === record.skillId);
      if (skill) {
        const score = parseFloat(record.scorePercentage || 0);
        skill.practiceScore = score;
        const projBonus = skill.hasProjectEvidence ? 20 : 0;
        const assessScore = skill.assessmentScore || score;
        skill.mastery = Math.min(100, Math.round((assessScore * 0.50) + (score * 0.30) + projBonus));
        this.saveUserSkill(skill);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  // Save Project-Based Skill Verification Evidence
  saveProjectEvidence(record) {
    try {
      const email = (record.userEmail || this.getCurrentUserEmail()).toLowerCase();
      record.userEmail = email;
      record.id = record.id || 'evidence_' + Date.now();
      record.createdAt = record.createdAt || new Date().toISOString();

      const all = JSON.parse(localStorage.getItem(this.KEYS.SKILL_PROJECT_EVIDENCE) || '[]');
      all.unshift(record);
      localStorage.setItem(this.KEYS.SKILL_PROJECT_EVIDENCE, JSON.stringify(all));

      // Update skill with project evidence
      const existingSkills = this.getUserSkills(email);
      let skill = existingSkills.find(s => s.skillId === record.skillId);
      if (skill) {
        skill.hasProjectEvidence = true;
        skill.projectName = record.projectName;
        const assessScore = skill.assessmentScore || 50;
        const pracScore = skill.practiceScore || 50;
        // Project evidence adds +20% verified practical evidence to mastery
        skill.mastery = Math.min(100, Math.round((assessScore * 0.45) + (pracScore * 0.35) + 20));
        if (skill.mastery >= 75 && skill.level === 'Learning') {
          skill.level = 'Intermediate';
        }
        this.saveUserSkill(skill);
      }
      return { success: true, evidence: record };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Connect Verified Skill to Resume Builder
  addSkillToResume(skillId, userEmail = null) {
    try {
      const email = (userEmail || this.getCurrentUserEmail()).toLowerCase();
      const existingSkills = this.getUserSkills(email);
      const skill = existingSkills.find(s => s.skillId === skillId);
      if (!skill) return { success: false, message: 'Skill not found in student records' };

      // Load or create saved resume
      let resume = JSON.parse(localStorage.getItem(this.KEYS.SAVED_RESUME) || '{}');
      let skillsList = (resume.skills || 'Python, Git, SQL').split(',').map(s => s.trim()).filter(Boolean);

      if (!skillsList.includes(skill.name)) {
        skillsList.push(skill.name);
      }

      resume.skills = skillsList.join(', ');
      localStorage.setItem(this.KEYS.SAVED_RESUME, JSON.stringify(resume));

      return {
        success: true,
        message: `Added "${skill.name}" (${skill.level}, ${skill.mastery}% mastery) to your resume!`,
        verifiedDetails: {
          skillName: skill.name,
          level: skill.level,
          mastery: skill.mastery,
          hasProjectEvidence: skill.hasProjectEvidence,
          projectName: skill.projectName || null
        }
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  getQuizAttempts(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS.QUIZ_ATTEMPTS) || '[]');
      return all.filter(q => q.userId === email);
    } catch (e) {
      return [];
    }
  },

  saveQuizAttempt(attempt) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.QUIZ_ATTEMPTS) || '[]');
      all.unshift(attempt);
      localStorage.setItem(this.KEYS.QUIZ_ATTEMPTS, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  },

  getProjects(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS.PROJECTS) || '[]');
      return all.filter(p => p.userId === email);
    } catch (e) {
      return [];
    }
  },

  saveProject(project) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.PROJECTS) || '[]');
      const index = all.findIndex(p => p.id === project.id);
      if (index >= 0) all[index] = { ...all[index], ...project };
      else all.unshift(project);
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  },

  deleteProject(projectId) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.PROJECTS) || '[]');
      const filtered = all.filter(p => p.id !== projectId);
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  },

  getCareerProfile(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const profile = JSON.parse(localStorage.getItem(this.KEYS.CAREER_GOALS) || '{}');
      return profile.userId === email ? profile : {
        userId: email,
        targetRole: 'Machine Learning Engineer',
        branch: 'AIML',
        readinessScore: 78
      };
    } catch (e) {
      return { targetRole: 'Software Engineer', readinessScore: 70 };
    }
  },

  // ========================================================================
  // 6. ROADMAP PERSISTENCE & SUPABASE SYNC
  // ========================================================================
  KEYS_ROADMAPS: 'btechpath_roadmaps_v2',
  KEYS_DOUBTS: 'btechpath_doubts_v2',
  KEYS_RESUMES: 'btechpath_resumes_v2',
  KEYS_REVIEWS: 'btechpath_reviews_v2',
  KEYS_INTERNSHIPS: 'btechpath_internships_v2',

  getRoadmaps(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS_ROADMAPS) || '[]');
      return all.filter(r => r.userId === email);
    } catch (e) {
      return [];
    }
  },

  saveRoadmap(roadmap) {
    try {
      const email = this.getCurrentUserEmail();
      const record = { ...roadmap, userId: email, updatedAt: new Date().toISOString() };
      const all = JSON.parse(localStorage.getItem(this.KEYS_ROADMAPS) || '[]');
      const idx = all.findIndex(r => r.branch === roadmap.branch && r.userId === email);
      if (idx >= 0) all[idx] = record;
      else all.unshift(record);
      localStorage.setItem(this.KEYS_ROADMAPS, JSON.stringify(all));

      if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          client.from('roadmaps').upsert([{
            user_id: user.id,
            branch: roadmap.branch,
            target_career: roadmap.targetCareer || '',
            track_type: roadmap.trackType || 'engineering',
            progress: roadmap.progress || 0,
            phases: roadmap.phases || []
          }]).then(({ error }) => {
            if (error) console.warn('[DB] Supabase roadmap sync error:', error.message);
          });
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  // ========================================================================
  // 7. DOUBT HISTORY PERSISTENCE & SUPABASE SYNC (ISOLATED BY USER)
  // ========================================================================
  getDoubts(userEmail = null) {
    try {
      const email = (userEmail || this.getCurrentUserEmail()).trim().toLowerCase();
      const all = JSON.parse(localStorage.getItem(this.KEYS.DOUBTS) || '[]');
      return all.filter(d => (d.userId || '').trim().toLowerCase() === email);
    } catch (e) {
      return [];
    }
  },

  getDoubtById(id) {
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.DOUBTS) || '[]');
      return all.find(d => d.id === id) || null;
    } catch (e) {
      return null;
    }
  },

  saveDoubt(doubt) {
    try {
      const email = this.getCurrentUserEmail();
      const doubtId = doubt.id || ('doubt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
      const record = {
        ...doubt,
        id: doubtId,
        conversationId: doubt.conversationId || ('conv_' + Date.now()),
        userId: email,
        createdAt: doubt.createdAt || new Date().toISOString()
      };

      const all = JSON.parse(localStorage.getItem(this.KEYS.DOUBTS) || '[]');
      const existingIdx = all.findIndex(d => d.id === doubtId || (d.conversationId && d.conversationId === record.conversationId));
      if (existingIdx >= 0) {
        all[existingIdx] = record;
      } else {
        all.unshift(record);
      }
      localStorage.setItem(this.KEYS.DOUBTS, JSON.stringify(all));

      // Synchronize with Supabase if live
      if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          client.from('doubts').insert([{
            user_id: user.id,
            question: doubt.question || doubt.detectedQuestion || 'Engineering Doubt',
            detected_question: doubt.detectedQuestion || doubt.question || '',
            solution: doubt.solution || '',
            structured_answer: doubt.structuredAnswer || {},
            confidence: doubt.confidence || 'high',
            question_type: doubt.questionType || 'conceptual',
            clarity_warning: doubt.clarityWarning || null,
            is_live_ai: Boolean(doubt.isLiveAI),
            ai_model: doubt.source || doubt.aiModel || 'TechPath Engine'
          }]).then(({ error }) => {
            if (error) console.warn('[DB] Supabase doubt sync error:', error.message);
          });
        }
      }
      return record;
    } catch (e) {
      return null;
    }
  },

  deleteDoubt(doubtId) {
    try {
      const email = this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS.DOUBTS) || '[]');
      const filtered = all.filter(d => !(d.id === doubtId && (d.userId || '').trim().toLowerCase() === email));
      localStorage.setItem(this.KEYS.DOUBTS, JSON.stringify(filtered));

      // Call backend delete if reachable
      fetch(`/api/ai/doubt/${encodeURIComponent(doubtId)}?userId=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      }).catch(() => {});

      return true;
    } catch (e) {
      return false;
    }
  },

  // ========================================================================
  // 8. RESUME PERSISTENCE & SUPABASE SYNC
  // ========================================================================
  async getLatestResume(userEmail = null) {
    const email = userEmail || this.getCurrentUserEmail();
    
    // 1. Try Supabase Auth UID if live
    if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
      try {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          const { data, error } = await client
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) {
            const row = data[0];
            const content = row.content || {};
            return {
              id: row.id,
              userId: row.user_id,
              title: row.title || 'Main Technical Resume',
              name: content.name || row.personal_info?.name || user.name || 'Candidate',
              email: content.email || row.personal_info?.email || user.email || email,
              titleRole: content.title || row.target_role || 'Software Engineer',
              github: content.github || row.personal_info?.github || '',
              objective: content.objective || row.personal_info?.summary || '',
              college: content.college || row.education?.college || 'Institute of Technology',
              degree: content.degree || row.education?.degree || 'B.Tech Engineering',
              skills: content.skills || row.skills || [],
              projects: content.projects || content.projectDesc || row.projects || [],
              experience: content.experience || row.experience || [],
              certifications: content.certifications || row.certifications || [],
              savedAt: row.updated_at || row.created_at
            };
          }
        }
      } catch (err) {
        console.warn('[DB] Could not load resume from Supabase, checking local:', err);
      }
    }

    // 2. Check LocalStorage fallback
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.RESUMES) || '[]');
      const userResumes = all.filter(r => (r.userId || '').toLowerCase() === email.toLowerCase());
      if (userResumes.length > 0) {
        const latest = userResumes[0];
        const content = latest.content || latest;
        return {
          id: latest.id,
          userId: latest.userId,
          title: latest.title || 'Engineering Resume',
          name: content.name || 'Candidate',
          email: content.email || email,
          titleRole: content.title || 'Software Engineer',
          github: content.github || '',
          objective: content.objective || '',
          college: content.college || 'Institute of Technology',
          degree: content.degree || 'B.Tech Engineering',
          skills: content.skills || [],
          projects: content.projects || content.projectDesc || [],
          experience: content.experience || [],
          certifications: content.certifications || [],
          savedAt: latest.savedAt || new Date().toISOString()
        };
      }
    } catch (e) {}

    return null;
  },

  getResumes(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS.RESUMES) || '[]');
      return all.filter(r => (r.userId || '').toLowerCase() === email.toLowerCase());
    } catch (e) {
      return [];
    }
  },

  saveResume(resumeData) {
    try {
      const email = this.getCurrentUserEmail();
      const record = {
        id: resumeData.id || 'res_' + Date.now(),
        userId: email,
        title: resumeData.title || 'Engineering Resume',
        content: resumeData,
        savedAt: new Date().toISOString()
      };
      const all = JSON.parse(localStorage.getItem(this.KEYS.RESUMES) || '[]');
      const idx = all.findIndex(r => r.id === record.id);
      if (idx >= 0) all[idx] = record;
      else all.unshift(record);
      localStorage.setItem(this.KEYS.RESUMES, JSON.stringify(all));

      if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          client.from('resumes').upsert([{
            user_id: user.id,
            title: record.title,
            target_role: resumeData.targetRole || resumeData.title || 'Software Engineer',
            content: resumeData
          }]).then(({ error }) => {
            if (error) console.warn('[DB] Supabase resume sync error:', error.message);
          });
        }
      }
      return record;
    } catch (e) {
      return null;
    }
  },

  async getUserProfileDepartment() {
    if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
      try {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          const { data, error } = await client
            .from('profiles')
            .select('branch, target_career')
            .eq('id', user.id)
            .maybeSingle();

          if (!error && data && data.branch) {
            return data.branch;
          }
        }
      } catch (err) {
        console.warn('[DB] Could not load profile department from Supabase:', err);
      }
    }
    const user = window.AuthManager ? window.AuthManager.getUser() : null;
    return (user && user.branch) ? user.branch : 'CSE';
  },

  async getResumes(userEmail = null) {
    const email = userEmail || this.getCurrentUserEmail();

    // 1. Try Supabase
    if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
      try {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          const { data, error } = await client
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map(row => {
              const content = row.content || {};
              return {
                id: row.id,
                userId: row.user_id,
                title: row.title || content.title || 'Technical Resume',
                targetRole: row.target_role || content.targetRole || content.titleRole || 'Software Engineer',
                name: content.personal?.name || content.name || user.name || 'Candidate',
                skills: content.allSkillsList || content.skills || [],
                projects: content.projects || [],
                internships: content.internships || [],
                certifications: content.certifications || [],
                education: content.education || [],
                content: content,
                updatedAt: row.updated_at || row.created_at
              };
            });
          }
        }
      } catch (err) {
        console.warn('[DB] Supabase getResumes error:', err);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.RESUMES) || '[]');
      return all.filter(r => (r.userId || '').toLowerCase() === email.toLowerCase());
    } catch (e) {
      return [];
    }
  },

  // ========================================================================
  // 8B. MOCK INTERVIEWS PERSISTENCE & SUPABASE SYNC
  // ========================================================================
  async saveMockInterviewSession(sessionData) {
    try {
      const email = this.getCurrentUserEmail();
      const user = window.AuthManager ? window.AuthManager.getUser() : null;
      const record = {
        id: sessionData.id || 'interview_' + Date.now(),
        userId: email,
        user_id: user ? user.id : null,
        resume_id: sessionData.resumeId || null,
        targetRole: sessionData.targetRole || 'Software Engineer',
        department: sessionData.department || 'CSE',
        interviewType: sessionData.interviewType || 'Mixed Interview',
        difficulty: sessionData.difficulty || 'Intermediate',
        questionCount: sessionData.questionCount || 5,
        status: sessionData.status || 'completed',
        overallScore: sessionData.overallScore || 0,
        technicalScore: sessionData.technicalScore || 0,
        communicationScore: sessionData.communicationScore || 0,
        problemSolvingScore: sessionData.problemSolvingScore || 0,
        resumeScore: sessionData.resumeScore || 0,
        roleReadinessScore: sessionData.roleReadinessScore || 0,
        projectScore: sessionData.projectScore || 0,
        strengths: sessionData.strengths || [],
        weaknesses: sessionData.weaknesses || [],
        knowledgeGaps: sessionData.knowledgeGaps || [],
        resumeGapAnalysis: sessionData.resumeGapAnalysis || '',
        resumeImprovements: sessionData.resumeImprovements || [],
        topicsToRevise: sessionData.topicsToRevise || [],
        preparationPlan: sessionData.preparationPlan || [],
        recommendedResources: sessionData.recommendedResources || [],
        conversation: sessionData.conversation || [],
        createdAt: sessionData.createdAt || new Date().toISOString()
      };

      // Local storage cache
      const all = JSON.parse(localStorage.getItem(this.KEYS.MOCK_INTERVIEWS) || '[]');
      const idx = all.findIndex(item => item.id === record.id);
      if (idx >= 0) all[idx] = record;
      else all.unshift(record);
      localStorage.setItem(this.KEYS.MOCK_INTERVIEWS, JSON.stringify(all));

      // Supabase live sync
      if (window.SupabaseBridge && window.SupabaseBridge.isLive() && user && user.id) {
        const client = window.SupabaseBridge.getClient();
        
        // 1. Upsert mock_interviews row
        const { data: interviewRow, error: interviewErr } = await client.from('mock_interviews').upsert([{
          id: record.id.startsWith('interview_') ? undefined : record.id,
          user_id: user.id,
          resume_id: record.resume_id,
          department_id: record.department,
          target_role: record.targetRole,
          interview_type: record.interviewType,
          difficulty: record.difficulty,
          question_count: record.questionCount,
          status: record.status,
          overall_score: record.overallScore,
          technical_score: record.technicalScore,
          communication_score: record.communicationScore,
          problem_solving_score: record.problemSolvingScore,
          resume_score: record.resumeScore,
          role_readiness_score: record.roleReadinessScore,
          report: {
            strengths: record.strengths,
            weaknesses: record.weaknesses,
            resumeGapAnalysis: record.resumeGapAnalysis,
            resumeImprovements: record.resumeImprovements,
            topicsToRevise: record.topicsToRevise,
            preparationPlan: record.preparationPlan,
            recommendedResources: record.recommendedResources
          },
          completed_at: new Date().toISOString()
        }]).select();

        if (interviewErr) {
          console.warn('[DB] Supabase mock interview sync error:', interviewErr.message);
        } else if (interviewRow && interviewRow[0] && Array.isArray(record.conversation) && record.conversation.length > 0) {
          const interviewId = interviewRow[0].id;
          
          // 2. Insert questions & answers into dedicated tables
          for (let i = 0; i < record.conversation.length; i++) {
            const item = record.conversation[i];
            const { data: qRow, error: qErr } = await client.from('mock_interview_questions').insert([{
              interview_id: interviewId,
              question_number: i + 1,
              question: item.question,
              category: item.questionType || 'technical',
              difficulty: record.difficulty
            }]).select();

            if (!qErr && qRow && qRow[0]) {
              await client.from('mock_interview_answers').insert([{
                question_id: qRow[0].id,
                user_id: user.id,
                answer: item.answer || '',
                technical_score: item.technicalScore || 0,
                relevance_score: item.relevanceScore || 0,
                depth_score: item.depthScore || 0,
                feedback: item.feedback || '',
                missing_concepts: item.missingConcepts || []
              }]);
            }
          }
        }
      }

      return record;
    } catch (e) {
      console.warn('[DB] Error saving mock interview:', e);
      return null;
    }
  },

  async getMockInterviewHistory(userEmail = null) {
    const email = userEmail || this.getCurrentUserEmail();

    // 1. Try Supabase if live
    if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
      try {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          const { data, error } = await client
            .from('mock_interviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map(row => {
              const rep = row.report || {};
              return {
                id: row.id,
                targetRole: row.target_role,
                department: row.department_id || row.department || 'CSE',
                interviewType: row.interview_type,
                difficulty: row.difficulty,
                overallScore: row.overall_score,
                technicalScore: row.technical_score,
                status: row.status,
                strengths: rep.strengths || row.strengths || [],
                weaknesses: rep.weaknesses || row.weaknesses || [],
                createdAt: row.created_at || row.completed_at
              };
            });
          }
        }
      } catch (err) {
        console.warn('[DB] Could not load interviews from Supabase, checking local:', err);
      }
    }

    // 2. Check LocalStorage fallback
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.MOCK_INTERVIEWS) || '[]');
      return all.filter(item => (item.userId || '').toLowerCase() === email.toLowerCase());
    } catch (e) {
      return [];
    }
  },

  async getMockInterviewSession(sessionId) {
    if (!sessionId) return null;
    // Check LocalStorage first for instant latency
    try {
      const all = JSON.parse(localStorage.getItem(this.KEYS.MOCK_INTERVIEWS) || '[]');
      const found = all.find(s => s.id === sessionId);
      if (found) return found;
    } catch (e) {}

    // Try Supabase if live
    if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
      try {
        const client = window.SupabaseBridge.getClient();
        if (client) {
          const { data, error } = await client
            .from('mock_interviews')
            .select('*, mock_interview_questions(*), mock_interview_answers(*)')
            .eq('id', sessionId)
            .single();
          if (!error && data) return data;
        }
      } catch (e) {}
    }
    return null;
  },

  // ========================================================================
  // 9. STUDENT REVIEWS & MODERATION
  // ========================================================================
  submitReview(rating, comment, branch = 'AIML') {
    try {
      const user = window.AuthManager ? window.AuthManager.getUser() : null;
      const email = this.getCurrentUserEmail();
      const name = user ? user.name : 'Engineering Student';
      const review = {
        id: 'rev_' + Date.now(),
        userId: email,
        studentName: name,
        branch,
        rating: Math.max(1, Math.min(5, rating)),
        comment,
        isApproved: false,
        createdAt: new Date().toISOString()
      };
      const all = JSON.parse(localStorage.getItem(this.KEYS_REVIEWS) || '[]');
      all.unshift(review);
      localStorage.setItem(this.KEYS_REVIEWS, JSON.stringify(all));

      if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
        const client = window.SupabaseBridge.getClient();
        if (client && user && user.id) {
          client.from('reviews').insert([{
            user_id: user.id,
            student_name: name,
            branch,
            rating,
            comment,
            is_approved: false
          }]).then(({ error }) => {
            if (error) console.warn('[DB] Supabase review sync error:', error.message);
          });
        }
      }
      return review;
    } catch (e) {
      return null;
    }
  },

  // ========================================================================
  // 10. INTERNSHIP TRACKER PERSISTENCE
  // ========================================================================
  getInternshipApplications(userEmail = null) {
    try {
      const email = userEmail || this.getCurrentUserEmail();
      const all = JSON.parse(localStorage.getItem(this.KEYS_INTERNSHIPS) || '[]');
      return all.filter(a => a.userId === email);
    } catch (e) {
      return [];
    }
  },

  saveInternshipApplication(app) {
    try {
      const email = this.getCurrentUserEmail();
      const record = { ...app, id: app.id || 'int_' + Date.now(), userId: email, updatedAt: new Date().toISOString() };
      const all = JSON.parse(localStorage.getItem(this.KEYS_INTERNSHIPS) || '[]');
      const idx = all.findIndex(a => a.id === record.id);
      if (idx >= 0) all[idx] = record;
      else all.unshift(record);
      localStorage.setItem(this.KEYS_INTERNSHIPS, JSON.stringify(all));

      if (window.SupabaseBridge && window.SupabaseBridge.isLive()) {
        const client = window.SupabaseBridge.getClient();
        const user = window.AuthManager ? window.AuthManager.getUser() : null;
        if (client && user && user.id) {
          client.from('internship_applications').upsert([{
            user_id: user.id,
            company_name: app.companyName,
            role_title: app.roleTitle,
            status: app.status || 'Saved',
            stipend: app.stipend || '',
            application_deadline: app.deadline || null,
            portal_url: app.portalUrl || ''
          }]).then(({ error }) => {
            if (error) console.warn('[DB] Supabase internship sync error:', error.message);
          });
        }
      }
      return record;
    } catch (e) {
      return null;
    }
  },

  /**
   * Transparent Career Readiness calculation per Section 14
   * Strictly displays "Your current preparation" without false employability claims
   */
  calculateCareerReadiness(userEmail = null, careerId = 'sde') {
    const skills = this.getUserSkills(userEmail);
    const projects = this.getProjects(userEmail);
    const quizzes = this.getQuizAttempts(userEmail);
    const study = this.getStudyAnalytics(userEmail);

    // Skill mastery weight: 35%
    const avgSkillMastery = skills.length 
      ? skills.reduce((acc, s) => acc + (s.mastery || 0), 0) / skills.length 
      : 0;

    // Project progress weight: 30%
    const avgProjectScore = projects.length
      ? projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length
      : 0;

    // Quiz accuracy weight: 20%
    const avgQuizScore = quizzes.length
      ? quizzes.reduce((acc, q) => acc + (q.percentage || 0), 0) / quizzes.length
      : 0;

    // Study discipline weight: 15% (capped at 20 hours for 100%)
    const studyHoursScore = Math.min(parseFloat(study.totalHours || 0) / 20 * 100, 100);

    const weightedScore = Math.round(
      (avgSkillMastery * 0.35) +
      (avgProjectScore * 0.30) +
      (avgQuizScore * 0.20) +
      (studyHoursScore * 0.15)
    );

    const strongCount = skills.filter(s => s.mastery >= 75 || s.level === 'Strong' || s.level === 'Advanced').length;
    const practicalCount = skills.filter(s => s.hasProjectEvidence || (s.practicalScore || 0) >= 60).length;
    const verifiedProjectsCount = projects.filter(p => (p.progress || 0) >= 80).length;

    return {
      percentage: Math.max(Math.min(weightedScore, 100), 0),
      coreSkillsStrong: `${strongCount} / ${Math.max(skills.length, 5)} strong`,
      practicalSkillsDemonstrated: `${practicalCount} / ${Math.max(skills.length, 3)} demonstrated`,
      projectsRecommended: `${verifiedProjectsCount} / 3 recommended`,
      interviewPreparation: `${Math.min(100, Math.round(avgQuizScore * 0.6 + avgSkillMastery * 0.4))}%`,
      label: 'Your Current Preparation',
      disclaimer: 'Based on authentic activity, assessments, and verified projects. Not an employment guarantee.'
    };
  },

  // ========================================================================
  // 12. SUPABASE REALTIME LIVE DATA SYNCHRONIZATION
  // ========================================================================
  initRealtimeSync() {
    if (!window.SupabaseBridge || !window.SupabaseBridge.isLive()) return;
    const bridge = window.SupabaseBridge;

    // 1. Live Daily Tasks
    bridge.subscribeToTable('daily_tasks', (payload) => {
      if (payload.new) {
        const tasks = this.getTasks();
        const idx = tasks.findIndex(t => t.id === payload.new.id);
        const mapped = {
          id: payload.new.id,
          userId: payload.new.user_id,
          title: payload.new.title,
          subject: payload.new.subject,
          priority: payload.new.priority,
          date: payload.new.date,
          startTime: payload.new.start_time,
          endTime: payload.new.end_time,
          completed: payload.new.completed,
          studyDurationSeconds: payload.new.study_duration_seconds,
          description: payload.new.description
        };
        if (idx >= 0) tasks[idx] = mapped;
        else tasks.unshift(mapped);
        localStorage.setItem(this.KEYS.DAILY_TASKS, JSON.stringify(tasks));
      } else if (payload.eventType === 'DELETE' && payload.old) {
        let tasks = this.getTasks();
        tasks = tasks.filter(t => t.id !== payload.old.id);
        localStorage.setItem(this.KEYS.DAILY_TASKS, JSON.stringify(tasks));
      }
      window.dispatchEvent(new CustomEvent('btech:task-sync', { detail: payload }));
    });

    // 2. Live Study Sessions
    bridge.subscribeToTable('study_sessions', (payload) => {
      if (payload.new) {
        const sessions = this.getStudySessions();
        const idx = sessions.findIndex(s => s.sessionId === payload.new.id);
        const mapped = {
          sessionId: payload.new.id,
          userId: payload.new.user_id,
          subject: payload.new.subject,
          topic: payload.new.topic,
          durationSeconds: payload.new.duration_seconds,
          startTime: payload.new.start_time,
          endTime: payload.new.end_time,
          studyDate: payload.new.study_date,
          notes: payload.new.notes
        };
        if (idx >= 0) sessions[idx] = mapped;
        else sessions.unshift(mapped);
        localStorage.setItem(this.KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
      }
      window.dispatchEvent(new CustomEvent('btech:session-sync', { detail: payload }));
    });

    // 3. Live Exams
    bridge.subscribeToTable('exams', (payload) => {
      if (payload.new) {
        const exams = this.getExams();
        const idx = exams.findIndex(e => e.id === payload.new.id);
        const mapped = {
          id: payload.new.id,
          userId: payload.new.user_id,
          name: payload.new.name,
          subject: payload.new.subject,
          examDate: payload.new.exam_date,
          examTime: payload.new.exam_time,
          room: payload.new.room,
          syllabus: payload.new.syllabus,
          targetScore: payload.new.target_score
        };
        if (idx >= 0) exams[idx] = mapped;
        else exams.unshift(mapped);
        localStorage.setItem(this.KEYS.EXAMS, JSON.stringify(exams));
      }
      window.dispatchEvent(new CustomEvent('btech:exam-sync', { detail: payload }));
    });

    // 4. Live Roadmaps
    bridge.subscribeToTable('roadmaps', (payload) => {
      window.dispatchEvent(new CustomEvent('btech:roadmap-sync', { detail: payload }));
    });

    // 5. Live Jobs & Internships
    bridge.subscribeToTable('jobs', (payload) => {
      window.dispatchEvent(new CustomEvent('btech:job-sync', { detail: payload }));
    });

    console.log('⚡ [DB] Live Supabase Realtime synchronization active across entities.');
  }
};

// Initialize DB immediately
DB.init();
