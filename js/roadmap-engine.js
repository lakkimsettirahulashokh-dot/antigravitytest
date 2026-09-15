/* ==========================================================================
   BTechPath AI OS - Procedural Engineering Roadmap Engine
   - Synthesizes 8 chronological phases from student inputs
   - Supports Engineering branches, Govt Exams, International Exams
   - Implements fail-safe recovery, persistence, timeout guards, and node progression
   ========================================================================== */

const RoadmapEngine = {
  STORAGE_KEY: 'btechpath_saved_roadmaps',
  isGenerating: false,

  // Load saved roadmaps for active user
  getSavedRoadmaps() {
    try {
      const user = AuthManager.getUser();
      const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      if (!user) return null;
      return all[user.email.toLowerCase()] || null;
    } catch (e) {
      return null;
    }
  },

  // Save generated roadmap
  saveRoadmap(roadmapData) {
    try {
      const user = AuthManager.getUser();
      if (!user) return;
      const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      all[user.email.toLowerCase()] = {
        ...roadmapData,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('Error saving roadmap', e);
    }
  },

  // Procedural Roadmap Generator with Timeout & Fail-Safe Recovery
  generateRoadmap(params, onSuccess, onError) {
    if (this.isGenerating) {
      AuthManager.showToast('Roadmap synthesis is already in progress...', 'warning');
      return;
    }

    // Input validation
    if (!params.branch || !params.targetCareer) {
      if (onError) onError('Please select both an Engineering Branch and Target Career.');
      return;
    }

    this.isGenerating = true;

    // Timeout guard (8 seconds max)
    const timeoutHandle = setTimeout(() => {
      if (this.isGenerating) {
        this.isGenerating = false;
        if (onError) onError("We couldn't generate your roadmap right now (Connection timeout). Please click Retry.");
      }
    }, 8000);

    // Procedural generation tailored to branch & career
    setTimeout(() => {
      clearTimeout(timeoutHandle);
      this.isGenerating = false;

      const branchObj = BranchSystem.getBranch(params.branch);
      const isGovtExam = params.trackType === 'govt';
      const isIntlExam = params.trackType === 'intl';

      let phases = [];

      if (isGovtExam) {
        // Government Exam Roadmap Format (UPSC/GATE/ESE)
        phases = [
          { phase: 1, title: 'Phase 1: Syllabus Orientation & High-Yield NCERT/Foundation',
            desc: `Master core foundational theory in ${branchObj.name} and General Studies fundamentals.`,
            status: 'completed',
            milestones: ['Detailed Syllabus & Weightage Analysis', 'Standard Reference Textbooks Sourcing', 'Previous 10 Years Question Paper Diagnostic Test'] },
          { phase: 2, title: 'Phase 2: Core Engineering & Technical Syllabus Deep-Dive',
            desc: `In-depth mastery of high-weightage subjects with comprehensive handwritten formula sheets.`,
            status: 'active',
            milestones: [`Subject Mastery: ${branchObj.coreSkills[0]}`, `Subject Mastery: ${branchObj.coreSkills[1]}`, 'Rigorous Subject-wise Practice Tests (Minimum 500 MCQs)'] },
          { phase: 3, title: 'Phase 3: Previous Years Questions (PYQ) & Pattern Synthesis',
            desc: `Solve 15 years of previous examination papers under timed exam conditions.`,
            status: 'locked',
            milestones: ['PYQ Analysis: Past 5 Years (Target: 95% Accuracy)', 'Formula Sheet Consolidation', 'Time-Management Drill (180 mins / 100 Qs)'] },
          { phase: 4, title: 'Phase 4: Full-Length All-India Mock Test Series',
            desc: `Simulate actual computer-based test (CBT) environments and identify percentile ranks.`,
            status: 'locked',
            milestones: ['10 Full-Length Mock Exams with Negative Marking', 'Negative Marks Audit & Error Log Review', 'National Percentile Benchmark >= 98%ile'] },
          { phase: 5, title: 'Phase 5: Weak-Area Remediation & High-Speed Revision',
            desc: `Focused review of error patterns, formula recall, and speed-accuracy optimization.`,
            status: 'locked',
            milestones: ['Flashcard Active Recall of Critical Formulas', 'Rapid 3-Day Revision of Tier-1 Subjects', 'Mental Calm & Exam Hall Simulation'] },
          { phase: 6, title: 'Phase 6: Final Revision & Personality Interview Test',
            desc: `Final mock interviews with board members and current affairs consolidation.`,
            status: 'locked',
            milestones: ['Detailed Application Form (DAF) Prep', 'Technical Domain Viva Voce Mock', 'Final Hall Ticket & Strategy Review'] }
        ];
      } else if (isIntlExam) {
        // International Exam Roadmap (GRE / TOEFL / IELTS)
        phases = [
          { phase: 1, title: 'Phase 1: Diagnostic Assessment & Format Familiarization',
            desc: 'Understand scoring bands, computer-adaptive testing, and diagnostic baseline.',
            status: 'completed',
            milestones: ['Official ETS / British Council Diagnostic Test', 'Scoring Rubric & Time Allotment Mapping', 'Diagnostic Review: Quant, Verbal, AWA Baseline'] },
          { phase: 2, title: 'Phase 2: High-Frequency Vocabulary & Core Quantitative Foundations',
            desc: 'Build active 1,200 essential vocabulary words and quant mental math agility.',
            status: 'active',
            milestones: ['1,000 High-Frequency Academic Flashcards', 'Quant Foundations: Arithmetic, Algebra, Geometry, Data Analysis', 'Argument Essay Structure & Template Formulation'] },
          { phase: 3, title: 'Phase 3: Advanced Reading Comprehension & Sectional Drills',
            desc: 'Master long-passage synthesis, text completion, and sentence equivalence.',
            status: 'locked',
            milestones: ['Reading Comprehension: Tone, Inference & Main Idea Drills', 'Advanced Quant Drills (Target: 168+ Quant)', 'Issue & Argument Timed Essay Submissions'] },
          { phase: 4, title: 'Phase 4: Official Full-Length Computer-Adaptive Mocks',
            desc: 'Simulate the exact 4-hour adaptive test under strict timing.',
            status: 'locked',
            milestones: ['PowerPrep Official Computer-Adaptive Test 1 & 2', 'Pacing Optimization & Fatigue Management', 'Target Benchmark Score Verification (GRE 325+ / IELTS 8.0)'] }
        ];
      } else {
        // Standard Comprehensive Engineering Roadmap (8 Phases)
        phases = [
          { phase: 1, title: 'Phase 1: Computer Science & Algorithmic Foundations',
            desc: `Master core computing principles, complexity analysis, and ${branchObj.coreSkills[0]}.`,
            status: 'completed',
            milestones: ['Memory Allocation & Pointers', 'Array & String Manipulation (Two Pointers / Sliding Window)', 'Recursion & Backtracking Invariants', 'Sorting & Binary Search Paradigms'] },
          { phase: 2, title: `Phase 2: Core ${branchObj.name} Domain Skills`,
            desc: `Deep dive into ${branchObj.coreSkills[1]} and ${branchObj.coreSkills[2]}.`,
            status: 'active',
            milestones: [`Mastery: ${branchObj.coreSkills[1]}`, `Mastery: ${branchObj.coreSkills[2]}`, 'Build 2 Focused Architectural Prototypes', 'Unit Testing & Error Handling Patterns'] },
          { phase: 3, title: 'Phase 3: Industry Tools, Frameworks & Modern DevOps',
            desc: `Master production-grade tools required for modern ${params.targetCareer}.`,
            status: 'locked',
            milestones: ['Version Control: Git Advanced Rebase & Branching', 'Containerization: Docker Multi-Stage Builds & Compose', 'CI/CD Pipelines: GitHub Actions Automation', 'Cloud Deployment (AWS / GCP Serverless)'] },
          { phase: 4, title: 'Phase 4: Production-Grade Capstone Projects',
            desc: `Architect scalable, end-to-end applications demonstrating distributed resilience.`,
            status: 'locked',
            milestones: ['Project 1: Distributed High-Throughput System', 'Project 2: AI-Powered Autonomous Pipeline', 'Write Comprehensive Architecture Design Docs (RFC)'] },
          { phase: 5, title: 'Phase 5: High-Impact Internship & Open-Source Sprints',
            desc: `Apply skills in production environments and contribute to high-visibility open-source projects.`,
            status: 'locked',
            milestones: ['Contribute 3 Merged PRs to Global Open-Source Repos', 'Apply to 25 Curated Tier-1 Startup & FAANG Internships', 'Direct Outreach to Tech Leads & Engineering Managers'] },
          { phase: 6, title: 'Phase 6: ATS-Optimized Resume & Portfolio Architecture',
            desc: `Translate engineering impact into quantitative Google XYZ bullet points.`,
            status: 'locked',
            milestones: ['Build Interactive Live Portfolio with Live Demo Links', 'Pass ATS Parser with 95%+ Target Job Description Match', 'Peer Review with Senior Staff Engineers'] },
          { phase: 7, title: 'Phase 7: Live Technical & System Design Interviews',
            desc: `Simulate high-stakes live coding, whiteboarding, and behavioral leadership rounds.`,
            status: 'locked',
            milestones: ['Complete 8 AI Mock Interview Technical Rounds', 'System Design Whiteboard: Scalability, Caching, Sharding', 'Behavioral STAR Method: Conflict, Ownership & Impact Stories'] },
          { phase: 8, title: `Phase 8: Campus Placement & ${params.targetCareer} Career Launch`,
            desc: `Negotiate high-package offers and transition smoothly into top engineering teams.`,
            status: 'locked',
            milestones: ['On-Campus Placement Drives & Online Assessments', 'Offer Evaluation & Compensation Package Negotiation', 'Day-1 Production Readiness & Professional Mentorship'] }
        ];
      }

      const generated = {
        branch: params.branch,
        branchName: branchObj.name,
        targetCareer: params.targetCareer,
        semester: params.semester || 'Semester 6',
        skillLevel: params.skillLevel || 'Intermediate',
        trackType: params.trackType || 'tech',
        phases: phases,
        totalMilestones: phases.reduce((acc, p) => acc + p.milestones.length, 0),
        completedMilestones: phases[0].milestones.length
      };

      this.saveRoadmap(generated);

      if (onSuccess) onSuccess(generated);
      AuthManager.showToast(`Custom Engineering Roadmap synthesized for ${branchObj.name}!`, 'success');
    }, 1200);
  },

  // Toggle milestone completion with XP celebration
  toggleMilestone(phaseIndex, milestoneIndex) {
    const roadmap = this.getSavedRoadmaps();
    if (!roadmap || !roadmap.phases[phaseIndex]) return;

    const phase = roadmap.phases[phaseIndex];
    if (phase.status !== 'completed') {
      phase.status = 'completed';
      
      // Unlock next phase
      if (roadmap.phases[phaseIndex + 1]) {
        roadmap.phases[phaseIndex + 1].status = 'active';
      }

      roadmap.completedMilestones = Math.min(roadmap.completedMilestones + 1, roadmap.totalMilestones);
      this.saveRoadmap(roadmap);

      // Award XP
      const user = AuthManager.getUser();
      if (user) {
        user.xp = (user.xp || 3850) + 150;
        AuthManager.setUser(user);
        App.updateUserContext();
      }

      AuthManager.showToast(`Milestone Completed! Phase ${phaseIndex + 1} finalized (+150 XP)`, 'success');
      return true;
    }
    return false;
  }
};
