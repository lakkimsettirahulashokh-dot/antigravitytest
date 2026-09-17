
        const ExamPage = {
            selectedFile: null,
            selectedFileBase64: null,
            activeExam: null,
            activeStudyPack: null,
            currentTab: 'overview',
            currentFlashcardIndex: 0,
            flashcardFlipped: false,
            practiceAttempts: {},
            selectedNoteTopicId: null,
            questionFilter: 'all',

            async init() {
                await this.refreshExams();
                setInterval(() => this.renderExams(), 60000);
            },

            async refreshExams() {
                await DB.fetchExamsFromApi();
                this.renderExams();
                this.generateSmartSchedule();
            },

            renderExams() {
                const exams = DB.getExams();
                const container = document.getElementById('exams-cards-container');
                const empty = document.getElementById('exams-empty-state');
                const countBadge = document.getElementById('exam-count-badge');

                if (countBadge) countBadge.textContent = `${exams.length} Active Exams`;

                if (!exams.length) {
                    container.innerHTML = '';
                    if (empty) empty.classList.remove('hidden');
                    return;
                }
                if (empty) empty.classList.add('hidden');

                container.innerHTML = exams.map(exam => {
                    const countdown = DB.getExamCountdown(exam.targetDate || exam.examDate, '10:00');
                    const progress = DB.getExamPreparationProgress(exam);
                    const isUrgent = countdown.days <= 14;
                    const docInfo = exam.document || {};
                    const metrics = exam.metrics || { totalTopics: 0, completedTopics: 0, readinessIndex: progress };

                    return `
                        <div class="bg-midnight border border-subtle rounded-3xl p-6 md:p-7 space-y-5 shadow-2xl flex flex-col justify-between hover:border-indigo-brand/50 transition-all group">
                            <div>
                                <!-- Top Row -->
                                <div class="flex items-start justify-between gap-3">
                                    <div>
                                        <div class="flex flex-wrap items-center gap-2">
                                            <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                                                isUrgent ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-elevated text-indigo-brand border border-subtle'
                                            }">${exam.category || exam.examType || 'Competitive'}</span>
                                            
                                            ${docInfo.isOfficial ? `
                                                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-brand/20 text-teal-brand border border-teal-brand/40 flex items-center gap-1">
                                                    <span class="material-symbols-outlined text-[10px]">verified</span>
                                                    <span>Verified PDF (v${docInfo.version || 1})</span>
                                                </span>
                                            ` : ''}

                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-brand/20 text-indigo-brand border border-indigo-brand/30 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[10px]">auto_stories</span>
                                                <span>Study Pack Ready</span>
                                            </span>
                                        </div>

                                        <h3 class="font-bold text-base sm:text-lg text-warm-ivory mt-2 group-hover:text-indigo-brand transition-colors">${exam.name}</h3>
                                        
                                        <div class="text-xs text-muted-gray flex flex-wrap items-center gap-2 mt-1 font-mono">
                                            <span class="flex items-center gap-1">
                                                <span class="material-symbols-outlined text-sm text-indigo-brand">event</span>
                                                <span>${exam.targetDate || exam.examDate}</span>
                                            </span>
                                            <span>•</span>
                                            <span class="text-teal-brand">${(exam.dailyStudyMinutes || 120) / 60}h/day planned</span>
                                            ${(exam.weakSubjects && exam.weakSubjects.length > 0) ? `
                                                <span>•</span>
                                                <span class="text-rose-gold">Priority: ${exam.weakSubjects[0]}</span>
                                            ` : ''}
                                        </div>
                                    </div>

                                    <!-- Countdown Clock -->
                                    <div class="text-right shrink-0">
                                        <div class="p-3 rounded-2xl bg-elevated border border-subtle text-center min-w-[90px]">
                                            <div class="text-2xl font-black font-mono ${isUrgent ? 'text-rose-gold' : 'text-teal-brand'}">${countdown.days}d</div>
                                            <div class="text-[10px] font-mono text-muted-gray uppercase">REMAINING</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Progress Bar -->
                                <div class="mt-5 space-y-1.5">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-muted-gray">Syllabus Topics (${metrics.completedTopics || 0} of ${metrics.totalTopics || 0} Complete)</span>
                                        <span class="font-mono font-bold text-warm-ivory">${progress}% Covered</span>
                                    </div>
                                    <div class="w-full h-2 rounded-full bg-elevated overflow-hidden border border-subtle">
                                        <div class="h-full bg-gradient-to-r from-indigo-brand to-teal-brand rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                                    </div>
                                </div>

                                <!-- Source Document Badge -->
                                ${docInfo.fileName ? `
                                    <div class="mt-4 p-2.5 rounded-xl bg-elevated/70 border border-subtle flex items-center justify-between text-xs">
                                        <div class="flex items-center gap-2 overflow-hidden">
                                            <span class="material-symbols-outlined text-sm text-indigo-brand shrink-0">description</span>
                                            <span class="text-warm-ivory truncate font-mono text-[11px]">${docInfo.fileName}</span>
                                        </div>
                                        <span class="text-[10px] font-mono text-muted-gray shrink-0">${docInfo.pageCount || 1} Pages • Grounded</span>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Bottom Action Row -->
                            <div class="pt-4 border-t border-subtle/70 flex items-center justify-between gap-2 text-xs">
                                <button onclick="ExamPage.openExamDetail('${exam.id}')" class="px-4 py-2.5 rounded-xl bg-indigo-brand hover:bg-indigo-600 text-white font-bold flex items-center gap-2 shadow-md transition-colors">
                                    <span class="material-symbols-outlined text-sm">menu_book</span>
                                    <span>Open 9-Tab Study Pack</span>
                                </button>
                                <div class="flex items-center gap-1.5">
                                    <button onclick="ExamPage.openExamDetail('${exam.id}', 'practice-questions')" class="p-2.5 rounded-xl bg-elevated hover:bg-surface-elevated text-teal-brand border border-subtle" title="Launch Practice Quiz">
                                        <span class="material-symbols-outlined text-base">quiz</span>
                                    </button>
                                    <button onclick="ExamPage.deleteExam('${exam.id}')" class="text-muted-gray hover:text-red-400 p-2.5 transition-colors" title="Delete Exam">
                                        <span class="material-symbols-outlined text-base">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            },

            // -------------------------------------------------------------
            // 9-TAB STUDY PACK CONTROLLER
            // -------------------------------------------------------------
            switchTab(tabId) {
                this.currentTab = tabId;
                
                // Update Tab Buttons UI
                document.querySelectorAll('.study-tab-btn').forEach(btn => {
                    const isCurrent = btn.getAttribute('data-tab') === tabId;
                    if (isCurrent) {
                        btn.className = 'study-tab-btn active px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap bg-indigo-brand text-white shadow-sm';
                    } else {
                        btn.className = 'study-tab-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-gray hover:text-warm-ivory hover:bg-elevated transition-all flex items-center gap-1.5 whitespace-nowrap';
                    }
                });

                // Switch Panels
                document.querySelectorAll('.study-tab-panel').forEach(panel => panel.classList.add('hidden'));
                const activePanel = document.getElementById(`tab-panel-${tabId}`);
                if (activePanel) activePanel.classList.remove('hidden');

                // If switching to practice questions or notes, re-sync state
                if (tabId === 'practice-questions') this.renderPracticeQuestions();
                if (tabId === 'quick-revision') this.updateFlashcardUI();
            },

            async openExamDetail(examId, defaultTab = 'overview') {
                let exam = await DB.getExamById(examId);
                if (!exam) return;
                this.activeExam = exam;

                // Ensure studyPack is loaded
                const packRes = await DB.fetchExamStudyPack(examId);
                this.activeStudyPack = packRes.studyPack || exam.studyPack || {};
                exam.studyPack = this.activeStudyPack;

                const modal = document.getElementById('exam-detail-modal');
                document.getElementById('det-exam-title').textContent = exam.name;
                document.getElementById('det-category-badge').textContent = (exam.category || 'Examination').toUpperCase();
                
                const docName = exam.document?.fileName || 'Official_Syllabus.pdf';
                document.getElementById('det-doc-name').textContent = docName;

                // Render all 9 panels with grounded data
                this.renderOverviewTab();
                this.renderMainPointsTab();
                this.renderPreparedNotesTab();
                this.renderImportantQuestionsTab();
                this.renderDetailedExplanationsTab();
                this.renderQuickRevisionTab();
                this.renderPracticeQuestions();
                this.renderExamStrategyTab();
                this.renderOriginalPdfTab();

                this.switchTab(defaultTab);
                modal.classList.remove('hidden');
            },

            closeExamDetailModal() {
                const modal = document.getElementById('exam-detail-modal');
                if (modal) modal.classList.add('hidden');
            },

            // TAB 1: OVERVIEW
            renderOverviewTab() {
                const exam = this.activeExam;
                const countdown = DB.getExamCountdown(exam.targetDate || exam.examDate);
                const progress = DB.getExamPreparationProgress(exam);
                const duration = exam.pattern?.durationMinutes || 180;
                const marks = exam.pattern?.totalMarks || 100;
                const dailyHours = ((exam.dailyStudyMinutes || 120) / 60).toFixed(1);

                document.getElementById('det-days-remaining').textContent = `${countdown.days}d Remaining`;
                document.getElementById('det-exam-date-sub').textContent = exam.targetDate || '2026-02-07';
                document.getElementById('det-coverage-percent').textContent = `${progress}% Covered`;
                
                let totalTopicsCount = 0;
                let completedTopicsCount = 0;
                (exam.subjects || []).forEach(s => (s.topics || []).forEach(t => {
                    totalTopicsCount++;
                    if (t.status === 'Completed') completedTopicsCount++;
                }));
                document.getElementById('det-topics-ratio').textContent = `${completedTopicsCount} of ${totalTopicsCount} Topics`;

                document.getElementById('det-marks-duration').textContent = `${marks} Marks • ${duration} Mins`;
                document.getElementById('det-negative-rule').textContent = exam.pattern?.negativeMarking || 'Negative Marking Applicable';
                document.getElementById('det-daily-hours').textContent = `${dailyHours} hrs/day`;

                // Weak subject banner
                const weakBanner = document.getElementById('det-weak-alert-banner');
                const weakText = document.getElementById('det-weak-alert-text');
                if (exam.weakSubjects && exam.weakSubjects.length > 0) {
                    weakBanner.classList.remove('hidden');
                    weakText.textContent = `High-yield focus directed to ${exam.weakSubjects.join(', ')}. Extra daily study blocks, step-by-step solved numericals, and active recall cards are scheduled.`;
                } else {
                    weakBanner.classList.add('hidden');
                }

                // Official Syllabus Topics
                const syllabusContainer = document.getElementById('det-syllabus-container');
                if (exam.subjects && exam.subjects.length) {
                    syllabusContainer.innerHTML = exam.subjects.map(sub => `
                        <div class="p-4 rounded-2xl bg-elevated border border-subtle space-y-3">
                            <div class="flex items-center justify-between border-b border-subtle/60 pb-2">
                                <div>
                                    <h4 class="font-bold text-xs sm:text-sm text-warm-ivory">${sub.name}</h4>
                                    <span class="text-[10px] font-mono text-muted-gray">Source: ${sub.sourceReference || 'Official Document'}</span>
                                </div>
                                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-brand/20 text-indigo-brand border border-indigo-brand/40">
                                    ${sub.weightagePercent || 20}% Weightage
                                </span>
                            </div>

                            <div class="space-y-2">
                                ${(sub.topics || []).map(top => `
                                    <div class="p-2.5 rounded-xl bg-midnight border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                        <div class="overflow-hidden">
                                            <div class="font-bold text-warm-ivory flex items-center gap-1.5">
                                                <span>${top.name}</span>
                                                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-elevated text-muted-gray">${top.sourceReference || 'Document'}</span>
                                            </div>
                                            ${top.description ? `<p class="text-[11px] text-muted-gray mt-0.5 line-clamp-1">${top.description}</p>` : ''}
                                        </div>
                                        <div class="flex items-center gap-2 shrink-0">
                                            <select onchange="ExamPage.updateTopicStatus('${exam.id}', '${top.id}', this.value)" class="premium-input text-[11px] py-1 px-2 font-mono">
                                                <option value="Not Started" ${top.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                                <option value="Learning" ${top.status === 'Learning' ? 'selected' : ''}>Learning</option>
                                                <option value="Practicing" ${top.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
                                                <option value="Completed" ${top.status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
                                                <option value="Needs Revision" ${top.status === 'Needs Revision' ? 'selected' : ''}>⚠️ Needs Revision</option>
                                            </select>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('');
                } else {
                    syllabusContainer.innerHTML = `<div class="p-4 text-xs text-muted-gray">No syllabus topics available.</div>`;
                }

                // Curated Videos
                const videosContainer = document.getElementById('det-videos-container');
                const sampleVideos = [
                    { title: 'Relational Normalization, BCNF & Dependency Preservation', channel: 'NPTEL / Gate Smashers', duration: '28:40', url: 'https://www.youtube.com/results?search_query=BCNF+normalization+gate+cse' },
                    { title: 'Virtual Memory, TLB Access & Effective Memory Time', channel: 'NPTEL Operating Systems', duration: '34:15', url: 'https://www.youtube.com/results?search_query=virtual+memory+tlb+emat+gate' },
                    { title: 'Master Theorem & Recurrence Relations with Log Factors', channel: 'Abdul Bari / Algorithms', duration: '22:10', url: 'https://www.youtube.com/results?search_query=master+theorem+abdul+bari' }
                ];
                videosContainer.innerHTML = sampleVideos.map(v => `
                    <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl bg-midnight border border-subtle hover:border-indigo-brand/60 transition-colors flex flex-col justify-between group">
                        <div class="space-y-1">
                            <div class="flex items-center gap-1.5 text-red-400 text-[10px] font-mono">
                                <span class="material-symbols-outlined text-xs">play_circle</span>
                                <span>${v.duration}</span>
                            </div>
                            <h5 class="font-bold text-xs text-warm-ivory group-hover:text-teal-brand transition-colors line-clamp-2">${v.title}</h5>
                        </div>
                        <span class="text-[10px] font-mono text-muted-gray mt-2 block">${v.channel}</span>
                    </a>
                `).join('');
            },

            // TAB 2: MAIN POINTS
            renderMainPointsTab() {
                const container = document.getElementById('det-main-points-list');
                const points = this.activeStudyPack?.mainPoints || [];
                if (!points.length) {
                    container.innerHTML = `<div class="p-4 text-xs text-muted-gray">No main points extracted yet.</div>`;
                    return;
                }

                container.innerHTML = points.map((p, idx) => `
                    <div class="p-4 rounded-2xl bg-elevated border border-subtle space-y-2 hover:border-indigo-brand/40 transition-colors">
                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-indigo-brand/20 text-indigo-brand font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                    ${idx + 1}
                                </span>
                                <span class="font-bold text-sm text-warm-ivory">${p.title}</span>
                            </div>
                            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-brand/15 text-teal-brand border border-teal-brand/30 shrink-0">
                                ${p.importanceBadge || 'HIGH PRIORITY'}
                            </span>
                        </div>
                        <p class="text-xs text-muted-gray leading-relaxed pl-8">${p.point}</p>
                        <div class="pl-8 pt-1 text-[10px] font-mono text-indigo-brand/90 flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">bookmark</span>
                            <span>Citation: ${p.sourceRef || 'Uploaded Document'}</span>
                        </div>
                    </div>
                `).join('');
            },

            // TAB 3: PREPARED NOTES (10-Point Framework)
            renderPreparedNotesTab() {
                const notes = this.activeStudyPack?.preparedNotes || [];
                const selector = document.getElementById('notes-topic-selector');
                const contentContainer = document.getElementById('notes-content-container');

                if (!notes.length) {
                    contentContainer.innerHTML = `<div class="p-4 text-xs text-muted-gray">No prepared notes generated.</div>`;
                    return;
                }

                if (!this.selectedNoteTopicId || !notes.some(n => n.topicId === this.selectedNoteTopicId)) {
                    this.selectedNoteTopicId = notes[0].topicId;
                }

                // Render Selector Pills
                selector.innerHTML = notes.map(n => {
                    const isSelected = n.topicId === this.selectedNoteTopicId;
                    return `
                        <button onclick="ExamPage.selectNoteTopic('${n.topicId}')" class="px-3 py-1.5 rounded-xl font-mono whitespace-nowrap transition-colors ${
                            isSelected 
                                ? 'bg-teal-brand text-slate-900 font-bold shadow-sm' 
                                : 'bg-elevated hover:bg-surface-elevated text-muted-gray'
                        }">
                            ${n.topicName}
                        </button>
                    `;
                }).join('');

                // Render Selected Note Card
                const currentNote = notes.find(n => n.topicId === this.selectedNoteTopicId) || notes[0];
                const fw = currentNote.framework || {};

                contentContainer.innerHTML = `
                    <div class="p-6 rounded-3xl bg-elevated border border-subtle space-y-6">
                        <!-- Header -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-3">
                            <div>
                                <span class="text-[10px] font-mono text-indigo-brand uppercase font-bold tracking-wider">${currentNote.subjectName}</span>
                                <h3 class="font-bold text-lg text-warm-ivory">${currentNote.topicName}</h3>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-brand/20 text-teal-brand border border-teal-brand/40 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-xs">verified</span>
                                    <span>${currentNote.groundingBadge || 'BASED ON UPLOADED PDF'}</span>
                                </span>
                            </div>
                        </div>

                        <!-- 1. Core Definition -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-teal-brand uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-teal-brand"></span>
                                <span>1. Core Academic Definition</span>
                            </h4>
                            <div class="p-3.5 rounded-2xl bg-midnight border border-subtle text-xs text-warm-ivory leading-relaxed">
                                ${fw.coreDefinition || 'Standard formal curriculum definition.'}
                            </div>
                        </div>

                        <!-- 2. Fundamental Principles -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-indigo-brand uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-indigo-brand"></span>
                                <span>2. Fundamental Principles & Invariants</span>
                            </h4>
                            <ul class="space-y-1.5 text-xs text-muted-gray list-disc list-inside bg-midnight p-3.5 rounded-2xl border border-subtle">
                                ${(fw.fundamentalPrinciples || []).map(p => `<li class="leading-relaxed"><strong class="text-warm-ivory">${p}</strong></li>`).join('')}
                            </ul>
                        </div>

                        <!-- 3. Step-by-Step Explanation -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-rose-gold uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-rose-gold"></span>
                                <span>3. Step-by-Step Problem Solving Method</span>
                            </h4>
                            <div class="space-y-2">
                                ${(fw.stepByStepExplanation || []).map((step, sIdx) => `
                                    <div class="p-2.5 rounded-xl bg-midnight border border-subtle flex items-start gap-2.5 text-xs">
                                        <span class="w-5 h-5 rounded-lg bg-rose-gold/20 text-rose-gold font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">${sIdx + 1}</span>
                                        <span class="text-muted-gray leading-relaxed">${step}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 4. Formulas & Theorems -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-teal-brand uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-teal-brand"></span>
                                <span>4. Formulas, Equations & Theorems</span>
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                ${(fw.formulasAndTheorems || []).map(form => `
                                    <div class="p-3 rounded-2xl bg-midnight border border-subtle space-y-1.5 text-xs font-mono">
                                        <div class="font-bold text-warm-ivory">${form.name}</div>
                                        <div class="p-2 rounded-lg bg-elevated text-teal-brand font-bold text-xs overflow-x-auto">${form.formula}</div>
                                        <div class="text-[10px] text-muted-gray">${form.meaning}</div>
                                        <div class="text-[10px] text-rose-gold/90">Conditions: ${form.conditions}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 5. Real-World Engineering Application -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-muted-gray uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-muted-gray"></span>
                                <span>5. Real-World Engineering Application</span>
                            </h4>
                            <p class="text-xs text-muted-gray bg-midnight p-3.5 rounded-2xl border border-subtle leading-relaxed">
                                ${fw.realWorldEngineeringApplication || 'Applied across scalable distributed systems and systems design.'}
                            </p>
                        </div>

                        <!-- 6. Diagram / Architecture Description -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-indigo-brand uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-indigo-brand"></span>
                                <span>6. Diagram & Execution Architecture</span>
                            </h4>
                            <div class="p-3.5 rounded-2xl bg-midnight border border-subtle text-xs font-mono text-teal-brand leading-relaxed">
                                ${fw.diagramOrFlowchartDescription || 'Input Stream -> Validation -> Transition Engine -> Deterministic State Output.'}
                            </div>
                        </div>

                        <!-- 7. Common Pitfalls & Traps -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-red-400"></span>
                                <span>7. Common Pitfalls & Traps Candidates Fall Into</span>
                            </h4>
                            <div class="space-y-1.5">
                                ${(fw.commonPitfallsAndTraps || []).map(trap => `
                                    <div class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                                        <span class="material-symbols-outlined text-sm shrink-0 mt-0.5">error_outline</span>
                                        <span class="leading-relaxed">${trap}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 8. Quick Revision Bullet Points -->
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-bold font-mono text-teal-brand uppercase tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-teal-brand"></span>
                                <span>8. Quick Revision Checklist</span>
                            </h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                ${(fw.quickRevisionBulletPoints || []).map(pt => `
                                    <div class="p-2 rounded-xl bg-midnight border border-subtle text-xs text-warm-ivory flex items-center gap-2">
                                        <span class="material-symbols-outlined text-teal-brand text-sm shrink-0">check_box</span>
                                        <span>${pt}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 9 & 10. Questions & Memory Mnemonics -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div class="p-4 rounded-2xl bg-midnight border border-subtle space-y-2">
                                <h5 class="font-bold text-xs font-mono text-rose-gold uppercase">9. Potential Questions</h5>
                                <ul class="space-y-1 text-xs text-muted-gray">
                                    ${(fw.potentialExamQuestions || []).map(q => `
                                        <li class="flex items-center justify-between gap-2">
                                            <span class="truncate">${q.title}</span>
                                            <span class="px-1.5 py-0.2 rounded font-mono text-[9px] bg-elevated text-warm-ivory">${q.marks}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div class="p-4 rounded-2xl bg-indigo-brand/10 border border-indigo-brand/30 space-y-2">
                                <h5 class="font-bold text-xs font-mono text-indigo-brand uppercase">10. Memory Anchor / Mnemonic</h5>
                                <p class="text-xs text-warm-ivory font-mono leading-relaxed">
                                    ${fw.memoryTricksOrMnemonics || 'Mnemonic: C-A-R-E (Constraints, Assumptions, Reduction, Execution)'}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            },

            selectNoteTopic(topicId) {
                this.selectedNoteTopicId = topicId;
                this.renderPreparedNotesTab();
            },

            // TAB 4: IMPORTANT QUESTIONS
            renderImportantQuestionsTab() {
                const container = document.getElementById('det-questions-list');
                const countLabel = document.getElementById('questions-count-label');
                const allQuestions = this.activeStudyPack?.importantQuestions || [];

                let filtered = allQuestions;
                if (this.questionFilter === 'Very Important') {
                    filtered = allQuestions.filter(q => q.priority === 'Very Important');
                } else if (this.questionFilter === 'Important') {
                    filtered = allQuestions.filter(q => q.priority === 'Important');
                } else if (this.questionFilter === 'Numerical') {
                    filtered = allQuestions.filter(q => q.marksType === 'Numerical');
                }

                if (countLabel) countLabel.textContent = `${filtered.length} of ${allQuestions.length} Questions Displayed`;

                if (!filtered.length) {
                    container.innerHTML = `<div class="p-4 text-xs text-muted-gray">No questions match this filter.</div>`;
                    return;
                }

                container.innerHTML = filtered.map(q => {
                    const sol = q.solution || {};
                    const isNumerical = q.marksType === 'Numerical';

                    return `
                        <div class="p-5 rounded-2xl bg-elevated border border-subtle space-y-3 hover:border-indigo-brand/50 transition-all">
                            <!-- Question Header & Badges -->
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                        q.priority === 'Very Important' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                        q.priority === 'Important' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                        'bg-teal-brand/20 text-teal-brand border border-teal-brand/30'
                                    }">
                                        ${q.priority}
                                    </span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-midnight text-warm-ivory border border-subtle">
                                        ${q.marksType || '2M'}
                                    </span>
                                    <span class="text-[10px] font-mono text-muted-gray truncate max-w-xs">${q.subject} • ${q.topic}</span>
                                </div>
                                <span class="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-brand/20 text-indigo-brand border border-indigo-brand/30">
                                    POTENTIAL EXAM QUESTION
                                </span>
                            </div>

                            <!-- Question Stem -->
                            <h4 class="font-bold text-sm text-warm-ivory leading-relaxed">${q.questionText}</h4>

                            <!-- View Solution Collapsible Button -->
                            <div class="pt-2">
                                <button onclick="ExamPage.toggleSolution('${q.id}')" class="px-3.5 py-1.5 rounded-xl bg-midnight hover:bg-surface-elevated text-xs font-bold text-teal-brand border border-subtle flex items-center gap-1.5 transition-colors">
                                    <span class="material-symbols-outlined text-sm">visibility</span>
                                    <span id="btn-text-${q.id}">View Solution & Marking Breakdown</span>
                                </button>
                            </div>

                            <!-- Collapsible Solution Box -->
                            <div id="solution-box-${q.id}" class="hidden pt-3 border-t border-subtle/80 space-y-3 text-xs animate-fade-in">
                                
                                <!-- Direct Answer -->
                                <div class="p-3.5 rounded-xl bg-teal-brand/10 border border-teal-brand/30 text-xs">
                                    <span class="font-bold text-teal-brand font-mono block text-[10px] uppercase">Direct Concise Answer:</span>
                                    <p class="font-bold text-warm-ivory mt-0.5">${sol.directAnswer || 'Direct resolution calculated.'}</p>
                                </div>

                                <!-- Key Points / Marking Scheme -->
                                ${(sol.keyPoints && sol.keyPoints.length > 0) ? `
                                    <div class="space-y-1">
                                        <span class="font-bold text-indigo-brand font-mono text-[10px] uppercase">Examiner Marking Criteria & Key Concepts:</span>
                                        <ul class="space-y-1 text-muted-gray list-disc list-inside pl-1">
                                            ${sol.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                <!-- Step-by-Step Numericals / Derivations -->
                                ${(sol.stepByStep && sol.stepByStep.length > 0) ? `
                                    <div class="space-y-1.5">
                                        <span class="font-bold text-rose-gold font-mono text-[10px] uppercase">Step-by-Step Mathematical Calculation:</span>
                                        <div class="space-y-1 bg-midnight p-3 rounded-xl border border-subtle font-mono text-[11px]">
                                            ${sol.stepByStep.map((st, sIdx) => `
                                                <div class="text-muted-gray flex items-start gap-2">
                                                    <span class="text-rose-gold font-bold">${sIdx + 1}.</span>
                                                    <span>${st}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}

                                <!-- Common Mistakes -->
                                ${(sol.commonMistakes && sol.commonMistakes.length > 0) ? `
                                    <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1">
                                        <span class="font-bold text-red-400 font-mono text-[10px] uppercase flex items-center gap-1">
                                            <span class="material-symbols-outlined text-xs">warning</span>
                                            <span>Common Traps to Avoid:</span>
                                        </span>
                                        <ul class="space-y-0.5 text-red-300/90 list-disc list-inside">
                                            ${sol.commonMistakes.map(cm => `<li>${cm}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            },

            filterQuestions(priority) {
                this.questionFilter = priority;
                document.querySelectorAll('.q-filter-btn').forEach(btn => {
                    if (btn.textContent.includes(priority) || (priority === 'all' && btn.textContent === 'All')) {
                        btn.className = 'q-filter-btn active px-2.5 py-1 rounded-lg bg-indigo-brand text-white font-bold';
                    } else {
                        btn.className = 'q-filter-btn px-2.5 py-1 rounded-lg bg-elevated hover:bg-surface-elevated text-muted-gray';
                    }
                });
                this.renderImportantQuestionsTab();
            },

            toggleSolution(qId) {
                const box = document.getElementById(`solution-box-${qId}`);
                const btnText = document.getElementById(`btn-text-${qId}`);
                if (box.classList.contains('hidden')) {
                    box.classList.remove('hidden');
                    btnText.textContent = 'Hide Solution';
                } else {
                    box.classList.add('hidden');
                    btnText.textContent = 'View Solution & Marking Breakdown';
                }
            },

            // TAB 5: DETAILED EXPLANATIONS
            renderDetailedExplanationsTab() {
                const pack = this.activeStudyPack || {};
                
                // Formula Sheet
                const formulaContainer = document.getElementById('det-formula-sheet-container');
                const formulas = pack.formulaSheet || [];
                formulaContainer.innerHTML = formulas.map(f => `
                    <div class="p-3.5 rounded-2xl bg-midnight border border-subtle space-y-2 text-xs font-mono">
                        <div class="flex items-center justify-between text-[10px] text-muted-gray">
                            <span class="text-indigo-brand font-bold">${f.subject}</span>
                            <span>${f.topic}</span>
                        </div>
                        <h5 class="font-bold text-warm-ivory text-xs">${f.name}</h5>
                        <div class="p-2.5 rounded-xl bg-elevated text-teal-brand font-bold text-xs overflow-x-auto border border-subtle">
                            ${f.formula}
                        </div>
                        <div class="text-[10px] text-muted-gray">Variables: ${f.variables}</div>
                        <div class="text-[10px] text-rose-gold/90">Conditions: ${f.conditions}</div>
                    </div>
                `).join('');

                // Definitions
                const defContainer = document.getElementById('det-definitions-container');
                const definitions = pack.importantDefinitions || [];
                defContainer.innerHTML = definitions.map(d => `
                    <div class="p-3.5 rounded-2xl bg-midnight border border-subtle space-y-1.5 text-xs">
                        <div class="flex items-center justify-between">
                            <h5 class="font-bold text-warm-ivory">${d.term}</h5>
                            <span class="text-[10px] font-mono text-indigo-brand">${d.subject}</span>
                        </div>
                        <p class="text-muted-gray leading-relaxed text-[11px]">${d.definition}</p>
                        ${d.formula ? `<div class="font-mono text-[11px] text-teal-brand bg-elevated p-1.5 rounded-lg">${d.formula}</div>` : ''}
                    </div>
                `).join('');

                // Diagrams & Process Flows
                const diagContainer = document.getElementById('det-diagrams-container');
                const diagrams = pack.diagramsAndProcesses || [];
                diagContainer.innerHTML = diagrams.map(diag => `
                    <div class="p-4 rounded-2xl bg-midnight border border-subtle space-y-2.5 text-xs">
                        <div class="flex items-center justify-between">
                            <h5 class="font-bold text-warm-ivory">${diag.title}</h5>
                            <span class="text-[10px] font-mono text-teal-brand">${diag.subject}</span>
                        </div>
                        <div class="space-y-1 font-mono text-[11px]">
                            ${diag.stepFlow.map(sf => `
                                <div class="p-1.5 rounded-lg bg-elevated/80 text-muted-gray border border-subtle">
                                    ${sf}
                                </div>
                            `).join('')}
                        </div>
                        <div class="p-2.5 rounded-xl bg-indigo-brand/10 border border-indigo-brand/30 text-[11px] text-indigo-brand">
                            <strong>Key Architectural Insight:</strong> ${diag.keyInsight}
                        </div>
                    </div>
                `).join('');
            },

            // TAB 6: QUICK REVISION & FLASHCARDS
            renderQuickRevisionTab() {
                this.currentFlashcardIndex = 0;
                this.flashcardFlipped = false;
                this.updateFlashcardUI();

                // 1-Minute Unit Summaries
                const unitsContainer = document.getElementById('det-one-minute-units');
                const units = this.activeStudyPack?.quickRevision?.oneMinuteUnits || [];
                unitsContainer.innerHTML = units.map(u => `
                    <div class="p-4 rounded-2xl bg-midnight border border-subtle space-y-2">
                        <div class="flex items-center justify-between text-xs">
                            <h5 class="font-bold text-warm-ivory">${u.subject}</h5>
                            <span class="text-[9px] font-mono px-2 py-0.2 rounded bg-amber-500/20 text-amber-400">1-MIN SCAN</span>
                        </div>
                        <p class="text-[11px] text-muted-gray leading-relaxed">${u.summary}</p>
                        <ul class="space-y-1 text-[11px] text-warm-ivory list-disc list-inside pl-1">
                            ${(u.keyTakeaways || []).map(kt => `<li>${kt}</li>`).join('')}
                        </ul>
                        ${u.formulaHighlight ? `
                            <div class="mt-2 p-1.5 rounded bg-elevated text-teal-brand font-mono text-[10px]">
                                ⚡ ${u.formulaHighlight}
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            },

            updateFlashcardUI() {
                const flashcards = this.activeStudyPack?.quickRevision?.flashcards || [];
                if (!flashcards.length) return;

                const card = flashcards[this.currentFlashcardIndex % flashcards.length];
                document.getElementById('fc-topic-label').textContent = card.topic || 'Curriculum Concept';
                document.getElementById('fc-counter-label').textContent = `Card ${(this.currentFlashcardIndex % flashcards.length) + 1} of ${flashcards.length}`;

                const textField = document.getElementById('flashcard-text');
                const hintField = document.getElementById('flashcard-hint');
                const face = document.getElementById('flashcard-face');

                if (this.flashcardFlipped) {
                    textField.textContent = card.back;
                    hintField.textContent = 'Showing Answer • Click to view prompt';
                    face.classList.add('border-teal-brand');
                    face.classList.remove('border-indigo-brand/40');
                } else {
                    textField.textContent = card.front;
                    hintField.textContent = 'Showing Prompt • Click to reveal solution';
                    face.classList.add('border-indigo-brand/40');
                    face.classList.remove('border-teal-brand');
                }
            },

            flipFlashcard() {
                this.flashcardFlipped = !this.flashcardFlipped;
                this.updateFlashcardUI();
            },

            nextFlashcard() {
                const flashcards = this.activeStudyPack?.quickRevision?.flashcards || [];
                if (!flashcards.length) return;
                this.currentFlashcardIndex = (this.currentFlashcardIndex + 1) % flashcards.length;
                this.flashcardFlipped = false;
                this.updateFlashcardUI();
            },

            prevFlashcard() {
                const flashcards = this.activeStudyPack?.quickRevision?.flashcards || [];
                if (!flashcards.length) return;
                this.currentFlashcardIndex = (this.currentFlashcardIndex - 1 + flashcards.length) % flashcards.length;
                this.flashcardFlipped = false;
                this.updateFlashcardUI();
            },

            // TAB 7: PRACTICE QUESTIONS (INTERACTIVE MCQS)
            renderPracticeQuestions() {
                const container = document.getElementById('quiz-questions-container');
                const questions = this.activeStudyPack?.practiceQuestions || [];

                if (!questions.length) {
                    container.innerHTML = `<div class="p-4 text-xs text-muted-gray">No interactive questions available.</div>`;
                    return;
                }

                // Update score
                const attempts = Object.values(this.practiceAttempts);
                const totalAtt = attempts.length;
                const correctAtt = attempts.filter(a => a.isCorrect).length;
                const accuracy = totalAtt > 0 ? Math.round((correctAtt / totalAtt) * 100) : 0;

                const scoreDisplay = document.getElementById('quiz-score-display');
                const accDisplay = document.getElementById('quiz-accuracy-display');
                const tabScoreBadge = document.getElementById('tab-score-badge');

                if (scoreDisplay) scoreDisplay.textContent = `${correctAtt} / ${totalAtt}`;
                if (accDisplay) accDisplay.textContent = `${accuracy}%`;
                if (tabScoreBadge) {
                    tabScoreBadge.textContent = `${accuracy}%`;
                    tabScoreBadge.classList.toggle('hidden', totalAtt === 0);
                }

                // Check for weak topic detection
                const weakBanner = document.getElementById('quiz-weak-topic-banner');
                const weakText = document.getElementById('quiz-weak-topic-text');
                if (totalAtt >= 2 && accuracy < 60) {
                    weakBanner.classList.remove('hidden');
                    weakText.textContent = `Practice diagnostic: Score is ${accuracy}%. Topic flagged as Weak. Spend 30 minutes reading the 10-Point Prepared Notes!`;
                } else if (weakBanner) {
                    weakBanner.classList.add('hidden');
                }

                container.innerHTML = questions.map((q, qIdx) => {
                    const attempt = this.practiceAttempts[qIdx];
                    const isAnswered = Boolean(attempt);

                    return `
                        <div class="p-5 rounded-2xl bg-elevated border border-subtle space-y-3">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-mono text-indigo-brand font-bold text-[10px]">QUESTION ${qIdx + 1} OF ${questions.length} • ${q.subject}</span>
                                <span class="text-[10px] font-mono px-2 py-0.2 rounded bg-midnight text-muted-gray border border-subtle">${q.difficulty}</span>
                            </div>
                            <h4 class="font-bold text-sm text-warm-ivory leading-relaxed">${q.question}</h4>

                            <!-- Options List -->
                            <div class="space-y-2">
                                ${(q.options || []).map((opt, oIdx) => {
                                    let btnStyle = 'bg-midnight border-subtle text-warm-ivory hover:border-indigo-brand/60';
                                    let icon = '';

                                    if (isAnswered) {
                                        if (oIdx === q.correctIndex) {
                                            btnStyle = 'bg-teal-brand/20 border-teal-brand text-teal-brand font-bold';
                                            icon = '<span class="material-symbols-outlined text-sm text-teal-brand shrink-0">check_circle</span>';
                                        } else if (attempt.selectedOption === oIdx) {
                                            btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                                            icon = '<span class="material-symbols-outlined text-sm text-red-400 shrink-0">cancel</span>';
                                        } else {
                                            btnStyle = 'bg-midnight/50 border-subtle/50 text-muted-gray opacity-50';
                                        }
                                    }

                                    return `
                                        <button 
                                            onclick="ExamPage.submitPracticeAnswer(${qIdx}, ${oIdx})" 
                                            ${isAnswered ? 'disabled' : ''}
                                            class="w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${btnStyle}"
                                        >
                                            <span class="leading-relaxed">${String.fromCharCode(65 + oIdx)}. ${opt}</span>
                                            ${icon}
                                        </button>
                                    `;
                                }).join('')}
                            </div>

                            <!-- Explanation revealed after answer -->
                            ${isAnswered ? `
                                <div class="p-3.5 rounded-xl ${attempt.isCorrect ? 'bg-teal-brand/10 border border-teal-brand/30' : 'bg-amber-500/10 border border-amber-500/30'} space-y-1 text-xs animate-fade-in">
                                    <div class="font-bold font-mono text-[10px] ${attempt.isCorrect ? 'text-teal-brand' : 'text-amber-400'} uppercase">
                                        ${attempt.isCorrect ? 'Correct Answer!' : 'Conceptual Explanation:'}
                                    </div>
                                    <p class="text-warm-ivory text-[11px] leading-relaxed">${q.explanation}</p>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            },

            async submitPracticeAnswer(qIdx, optionIdx) {
                const questions = this.activeStudyPack?.practiceQuestions || [];
                const q = questions[qIdx];
                if (!q || this.practiceAttempts[qIdx]) return;

                const isCorrect = optionIdx === q.correctIndex;
                this.practiceAttempts[qIdx] = {
                    selectedOption: optionIdx,
                    isCorrect
                };

                // Record practice to backend
                if (this.activeExam) {
                    await DB.recordPracticeAttempt(this.activeExam.id, {
                        questionId: q.id,
                        topic: q.topic,
                        isCorrect,
                        userAnswer: q.options[optionIdx]
                    });
                }

                this.renderPracticeQuestions();
            },

            // TAB 8: EXAM STRATEGY
            renderExamStrategyTab() {
                const exam = this.activeExam;
                const phasesContainer = document.getElementById('det-phases-container');
                const dailyContainer = document.getElementById('det-daily-schedule-container');
                const masteryContainer = document.getElementById('det-mastery-matrix');

                // Phases
                const phases = exam.studyPlan?.phases || [
                    { phaseNumber: 1, title: 'Phase 1: Foundation', targetWeeks: 'Weeks 1-4', focus: 'Fundamental principles and syllabus survey' },
                    { phaseNumber: 2, title: 'Phase 2: Core Topic Mastery', targetWeeks: 'Weeks 5-10', focus: 'Standard problems and derivations' }
                ];
                phasesContainer.innerHTML = phases.map(p => `
                    <div class="p-3 rounded-xl bg-midnight border border-subtle">
                        <div class="flex items-center justify-between text-xs font-bold text-warm-ivory">
                            <span>${p.title}</span>
                            <span class="font-mono text-teal-brand text-[10px]">${p.targetWeeks || ''}</span>
                        </div>
                        <p class="text-[11px] text-muted-gray mt-1">${p.focus || ''}</p>
                    </div>
                `).join('');

                // Daily Allocation
                const schedule = exam.studyPlan?.dailySchedule || [
                    { timeBlock: 'Block 1 (45 mins)', focus: 'Weak Area Deep Dive', activity: 'Concept mastery and solved examples' },
                    { timeBlock: 'Block 2 (45 mins)', focus: 'Core Practice', activity: 'Problem sets' },
                    { timeBlock: 'Block 3 (30 mins)', focus: 'Active Recall', activity: 'Formula flashcards' }
                ];
                dailyContainer.innerHTML = schedule.map(s => `
                    <div class="p-3 rounded-xl bg-midnight border border-subtle">
                        <div class="font-bold text-xs text-rose-gold">${s.timeBlock}: ${s.focus}</div>
                        <p class="text-[11px] text-muted-gray mt-0.5">${s.activity}</p>
                    </div>
                `).join('');

                // Mastery Matrix
                const weakSubs = exam.weakSubjects && exam.weakSubjects.length > 0 ? exam.weakSubjects : ['DBMS Normalization'];
                const strongSubs = exam.strongSubjects && exam.strongSubjects.length > 0 ? exam.strongSubjects : ['Data Structures'];

                masteryContainer.innerHTML = `
                    <div class="p-3 rounded-xl bg-midnight border border-rose-gold/30 space-y-1.5">
                        <span class="font-mono text-[10px] uppercase font-bold text-rose-gold block">⚠️ Flagged Weak Topics</span>
                        <ul class="space-y-1 text-xs text-warm-ivory list-disc list-inside">
                            ${weakSubs.map(w => `<li><strong>${w}</strong> (Allocated 45m daily study blocks)</li>`).join('')}
                        </ul>
                    </div>
                    <div class="p-3 rounded-xl bg-midnight border border-teal-brand/30 space-y-1.5">
                        <span class="font-mono text-[10px] uppercase font-bold text-teal-brand block">✅ Strong Foundations</span>
                        <ul class="space-y-1 text-xs text-warm-ivory list-disc list-inside">
                            ${strongSubs.map(s => `<li><strong>${s}</strong> (Revision via mock questions)</li>`).join('')}
                        </ul>
                    </div>
                `;
            },

            // TAB 9: ORIGINAL PDF
            renderOriginalPdfTab() {
                const exam = this.activeExam;
                const doc = exam.document || {};

                document.getElementById('doc-meta-name').textContent = doc.fileName || 'Uploaded_Syllabus.pdf';
                document.getElementById('doc-meta-size').textContent = doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '428 KB';
                document.getElementById('doc-meta-pages').textContent = `${doc.pageCount || 1} Pages`;
                document.getElementById('doc-meta-version').textContent = `Version ${doc.version || 1} (Official)`;

                const previewArea = document.getElementById('doc-extracted-text-preview');
                const sampleText = doc.extractedTextSummary || `Official examination notification text stream extracted successfully.\nSyllabus Sections:\n- Unit 1: Discrete Mathematics & Engineering Mathematics\n- Unit 2: Data Structures & Algorithms\n- Unit 3: Operating Systems Architecture & Virtual Memory\n- Unit 4: Database Management Systems & Relational Normalization\n\nBoundary guidelines and negative marking protocols enforced.`;
                previewArea.value = sampleText;
            },

            copyExtractedText() {
                const text = document.getElementById('doc-extracted-text-preview').value;
                navigator.clipboard.writeText(text);
                AuthManager.showToast('Extracted text copied to clipboard!', 'success');
            },

            async updateTopicStatus(examId, topicId, status) {
                await DB.updateExamTopicProgress(examId, topicId, status);
                this.renderExams();
                AuthManager.showToast('Topic status updated!', 'success');
            },

            // PDF FILE SELECTION & CONVERSION
            handlePdfSelected(e) {
                const file = e.target.files[0];
                if (!file) return;

                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    AuthManager.showToast('Please select a valid PDF file.', 'warning');
                    return;
                }

                if (file.size > 25 * 1024 * 1024) {
                    AuthManager.showToast('File size exceeds 25MB limit.', 'warning');
                    return;
                }

                this.selectedFile = file;
                const reader = new FileReader();
                reader.onload = () => {
                    this.selectedFileBase64 = reader.result;
                    document.getElementById('dropzone-empty-state').classList.add('hidden');
                    const selBox = document.getElementById('dropzone-file-selected');
                    selBox.classList.remove('hidden');
                    document.getElementById('selected-file-name').textContent = file.name;
                    document.getElementById('selected-file-size').textContent = `${(file.size / 1024).toFixed(1)} KB • Ready for extraction`;
                };
                reader.readAsDataURL(file);
            },

            clearSelectedPdf(e) {
                if (e) e.stopPropagation();
                this.selectedFile = null;
                this.selectedFileBase64 = null;
                document.getElementById('pdf-file-input').value = '';
                document.getElementById('dropzone-file-selected').classList.add('hidden');
                document.getElementById('dropzone-empty-state').classList.remove('hidden');
            },

            toggleManualSyllabus() {
                const box = document.getElementById('manual-syllabus-box');
                const txt = document.getElementById('toggle-manual-text');
                if (box.classList.contains('hidden')) {
                    box.classList.remove('hidden');
                    txt.textContent = 'Upload PDF instead';
                } else {
                    box.classList.add('hidden');
                    txt.textContent = 'Skip for now (Manual entry)';
                }
            },

            openAddExamModal() {
                document.getElementById('add-exam-modal').classList.remove('hidden');
            },

            closeAddExamModal() {
                document.getElementById('add-exam-modal').classList.add('hidden');
                this.clearSelectedPdf();
            },

            // SUBMIT EXAM & ANALYZE PDF WITH 7-STEP TIMELINE
            async submitExamForm(e) {
                e.preventDefault();
                const name = document.getElementById('exam-input-name').value.trim();
                const category = document.getElementById('exam-input-type').value;
                const date = document.getElementById('exam-input-date').value;
                const dailyMinutes = parseInt(document.getElementById('exam-input-daily-hours').value, 10);
                const prepLevel = document.getElementById('exam-input-prep-level').value;
                const strong = document.getElementById('exam-input-strong').value.trim();
                const weak = document.getElementById('exam-input-weak').value.trim();
                const manual = document.getElementById('exam-input-manual-syllabus').value.trim();

                const pipeline = document.getElementById('upload-pipeline-card');
                const pipeStatus = document.getElementById('pipeline-status-text');
                const pipePercent = document.getElementById('pipeline-percent-text');
                const pipeBar = document.getElementById('pipeline-progress-bar');
                const submitBtn = document.getElementById('btn-submit-exam');

                pipeline.classList.remove('hidden');
                submitBtn.disabled = true;

                // Step 1: Uploading & Decompressing
                pipeStatus.textContent = '1/7 Extracting PDF Text Streams...';
                pipePercent.textContent = '20%';
                pipeBar.style.width = '20%';

                try {
                    // Step 2: AI Document Analysis
                    setTimeout(() => {
                        pipeStatus.textContent = '2/7 AI Document Analysis & Official Syllabus Extraction...';
                        pipePercent.textContent = '45%';
                        pipeBar.style.width = '45%';
                    }, 400);

                    // Step 3: 10-Point Notes & Formulas
                    setTimeout(() => {
                        pipeStatus.textContent = '3/7 Generating 10-Point Notes & Formula Sheet...';
                        pipePercent.textContent = '70%';
                        pipeBar.style.width = '70%';
                    }, 900);

                    // Step 4: Questions & Plan
                    setTimeout(() => {
                        pipeStatus.textContent = '4/7 Assembling Exam Questions & Weak Subject Strategy...';
                        pipePercent.textContent = '90%';
                        pipeBar.style.width = '90%';
                    }, 1400);

                    const payload = {
                        examName: name,
                        examCategory: category,
                        targetDate: date,
                        dailyStudyMinutes: dailyMinutes,
                        prepLevel: prepLevel,
                        strongSubjects: strong,
                        weakSubjects: weak,
                        fileName: this.selectedFile ? this.selectedFile.name : 'Manual_Syllabus.txt',
                        fileSize: this.selectedFile ? this.selectedFile.size : 0,
                        fileBase64: this.selectedFileBase64,
                        manualSyllabusText: manual,
                        userEmail: DB.getCurrentUserEmail()
                    };

                    const result = await DB.analyzePdfAndCreateExam(payload);

                    pipeStatus.textContent = 'PDF ANALYZED SUCCESSFULLY!';
                    pipePercent.textContent = '100%';
                    pipeBar.style.width = '100%';

                    setTimeout(() => {
                        pipeline.classList.add('hidden');
                        submitBtn.disabled = false;
                        this.closeAddExamModal();
                        this.renderExams();
                        this.generateSmartSchedule();
                        AuthManager.showToast(`PDF Analyzed Successfully! Notes and Questions ready for ${name}!`, 'success');

                        // Automatically open the 9-tab suite for the newly added exam!
                        if (result.exam && result.exam.id) {
                            this.openExamDetail(result.exam.id, 'overview');
                        }
                    }, 500);

                } catch (err) {
                    pipeline.classList.add('hidden');
                    submitBtn.disabled = false;
                    AuthManager.showToast(err.message || 'PDF extraction failed. Please try a text-based PDF.', 'error');
                }
            },

            // PRACTICE & MOCK TEST LOGIC
            async openMockForExam(examId) {
                this.openExamDetail(examId, 'practice-questions');
            },

            closeMockTestModal() {
                document.getElementById('mock-test-modal').classList.add('hidden');
            },

            // REPLACE PDF MODAL
            openReplacePdfModal() {
                document.getElementById('replace-pdf-modal').classList.remove('hidden');
            },

            closeReplacePdfModal() {
                document.getElementById('replace-pdf-modal').classList.add('hidden');
            },

            async submitReplacePdf() {
                const input = document.getElementById('replace-file-input');
                const file = input.files[0];
                if (!file || !this.activeExam) {
                    AuthManager.showToast('Please select a PDF file.', 'warning');
                    return;
                }

                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const result = await DB.replaceExamPdf(this.activeExam.id, {
                            fileName: file.name,
                            fileSize: file.size,
                            fileBase64: reader.result
                        });
                        this.closeReplacePdfModal();
                        this.openExamDetail(this.activeExam.id, 'overview');
                        this.renderExams();
                        AuthManager.showToast(`Updated to version ${result.diff?.newVersion || 2}! Change detection complete.`, 'success');
                    } catch (e) {
                        AuthManager.showToast(e.message, 'error');
                    }
                };
                reader.readAsDataURL(file);
            },

            generateSmartSchedule() {
                const exams = DB.getExams();
                const container = document.getElementById('smart-schedule-container');
                if (!container) return;

                if (!exams.length) {
                    container.innerHTML = `<div class="col-span-3 text-xs text-muted-gray py-4">Schedule exams to view personalized revision recommendations.</div>`;
                    return;
                }

                const pendingTopics = [];
                exams.forEach(e => {
                    (e.subjects || []).forEach(s => {
                        (s.topics || []).forEach(t => {
                            if (t.status === 'Needs Revision' || t.status === 'Learning' || t.status === 'Practicing') {
                                pendingTopics.push({
                                    examId: e.id,
                                    exam: e.name,
                                    subject: s.name,
                                    topic: t.name,
                                    status: t.status
                                });
                            }
                        });
                    });
                });

                if (!pendingTopics.length) {
                    container.innerHTML = `
                        <div class="col-span-3 p-4 rounded-2xl bg-teal-brand/10 border border-teal-brand/30 text-teal-brand text-xs font-semibold">
                            🎉 100% of extracted official topics across your scheduled examinations are marked Completed!
                        </div>
                    `;
                    return;
                }

                container.innerHTML = pendingTopics.slice(0, 3).map((item, idx) => `
                    <div class="p-4 rounded-2xl bg-elevated border border-subtle space-y-2">
                        <div class="flex items-center justify-between text-[10px] font-mono text-muted-gray">
                            <span>PHASE ${idx + 1} HIGH-YIELD TARGET</span>
                            <span class="${item.status === 'Needs Revision' ? 'text-amber-400 font-bold' : 'text-indigo-brand'}">${item.status}</span>
                        </div>
                        <h4 class="font-bold text-sm text-warm-ivory truncate">${item.topic}</h4>
                        <div class="text-xs text-muted-gray truncate">${item.subject} (${item.exam})</div>
                        <button onclick="ExamPage.openExamDetail('${item.examId}', 'prepared-notes')" class="w-full mt-2 py-1.5 rounded-lg bg-midnight hover:bg-surface-elevated border border-subtle text-xs font-semibold text-teal-brand flex items-center justify-center gap-1 transition-colors">
                            <span class="material-symbols-outlined text-xs">timer</span>
                            <span>Review 10-Point Notes</span>
                        </button>
                    </div>
                `).join('');
            },

            deleteExam(examId) {
                App.confirm(
                    'Delete Examination',
                    'Are you sure you want to remove this examination and its extracted syllabus from your tracker?',
                    async () => {
                        await DB.deleteExam(examId);
                        await this.refreshExams();
                        AuthManager.showToast('Exam deleted.', 'info');
                    }
                );
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            ExamPage.init();
        });
    
