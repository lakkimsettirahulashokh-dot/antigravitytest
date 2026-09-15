-- ==============================================================================
-- BTechPath AI OS — Master Supabase Seed Data (supabase/seed.sql)
-- Target: Supabase Local / Remote CLI (supabase db reset)
-- ==============================================================================

-- 1. ENGINEERING BRANCHES SEED
INSERT INTO public.branches (id, code, name, description, semesters, subjects, is_active)
VALUES
    ('branch_aiml', 'AIML', 'Artificial Intelligence & Machine Learning', 'Specialized B.Tech track focusing on neural architectures, computer vision, NLP, and intelligent autonomous systems.', 
     '[{"sem": 1, "name": "Foundations & Calculus"}, {"sem": 2, "name": "Data Structures & Linear Algebra"}, {"sem": 3, "name": "Algorithms & Probability"}, {"sem": 4, "name": "Database & Distributed Systems"}, {"sem": 5, "name": "Machine Learning Foundations"}, {"sem": 6, "name": "Deep Learning & NLP"}, {"sem": 7, "name": "MLOps & Cloud Scale AI"}, {"sem": 8, "name": "Capstone & Industry Practice"}]'::jsonb,
     '["Data Structures & Algorithms", "Mathematics for Machine Learning", "Design and Analysis of Algorithms", "Database Management Systems", "Artificial Intelligence", "Deep Learning", "Natural Language Processing", "Computer Vision", "MLOps Engineering"]'::jsonb,
     true),
    ('branch_cse', 'CSE', 'Computer Science & Engineering', 'Core computer systems, operating systems, compilers, algorithms, networking, and software engineering principles.',
     '[{"sem": 1, "name": "Programming in C & Physics"}, {"sem": 2, "name": "OOP & Discrete Math"}, {"sem": 3, "name": "Data Structures & Digital Logic"}, {"sem": 4, "name": "Operating Systems & DBMS"}, {"sem": 5, "name": "Computer Networks & Automata"}, {"sem": 6, "name": "Compiler Design & Software Eng"}, {"sem": 7, "name": "Cloud Computing & Security"}, {"sem": 8, "name": "Major Project & Internship"}]'::jsonb,
     '["C Programming", "Data Structures", "Computer Organization & Architecture", "Operating Systems", "Database Management Systems", "Computer Networks", "Theory of Computation", "Compiler Design", "Distributed Computing"]'::jsonb,
     true),
    ('branch_ece', 'ECE', 'Electronics & Communication Engineering', 'Hardware systems, signal processing, VLSI design, embedded systems, and wireless communications.',
     '[{"sem": 1, "name": "Applied Physics & Calculus"}, {"sem": 2, "name": "Network Theory & Devices"}, {"sem": 3, "name": "Electronic Devices & Digital Circuits"}, {"sem": 4, "name": "Analog Circuits & Signals"}, {"sem": 5, "name": "Microprocessors & Control Systems"}, {"sem": 6, "name": "VLSI Design & DSP"}, {"sem": 7, "name": "Wireless Communication & IoT"}, {"sem": 8, "name": "Hardware Capstone"}]'::jsonb,
     '["Network Analysis", "Electronic Devices and Circuits", "Digital System Design", "Analog Electronics", "Signals and Systems", "Microcontrollers & Embedded Systems", "Digital Signal Processing", "VLSI Design"]'::jsonb,
     true),
    ('branch_it', 'IT', 'Information Technology', 'Full-stack engineering, web architecture, information security, database warehousing, and cloud scale enterprise systems.',
     '[{"sem": 1, "name": "IT Foundations & C"}, {"sem": 2, "name": "Data Structures & OOP"}, {"sem": 3, "name": "Web Technologies & DBMS"}, {"sem": 4, "name": "OS & Networking"}, {"sem": 5, "name": "Information Security"}, {"sem": 6, "name": "Cloud Computing & DevOps"}, {"sem": 7, "name": "Enterprise Architecture"}, {"sem": 8, "name": "Industry Internship"}]'::jsonb,
     '["Data Structures", "Database Engineering", "Web Architecture", "Operating Systems", "Computer Networks", "Cyber Security", "Cloud Infrastructure", "DevOps & CI/CD"]'::jsonb,
     true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    semesters = EXCLUDED.semesters,
    subjects = EXCLUDED.subjects;

-- 2. CURATED CAREER PATHWAYS SEED
INSERT INTO public.careers (id, title, department, salary_range, description, match_score)
VALUES
    ('career_ml_engineer', 'Machine Learning Engineer', 'Artificial Intelligence', '$110,000 - $165,000', 'Architect, train, and deploy production machine learning models and LLM applications at scale.', 96),
    ('career_fullstack_lead', 'Full-Stack Systems Architect', 'Software Engineering', '$105,000 - $155,000', 'Design high-throughput distributed web systems, resilient microservices, and reactive client applications.', 92),
    ('career_systems_eng', 'Systems & Embedded Engineer', 'Core Engineering', '$98,000 - $145,000', 'Low-level systems programming in C/C++/Rust, operating system kernels, device drivers, and real-time firmware.', 88),
    ('career_devops_cloud', 'Cloud & Platform Engineer (DevOps)', 'Infrastructure', '$100,000 - $150,000', 'Automate Kubernetes clusters, CI/CD pipelines, infrastructure-as-code, and zero-downtime deployments.', 90)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    salary_range = EXCLUDED.salary_range,
    description = EXCLUDED.description,
    match_score = EXCLUDED.match_score;

-- Career Required Skills
INSERT INTO public.career_skills (career_id, skill_name, importance, proficiency_level)
VALUES
    ('career_ml_engineer', 'PyTorch / TensorFlow', 'Mandatory', 'Expert'),
    ('career_ml_engineer', 'Python & Vector Mathematics', 'Mandatory', 'Expert'),
    ('career_ml_engineer', 'MLOps & Docker Deployment', 'Mandatory', 'Advanced'),
    ('career_ml_engineer', 'Transformer & Attention Networks', 'Preferred', 'Advanced'),
    ('career_fullstack_lead', 'TypeScript & Modern React / Next.js', 'Mandatory', 'Expert'),
    ('career_fullstack_lead', 'PostgreSQL & Relational Data Modeling', 'Mandatory', 'Advanced'),
    ('career_fullstack_lead', 'REST & GraphQL API Architecture', 'Mandatory', 'Expert'),
    ('career_fullstack_lead', 'Redis Caching & Async Queues', 'Preferred', 'Intermediate'),
    ('career_systems_eng', 'C & Modern C++ (C++20)', 'Mandatory', 'Expert'),
    ('career_systems_eng', 'POSIX Systems & Linux Kernel Internals', 'Mandatory', 'Advanced'),
    ('career_systems_eng', 'Memory Management & Concurrency', 'Mandatory', 'Expert'),
    ('career_devops_cloud', 'Kubernetes & Docker Containerization', 'Mandatory', 'Expert'),
    ('career_devops_cloud', 'Terraform & Infrastructure-as-Code', 'Mandatory', 'Advanced'),
    ('career_devops_cloud', 'CI/CD Pipelines (GitHub Actions)', 'Mandatory', 'Expert')
ON CONFLICT DO NOTHING;

-- Career Recommended Projects
INSERT INTO public.career_projects (career_id, title, difficulty, tech_stack, description)
VALUES
    ('career_ml_engineer', 'End-to-End LLM RAG Document Intelligence System', 'Advanced', '["Python", "LangChain", "ChromaDB", "FastAPI", "Docker"]'::jsonb, 'Multi-tenant retrieval-augmented generation engine with hybrid sparse/dense vector search and citation grounding.'),
    ('career_fullstack_lead', 'Real-Time Collaborative Code Playground', 'Advanced', '["Node.js", "WebSockets", "WebRTC", "PostgreSQL", "Tailwind"]'::jsonb, 'Zero-latency multi-user code editor with operational transformation, in-browser code execution sandbox, and presence state.'),
    ('career_systems_eng', 'Custom Unix Shell & Virtual Memory Manager', 'Hard', '["C", "POSIX", "x86-64", "Makefile"]'::jsonb, 'User-space shell implementation supporting process pipelines, job control, signals, and simulated paging.')
ON CONFLICT DO NOTHING;

-- 3. LIVE JOBS & INTERNSHIPS SEED
INSERT INTO public.jobs (id, title, company, location, type, stipend, branch, deadline, description, apply_url, is_active)
VALUES
    ('8a3f12bc-1234-4567-89ab-cdef01234567', 'AI Research & Engineering Intern', 'Google DeepMind Core', 'Remote / Hybrid (Bengaluru / Mountain View)', 'Internship', '$7,500/mo', 'AIML', NOW() + INTERVAL '45 days', 'Collaborate on next-generation LLM reasoning architectures, automated coding agents, and real-time inference benchmarking.', 'https://careers.google.com', true),
    ('9b4e23cd-2345-5678-90bc-def012345678', 'Distributed Systems Intern', 'NVIDIA Accelerated Computing', 'Hybrid (Hyderabad / Santa Clara)', 'Internship', '$7,000/mo', 'CSE', NOW() + INTERVAL '30 days', 'Design high-throughput parallel compute pipelines, GPU memory optimizations, and NCCL networking layers for AI superclusters.', 'https://nvidia.com/careers', true),
    ('0c5f34de-3456-6789-01cd-ef0123456789', 'Full-Stack Software Engineer', 'Stripe Engineering', 'Remote (Global / India)', 'Full-time', '$125,000/yr', 'CSE', NOW() + INTERVAL '60 days', 'Build developer-first payment APIs, global financial routing primitives, and mission-critical payment orchestration engines.', 'https://stripe.com/jobs', true),
    ('1d6a45ef-4567-7890-12de-f01234567890', 'Platform Infrastructure Intern', 'Vercel Edge Cloud', 'Remote', 'Internship', '$6,200/mo', 'IT', NOW() + INTERVAL '25 days', 'Work on edge compute runtimes, globally replicated key-value storage, and sub-millisecond cold start optimization.', 'https://vercel.com/careers', true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    stipend = EXCLUDED.stipend,
    is_active = EXCLUDED.is_active;

-- 4. VIDEO LECTURES LIBRARY SEED
INSERT INTO public.videos (title, branch_code, semester, subject, video_url, duration, instructor)
VALUES
    ('Dynamic Programming Masterclass: From Recursion to Tabulation', 'AIML', 3, 'Data Structures & Algorithms', 'https://www.youtube.com/watch?v=oBt53YbR9Kk', '48:15', 'Dr. Arvind Sharma (IIT Delhi)'),
    ('Transformers from Scratch: Multi-Head Attention Mathematics', 'AIML', 6, 'Deep Learning & NLP', 'https://www.youtube.com/watch?v=kCc8FmEb1nY', '54:30', 'Prof. Priya Venkatesh (IISc)'),
    ('Operating Systems: Virtual Memory & Page Replacement Algorithms', 'CSE', 4, 'Operating Systems', 'https://www.youtube.com/watch?v=2quJy3A7Q6E', '42:10', 'Dr. Rajesh Nair (IIT Madras)'),
    ('Relational Concurrency: Two-Phase Locking & Serializable Isolation', 'CSE', 4, 'Database Management Systems', 'https://www.youtube.com/watch?v=G3T_K0bWc_M', '39:45', 'Prof. Sunita Rao (BITS Pilani)')
ON CONFLICT DO NOTHING;

-- 5. OFFICIAL EXAM TAXONOMY & SYLLABUS SEED
INSERT INTO public.exam_papers (id, exam_type, title, total_marks, duration_minutes)
VALUES
    ('paper_gate_cs_2026', 'GATE', 'GATE Computer Science & Information Technology', 100, 180),
    ('paper_btech_endsem_cs301', 'University', 'B.Tech CS301: Algorithms & Data Structures Finals', 100, 180),
    ('paper_isro_scientist_cs', 'Government', 'ISRO Scientist/Engineer SC (Computer Science)', 240, 120)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    total_marks = EXCLUDED.total_marks;

-- Exam Subjects
INSERT INTO public.exam_subjects (id, paper_id, code, name, credits)
VALUES
    ('sub_gate_dsa', 'paper_gate_cs_2026', 'CS-01', 'Algorithms & Data Structures', 4),
    ('sub_gate_os', 'paper_gate_cs_2026', 'CS-02', 'Operating Systems', 4),
    ('sub_gate_dbms', 'paper_gate_cs_2026', 'CS-03', 'Databases', 4),
    ('sub_endsem_dsa', 'paper_btech_endsem_cs301', 'CS301-A', 'Advanced Algorithms Analysis', 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name;

-- Exam Topics
INSERT INTO public.exam_topics (id, subject_id, name, importance, weightage_percentage)
VALUES
    ('top_dsa_dp', 'sub_gate_dsa', 'Dynamic Programming & Memoization', 'Critical', 25),
    ('top_dsa_graphs', 'sub_gate_dsa', 'Graph Theory & Shortest Path Trees', 'High', 20),
    ('top_os_paging', 'sub_gate_os', 'Virtual Memory, Paging & TLB Hit Ratios', 'High', 22),
    ('top_dbms_acid', 'sub_gate_dbms', 'Transaction Isolation & Serializability', 'Critical', 24)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    importance = EXCLUDED.importance;

-- Exam Subtopics
INSERT INTO public.exam_subtopics (id, topic_id, name, key_concepts, formulas)
VALUES
    ('subtop_dp_knapsack', 'top_dsa_dp', '0/1 Knapsack & Fractional Greedy Variants', 
     '["Optimal substructure property", "Overlapping subproblems", "Space-optimization array reduction"]'::jsonb,
     '["DP[i][w] = max(DP[i-1][w], val[i] + DP[i-1][w-wt[i]])", "Space: O(W) with reverse iteration"]'::jsonb),
    ('subtop_graph_dijkstra', 'top_dsa_graphs', 'Dijkstra and Priority Queue Optimization',
     '["Greedy frontier relaxation", "Min-heap operations", "Non-negative edge weight requirement"]'::jsonb,
     '["Time: O((V + E) log V)", "Negative weight detection requires Bellman-Ford O(V * E)"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name;

-- 6. QUIZZES SEED
INSERT INTO public.quizzes (id, title, topic, branch, total_questions)
VALUES
    ('quiz_dsa_trees', 'Binary Search Trees & AVL Rotations', 'Algorithms', 'AIML', 10),
    ('quiz_os_concurrency', 'Deadlocks, Semaphores & Mutex Locks', 'Operating Systems', 'CSE', 10),
    ('quiz_dbms_indexing', 'B+ Trees Indexing & Hash Joins', 'Databases', 'CSE', 10)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title;
