/**
 * TechPath — Centralized SEO & Social Metadata Engine
 * Single Source of Truth for Page Titles, Descriptions, Open Graph, Twitter Cards, and Indexing Directives.
 */

const CANONICAL_ORIGIN = 'https://btechpath.ai';
const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/assets/branding/techpath-og.png`;
const SITE_NAME = 'TechPath';

const PAGE_METADATA = {
    // -------------------------------------------------------------------------
    // 1. PUBLIC INDEXABLE PAGES (index, follow)
    // -------------------------------------------------------------------------
    home: {
        path: '/',
        fileName: 'index.html',
        title: 'TechPath — Learn. Build. Prepare. Grow.',
        description: 'TechPath helps engineering students learn, build projects, prepare for exams and interviews, develop job-ready skills, and plan their career journey with AI.',
        canonical: `${CANONICAL_ORIGIN}/`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'TechPath — Learn. Build. Prepare. Grow.',
        ogDescription: 'A unified engineering student platform connecting live study tracking, adaptive skill roadmaps, syllabus exam countdowns, project generation, and mock interview coaching.',
        ogImage: DEFAULT_OG_IMAGE
    },
    'start-journey': {
        path: '/start-journey.html',
        fileName: 'start-journey.html',
        title: 'Start Your Journey | TechPath',
        description: 'Begin your personalized engineering journey with guided onboarding, university curriculum alignment, and customized skill pathways.',
        canonical: `${CANONICAL_ORIGIN}/start-journey`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Start Your Engineering Journey | TechPath',
        ogDescription: 'Configure your degree, branch, semester, and career goals to receive tailored study roadmaps and AI guidance.',
        ogImage: DEFAULT_OG_IMAGE
    },
    reviews: {
        path: '/reviews.html',
        fileName: 'reviews.html',
        title: 'Reviews — Student Feedback | TechPath',
        description: 'Read genuine student feedback about TechPath and share your own experience across study tracking, mock interviews, and career roadmaps.',
        canonical: `${CANONICAL_ORIGIN}/reviews`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Student Reviews & Testimonials | TechPath',
        ogDescription: 'Verified ratings, reviews, and learning outcomes shared by engineering students across universities and disciplines.',
        ogImage: DEFAULT_OG_IMAGE
    },
    career: {
        path: '/career.html',
        fileName: 'career.html',
        title: 'Career — Explore Engineering Career Paths | TechPath',
        description: 'Explore engineering career paths, roles, skills, and preparation guidance personalized to your goals.',
        canonical: `${CANONICAL_ORIGIN}/career`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Engineering Career Explorer & Placement Paths | TechPath',
        ogDescription: 'Discover target salaries, required competencies, interview formats, and market hiring demand across 50+ engineering disciplines.',
        ogImage: DEFAULT_OG_IMAGE
    },
    internships: {
        path: '/internships.html',
        fileName: 'internships.html',
        title: 'Internships — Explore Opportunities & Guidance | TechPath',
        description: 'Explore internship guidance and opportunities relevant to your engineering background.',
        canonical: `${CANONICAL_ORIGIN}/internships`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Engineering Internships & Application Guidance | TechPath',
        ogDescription: 'Find vetted summer internships, research fellowships, and industrial training opportunities for engineering undergraduates.',
        ogImage: DEFAULT_OG_IMAGE
    },
    faqs: {
        path: '/faqs.html',
        fileName: 'faqs.html',
        title: 'FAQs — Frequently Asked Questions | TechPath',
        description: 'Find answers about TechPath, accounts, AI Notes, LearnHub, mock interviews, coding, projects, careers, and more.',
        canonical: `${CANONICAL_ORIGIN}/faqs`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Frequently Asked Questions & Support | TechPath',
        ogDescription: 'Get instant answers to common questions about platform features, AI accuracy, security, and university integrations.',
        ogImage: DEFAULT_OG_IMAGE
    },
    contact: {
        path: '/contact.html',
        fileName: 'contact.html',
        title: 'Contact Us | TechPath',
        description: 'Contact TechPath for support, technical issues, questions, feedback, and assistance.',
        canonical: `${CANONICAL_ORIGIN}/contact`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Contact Us & Student Support | TechPath',
        ogDescription: 'Reach our engineering education team for assistance, feature inquiries, feedback, or academic collaborations.',
        ogImage: DEFAULT_OG_IMAGE
    },
    privacy: {
        path: '/privacy-policy.html',
        fileName: 'privacy-policy.html',
        title: 'Privacy Policy | TechPath',
        description: 'Read the TechPath Privacy Policy and learn how account, profile, document, and learning data is handled.',
        canonical: `${CANONICAL_ORIGIN}/privacy-policy`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Privacy Policy | TechPath',
        ogDescription: 'Transparent data privacy commitments: how TechPath secures your academic data, uploaded documents, and personal profile.',
        ogImage: DEFAULT_OG_IMAGE
    },
    terms: {
        path: '/terms.html',
        fileName: 'terms.html',
        title: 'Terms of Use | TechPath',
        description: 'Read the TechPath Terms of Use covering accounts, AI-generated content, user responsibilities, and platform usage.',
        canonical: `${CANONICAL_ORIGIN}/terms`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Terms of Use | TechPath',
        ogDescription: 'Platform terms, educational disclaimers, code of conduct, and acceptable use policies for TechPath.',
        ogImage: DEFAULT_OG_IMAGE
    },
    cookie: {
        path: '/cookie-policy.html',
        fileName: 'cookie-policy.html',
        title: 'Cookie Policy | TechPath',
        description: 'Learn how cookies and secure local storage are utilized to personalize your engineering study session on TechPath.',
        canonical: `${CANONICAL_ORIGIN}/cookie-policy`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Cookie Policy | TechPath',
        ogDescription: 'Information on authentication tokens, preferences persistence, and privacy-respecting cookies.',
        ogImage: DEFAULT_OG_IMAGE
    },
    disclaimer: {
        path: '/disclaimer.html',
        fileName: 'disclaimer.html',
        title: 'Disclaimers & AI Governance | TechPath',
        description: 'Official AI, Educational, Career, and Third-Party content disclaimers for TechPath. Understand AI limitations and independent verification standards.',
        canonical: `${CANONICAL_ORIGIN}/disclaimer`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Disclaimers & AI Governance | TechPath',
        ogDescription: 'Official AI disclaimers, educational outcomes, career guidance, and third-party content policies.',
        ogImage: DEFAULT_OG_IMAGE
    },
    copyright: {
        path: '/copyright-policy.html',
        fileName: 'copyright-policy.html',
        title: 'Copyright & Content Policy | TechPath',
        description: 'TechPath copyright policy, uploaded PDF terms, Indian Copyright Act fair dealing provisions, and DMCA notice & takedown procedures.',
        canonical: `${CANONICAL_ORIGIN}/copyright-policy`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Copyright & Content Policy | TechPath',
        ogDescription: 'Uploaded PDF terms, Indian Copyright Act fair dealing provisions, and DMCA notice & takedown procedures.',
        ogImage: DEFAULT_OG_IMAGE
    },
    grievance: {
        path: '/grievance.html',
        fileName: 'grievance.html',
        title: 'Grievance Redressal Mechanism | TechPath',
        description: 'Statutory Grievance Redressal Mechanism under the IT Rules, 2021 and DPDP Act, 2023 for TechPath users. Contact our Grievance Officer.',
        canonical: `${CANONICAL_ORIGIN}/grievance`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Grievance Redressal Mechanism | TechPath',
        ogDescription: 'Official grievance contact and redressal mechanism under IT Rules and DPDP Act.',
        ogImage: DEFAULT_OG_IMAGE
    },
    security: {
        path: '/security.html',
        fileName: 'security.html',
        title: 'Platform Security & Data Protection | TechPath',
        description: 'Explore TechPath\'s multi-layered security architecture, Supabase RLS policies, zero client API key exposure, and responsible vulnerability disclosure.',
        canonical: `${CANONICAL_ORIGIN}/security`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'Platform Security & Data Protection | TechPath',
        ogDescription: 'Technical security architecture, data isolation, and encryption practices.',
        ogImage: DEFAULT_OG_IMAGE
    },
    legalPrint: {
        path: '/legal-print.html',
        fileName: 'legal-print.html',
        title: 'Master Legal & Compliance Framework | TechPath',
        description: 'Printable Master Legal & Compliance Charter covering all 14 statutory policies, DPDP Act 2023, and IT Rules 2021.',
        canonical: `${CANONICAL_ORIGIN}/legal-print`,
        robots: 'noindex, nofollow',
        ogType: 'website',
        ogTitle: 'Master Legal Compliance Framework | TechPath',
        ogDescription: 'Consolidated statutory policies and legal compliance documentation.',
        ogImage: DEFAULT_OG_IMAGE
    },
    'government-exams': {
        path: '/government-exams.html',
        fileName: 'government-exams.html',
        title: 'Government Exams — GATE, ESE & PSU Tracker | TechPath',
        description: 'Track GATE, ESE, and public sector engineering entrance exams with syllabus roadmaps, countdowns, and study notes.',
        canonical: `${CANONICAL_ORIGIN}/government-exams`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'GATE & PSU Government Exam Preparation Tracker | TechPath',
        ogDescription: 'High-yield exam strategy, weightage analysis, and previous year syllabus tracking for Indian engineering competitive exams.',
        ogImage: DEFAULT_OG_IMAGE
    },
    'international-exams': {
        path: '/international-exams.html',
        fileName: 'international-exams.html',
        title: 'International Higher Studies — GRE, TOEFL & IELTS Tracker | TechPath',
        description: 'Plan your higher education journey abroad with syllabus guides and preparation timelines for GRE, TOEFL, and IELTS.',
        canonical: `${CANONICAL_ORIGIN}/international-exams`,
        robots: 'index, follow',
        ogType: 'website',
        ogTitle: 'GRE, TOEFL & IELTS Higher Education Tracker | TechPath',
        ogDescription: 'Preparation roadmaps, score targets, and document checklists for engineering graduate admissions abroad.',
        ogImage: DEFAULT_OG_IMAGE
    },

    // -------------------------------------------------------------------------
    // 2. AUTHENTICATED STUDENT WORKSPACES (noindex, nofollow for privacy)
    // -------------------------------------------------------------------------
    dashboard: {
        path: '/dashboard.html',
        fileName: 'dashboard.html',
        title: 'Student Dashboard | TechPath',
        description: 'Access your unified engineering dashboard with active study sessions, upcoming exam countdowns, and skill progress.',
        robots: 'noindex, nofollow'
    },
    learn: {
        path: '/learn.html',
        fileName: 'learn.html',
        title: 'LearnHub — Personalized Engineering Learning | TechPath',
        description: 'Explore personalized engineering videos and learning resources based on your department and semester.',
        robots: 'noindex, nofollow'
    },
    'ai-notes': {
        path: '/ai-notes.html',
        fileName: 'ai-notes.html',
        title: 'AI Notes — Turn PDFs Into Detailed Study Notes | TechPath',
        description: 'Upload study PDFs and turn them into detailed, structured notes, explanations, questions, and revision material with AI.',
        robots: 'noindex, nofollow'
    },
    'doubt-solver': {
        path: '/doubt-solver.html',
        fileName: 'doubt-solver.html',
        title: 'AI Doubt Solver — Get Step-by-Step Explanations | TechPath',
        description: 'Get step-by-step explanations for engineering questions, images, diagrams, coding problems, and study doubts.',
        robots: 'noindex, nofollow'
    },
    'mock-interview': {
        path: '/mock-interview.html',
        fileName: 'mock-interview.html',
        title: 'AI Mock Interview — Practice With Your Resume | TechPath',
        description: 'Practice personalized mock interviews using your resume, skills, projects, and target role.',
        robots: 'noindex, nofollow'
    },
    ide: {
        path: '/ide.html',
        fileName: 'ide.html',
        title: 'Coding IDE — Write, Run & Debug Code | TechPath',
        description: 'Write, check, run, debug, and understand code in the TechPath coding environment.',
        robots: 'noindex, nofollow'
    },
    projects: {
        path: '/projects.html',
        fileName: 'projects.html',
        title: 'Project Hub — Build Real Engineering Projects | TechPath',
        description: 'Find department- and skill-appropriate engineering project ideas with detailed implementation guidance.',
        robots: 'noindex, nofollow'
    },
    skills: {
        path: '/skills.html',
        fileName: 'skills.html',
        title: 'Skill Hub — Build Job-Ready Skills | TechPath',
        description: 'Discover the skills required for engineering roles and build a personalized learning path.',
        robots: 'noindex, nofollow'
    },
    study: {
        path: '/study.html',
        fileName: 'study.html',
        title: 'Study Tracker & Focus Sessions | TechPath',
        description: 'Track your daily study streaks, log focus sessions, and maintain consistent academic momentum.',
        robots: 'noindex, nofollow'
    },
    exams: {
        path: '/exams.html',
        fileName: 'exams.html',
        title: 'Exam Tracker — Plan and Prepare Smarter | TechPath',
        description: 'Organize your exam preparation, study materials, notes, revision, and practice in one place.',
        robots: 'noindex, nofollow'
    },
    planner: {
        path: '/planner.html',
        fileName: 'planner.html',
        title: 'Academic Planner & Timetables | TechPath',
        description: 'Organize semester deadlines, lab schedules, exam dates, and daily study routines with AI assistance.',
        robots: 'noindex, nofollow'
    },
    flashcards: {
        path: '/flashcards.html',
        fileName: 'flashcards.html',
        title: 'Flashcards — 3D Active Recall Simulator | TechPath',
        description: 'Master engineering formulas, equations, and definitions using 3D interactive flashcards with spaced repetition.',
        robots: 'noindex, nofollow'
    },
    quiz: {
        path: '/quiz.html',
        fileName: 'quiz.html',
        title: 'AI Quiz Engine — Adaptive Knowledge Checkpoints | TechPath',
        description: 'Take syllabus-grounded quizzes with real-time scoring, instant explanations, and weak concept diagnosis.',
        robots: 'noindex, nofollow'
    },
    'resume-builder': {
        path: '/resume-builder.html',
        fileName: 'resume-builder.html',
        title: 'Resume Builder — Create Your Professional Resume | TechPath',
        description: 'Build a professional, truthful resume for internships, placements, technical roles, and academic opportunities.',
        robots: 'noindex, nofollow'
    },
    roadmap: {
        path: '/roadmap.html',
        fileName: 'roadmap.html',
        title: 'Engineering Progression Roadmap | TechPath',
        description: 'Visual four-year academic and technical progression path from freshman fundamentals to final-year placements.',
        robots: 'noindex, nofollow'
    },
    copilot: {
        path: '/copilot.html',
        fileName: 'copilot.html',
        title: 'Engineering Copilot — AI Study Companion | TechPath',
        description: 'Context-aware study companion helping you navigate complex coursework, research papers, and technical labs.',
        robots: 'noindex, nofollow'
    },
    profile: {
        path: '/profile.html',
        fileName: 'profile.html',
        title: 'My Profile | TechPath',
        description: 'Manage your academic degree, university regulation, department, semester, and personal learning preferences.',
        robots: 'noindex, nofollow'
    },
    settings: {
        path: '/settings.html',
        fileName: 'settings.html',
        title: 'Settings | TechPath',
        description: 'Manage your account security, notification preferences, display options, and connected cloud integrations.',
        robots: 'noindex, nofollow'
    },
    analytics: {
        path: '/analytics.html',
        fileName: 'analytics.html',
        title: 'Learning Analytics & Mastery Metrics | TechPath',
        description: 'View deep performance metrics, diagnostic skill distributions, and longitudinal academic retention trends.',
        robots: 'noindex, nofollow'
    },
    admin: {
        path: '/admin.html',
        fileName: 'admin.html',
        title: 'Admin Console | TechPath',
        description: 'Administrative management console for TechPath curriculum and verified educational content.',
        robots: 'noindex, nofollow'
    },

    // -------------------------------------------------------------------------
    // 3. AUTH & UTILITY PAGES
    // -------------------------------------------------------------------------
    login: {
        path: '/login.html',
        fileName: 'login.html',
        title: 'Sign In | TechPath',
        description: 'Sign in to TechPath to continue your personalized engineering learning and career journey.',
        robots: 'noindex, nofollow'
    },
    signup: {
        path: '/signup.html',
        fileName: 'signup.html',
        title: 'Create Your Account | TechPath',
        description: 'Create a free TechPath student account to access tailored engineering roadmaps, notes, and career tools.',
        robots: 'noindex, nofollow'
    },
    'reset-password': {
        path: '/reset-password.html',
        fileName: 'reset-password.html',
        title: 'Reset Password | TechPath',
        description: 'Reset your TechPath student account password securely.',
        robots: 'noindex, nofollow'
    },
    'auth-callback': {
        path: '/auth-callback.html',
        fileName: 'auth-callback.html',
        title: 'Authenticating... | TechPath',
        description: 'Verifying credentials and completing secure single sign-on authentication.',
        robots: 'noindex, nofollow'
    },
    onboarding: {
        path: '/onboarding.html',
        fileName: 'onboarding.html',
        title: 'Student Onboarding | TechPath',
        description: 'Configure your engineering degree, department, semester, and curriculum preferences.',
        robots: 'noindex, nofollow'
    },
    maintenance: {
        path: '/maintenance.html',
        fileName: 'maintenance.html',
        title: 'Under Scheduled Maintenance | TechPath',
        description: 'TechPath is currently undergoing scheduled platform maintenance and upgrades.',
        robots: 'noindex, nofollow'
    },
    helpdesk: {
        path: '/helpdesk.html',
        fileName: 'helpdesk.html',
        title: 'Helpdesk & Student Support | TechPath',
        description: 'Access guides, user documentation, and technical support resources for TechPath.',
        robots: 'noindex, nofollow'
    },
    '404': {
        path: '/404.html',
        fileName: '404.html',
        title: 'Page Not Found | TechPath',
        description: 'The requested engineering learning resource or page could not be found.',
        robots: 'noindex, nofollow'
    },
    'thank-you': {
        path: '/thank-you.html',
        fileName: 'thank-you.html',
        title: 'Thank You | TechPath',
        description: 'Your submission has been received. Thank you for connecting with TechPath.',
        robots: 'noindex, nofollow'
    },
    'bulk-pdf': {
        path: '/bulk-pdf.html',
        fileName: 'bulk-pdf.html',
        title: 'Redirecting to AI Notes | TechPath',
        description: 'Redirecting to the unified AI Notes workspace on TechPath.',
        robots: 'noindex, nofollow'
    },
    'bulk-pdf-notes': {
        path: '/bulk-pdf-notes.html',
        fileName: 'bulk-pdf-notes.html',
        title: 'Redirecting to AI Notes | TechPath',
        description: 'Redirecting to the unified AI Notes workspace on TechPath.',
        robots: 'noindex, nofollow'
    },
    'pdf-analyzer': {
        path: '/pdf-analyzer.html',
        fileName: 'pdf-analyzer.html',
        title: 'Redirecting to AI Notes | TechPath',
        description: 'Redirecting to the unified AI Notes workspace on TechPath.',
        robots: 'noindex, nofollow'
    }
};

/**
 * Resolves metadata for a given file name or URL pathname
 */
function resolvePageMetadata(identifier) {
    if (!identifier) return PAGE_METADATA.home;
    const clean = identifier.toLowerCase().replace(/^\//, '').replace(/\.html$/, '');
    if (!clean || clean === 'index') return PAGE_METADATA.home;

    let item = PAGE_METADATA[clean];

    // Search by fileName
    if (!item) {
        for (const key of Object.keys(PAGE_METADATA)) {
            if (PAGE_METADATA[key].fileName === `${clean}.html` || PAGE_METADATA[key].path === `/${clean}.html`) {
                item = PAGE_METADATA[key];
                break;
            }
        }
    }

    if (item) {
        return {
            ...item,
            canonical: item.canonical || `${CANONICAL_ORIGIN}/${item.fileName || clean + '.html'}`,
            ogImage: item.ogImage || DEFAULT_OG_IMAGE,
            ogType: item.ogType || 'website'
        };
    }

    return {
        path: `/${clean}.html`,
        fileName: `${clean}.html`,
        title: `${clean.charAt(0).toUpperCase() + clean.slice(1).replace(/[-_]/g, ' ')} | ${SITE_NAME}`,
        description: 'TechPath — The engineering student intelligence and career operating system.',
        robots: 'noindex, nofollow',
        canonical: `${CANONICAL_ORIGIN}/${clean}.html`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website'
    };
}

/**
 * Dynamically updates document metadata for client-side navigation
 */
function applyPageMetadata(identifier) {
    if (typeof document === 'undefined') return;
    const meta = resolvePageMetadata(identifier);
    if (!meta) return;

    // Document Title
    document.title = meta.title;

    const setMeta = (attr, key, content) => {
        if (!content) return;
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    };

    setMeta('name', 'description', meta.description);
    setMeta('name', 'robots', meta.robots || 'index, follow');

    // Open Graph
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:type', meta.ogType || 'website');
    setMeta('property', 'og:title', meta.ogTitle || meta.title);
    setMeta('property', 'og:description', meta.ogDescription || meta.description);
    setMeta('property', 'og:image', meta.ogImage || DEFAULT_OG_IMAGE);
    if (meta.canonical) {
        setMeta('property', 'og:url', meta.canonical);
        let linkCanon = document.querySelector('link[rel="canonical"]');
        if (!linkCanon) {
            linkCanon = document.createElement('link');
            linkCanon.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanon);
        }
        linkCanon.setAttribute('href', meta.canonical);
    }

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', meta.ogTitle || meta.title);
    setMeta('name', 'twitter:description', meta.ogDescription || meta.description);
    setMeta('name', 'twitter:image', meta.ogImage || DEFAULT_OG_IMAGE);

    // Schema.org JSON-LD Structured Data
    injectSchemaMarkup(meta);
}

/**
 * Injects Schema.org JSON-LD Structured Data for rich search snippets
 */
function injectSchemaMarkup(meta) {
    if (typeof document === 'undefined') return;
    let schemaScript = document.getElementById('techpath-schema-jsonld');
    if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'techpath-schema-jsonld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
    }

    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "EducationalOrganization",
                "@id": `${CANONICAL_ORIGIN}/#organization`,
                "name": SITE_NAME,
                "url": CANONICAL_ORIGIN,
                "logo": `${CANONICAL_ORIGIN}/assets/branding/techpath-logo-horizontal.png`,
                "sameAs": [
                    "https://github.com"
                ],
                "description": "Educational technology platform for undergraduate engineering students."
            },
            {
                "@type": "WebSite",
                "@id": `${CANONICAL_ORIGIN}/#website`,
                "url": CANONICAL_ORIGIN,
                "name": SITE_NAME,
                "publisher": {
                    "@id": `${CANONICAL_ORIGIN}/#organization`
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${CANONICAL_ORIGIN}/exams.html?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "SoftwareApplication",
                "name": "TechPath AI OS",
                "operatingSystem": "Web, Android, iOS",
                "applicationCategory": "EducationalApplication",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "INR"
                }
            }
        ]
    };

    schemaScript.textContent = JSON.stringify(schemaData, null, 2);
}

// Auto-apply on browser DOM load
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyPageMetadata());
    } else {
        applyPageMetadata();
    }
}

// Export for Node and Browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CANONICAL_ORIGIN,
        DEFAULT_OG_IMAGE,
        SITE_NAME,
        PAGE_METADATA,
        resolvePageMetadata,
        applyPageMetadata
    };
}

if (typeof window !== 'undefined') {
    window.TechPathSEO = {
        CANONICAL_ORIGIN,
        DEFAULT_OG_IMAGE,
        SITE_NAME,
        PAGE_METADATA,
        resolvePageMetadata,
        applyPageMetadata
    };
}
