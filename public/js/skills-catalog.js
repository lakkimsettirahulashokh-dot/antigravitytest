/* ==============================================================================
   BTechPath AI OS — Smart Skills Master Catalog & Career Mapping System
   Supports: All 45+ B.Tech Engineering Disciplines & Core Technical Tracks
   Categories:
   - ⭐ Core Skills
   - 🧰 Tools
   - 🧠 Fundamental Knowledge
   - 💻 Technical Skills
   - 🤝 Soft Skills
   - 🛠️ Practical Skills
   - 📁 Portfolio Skills
   - 🎤 Interview Skills
   - 🚀 Advanced Skills
   ============================================================================== */

const SkillsCatalog = {
    // 1. Master Skills Taxonomy
    skills: {
        // --- COMPUTING & SOFTWARE ---
        dsa: {
            id: 'dsa',
            name: 'Data Structures & Algorithms',
            category: '⭐ Core Skills',
            branch: 'CSE',
            difficulty: 'Intermediate',
            whyItMatters: 'Forms the computational backbone of all scalable software, system optimization, and technical interview screening at top tier engineering companies.',
            whereToLearn: [
                { title: 'Official Python Data Structures Tutorial', provider: 'Python Software Foundation', type: 'Official Documentation', difficulty: 'Beginner', language: 'English', description: 'Comprehensive guide to built-in collections, bisect, and heapq.', link: 'https://docs.python.org/3/tutorial/datastructures.html', isOfficial: true },
                { title: 'Algorithms Specialization', provider: 'Stanford University / Coursera', type: 'Course', difficulty: 'Intermediate', language: 'English', description: 'Rigorous algorithmic analysis, divide and conquer, and graph traversal.', link: 'https://www.coursera.org/specializations/algorithms', isOfficial: false },
                { title: 'NeetCode Algorithms & Roadmap', provider: 'NeetCode', type: 'Practice Platform', difficulty: 'Intermediate', language: 'English', description: 'Structured visual problem solving for pattern-based DSA interview prep.', link: 'https://neetcode.io', isOfficial: false },
                { title: 'MIT OpenCourseWare: Introduction to Algorithms', provider: 'MIT OCW', type: 'Educational Website', difficulty: 'Advanced', language: 'English', description: 'Full MIT 6.006 lecture notes and problem sets.', link: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', isOfficial: true }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['Asymptotic Big-O Analysis', 'Dynamic Arrays', 'Singly & Doubly Linked Lists'], practiceTasks: ['Reverse a linked list', 'Implement custom vector'], miniProject: 'LRU Cache Prototype', completionCriteria: 'Solve 10 array & list problems with optimal memory.' },
                { stage: '2. FOUNDATION', topics: ['Stacks & Monotonic Queues', 'Hash Tables & Collision Resolution', 'Recursion Tree Analysis'], practiceTasks: ['Valid Parentheses', 'Daily Temperatures'], miniProject: 'Browser History Navigation Engine', completionCriteria: 'Zero memory leaks in pointer manipulation.' },
                { stage: '3. PRACTICE', topics: ['Binary Search Trees', 'Trie / Prefix Trees', 'Min/Max Heaps & Priority Queues'], practiceTasks: ['Top K Frequent Elements', 'Merge K Sorted Lists'], miniProject: 'Autocomplete Search Predictor', completionCriteria: 'Master logarithmic search properties.' },
                { stage: '4. PROJECT', topics: ['Graph Representations (Adj List/Matrix)', 'BFS & DFS', 'Topological Sort'], practiceTasks: ['Course Schedule I/II', 'Clone Graph'], miniProject: 'Social Network Connection Graph', completionCriteria: 'Detect cycles and shortest paths reliably.' },
                { stage: '5. INTERMEDIATE', topics: ['Dynamic Programming Fundamentals', '1D/2D Memoization', 'Knapsack & LCS Variants'], practiceTasks: ['Coin Change', 'Longest Common Subsequence'], miniProject: 'Stock Trading Sequence Optimizer', completionCriteria: 'Formulate state transitions with tabular optimization.' },
                { stage: '6. ADVANCED', topics: ['Shortest Path (Dijkstra, Bellman-Ford)', 'Disjoint Set Union (DSU)', 'Segment Trees'], practiceTasks: ['Network Delay Time', 'Redundant Connection'], miniProject: 'Autonomous Delivery Route Solver', completionCriteria: 'Implement Dijkstra and Kruskal MST without starter code.' },
                { stage: '7. PORTFOLIO', topics: ['Cache Replacement Policies', 'Lock-Free Queues', 'Benchmarking Memory Access'], practiceTasks: ['Build Concurrent Ring Buffer', 'Profile CPU cache lines'], miniProject: 'High-Throughput In-Memory Key-Value Store', completionCriteria: 'Publish benchmarks with sub-microsecond latency.' },
                { stage: '8. INTERVIEW READY', topics: ['Live Mock Coding', 'Trade-off Articulation', 'Edge Case Handling under Pressure'], practiceTasks: ['Timed 30-min interview problems'], miniProject: 'System Architecture Problem Walkthrough', completionCriteria: 'Solve unseen Hard problem explaining Big-O tradeoffs cleanly.' }
            ],
            diagnosticQuestions: [
                'How comfortably can you analyze the time and space complexity of nested loops and recursive calls?',
                'Can you implement a balanced binary search tree or priority queue from scratch?',
                'How frequently do you solve dynamic programming problems using state transitions?',
                'Have you implemented custom graph algorithms like Dijkstra or Topological Sort in a real project?',
                'Can you articulate the memory and caching differences between an Array and a Linked List?',
                'Can you write bug-free code under a 20-minute timed mock interview constraint?'
            ],
            practiceQuestions: [
                { id: 'pq1', question: 'What is the tightest worst-case time complexity of searching an element in a Balanced Red-Black Tree?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 1, explanation: 'A balanced Red-Black tree guarantees height h <= 2 * log2(n + 1), resulting in guaranteed O(log n) search time.' },
                { id: 'pq2', question: 'Which data structure is optimal for tracking the minimum element in constant O(1) time while supporting LIFO order?', options: ['Standard Queue', 'Dual Monotonic Stack', 'Binary Min-Heap', 'Singly Linked List'], correctIndex: 1, explanation: 'Maintaining an auxiliary minimum stack alongside the main stack enables push, pop, and getMin all in O(1) time.' },
                { id: 'pq3', question: 'In Dijkstra algorithm with a binary min-heap priority queue, what is the running time for a graph with V vertices and E edges?', options: ['O(V^2)', 'O(E log V)', 'O(V log E)', 'O(E + V)'], correctIndex: 1, explanation: 'With a binary heap, extracting min takes O(V log V) and edge relaxations with key updates take O(E log V), yielding O((V + E) log V) = O(E log V) for connected graphs.' },
                { id: 'pq4', question: 'Which algorithm detects directed graph cycles by classifying edges into Tree, Back, Forward, and Cross edges?', options: ['Kruskal MST', 'Breadth-First Search', 'Depth-First Search (DFS)', 'Prim Algorithm'], correctIndex: 2, explanation: 'DFS traversal tracks node visitation states (unvisited, visiting, visited); encountering a node in the visiting state indicates a back-edge and hence a directed cycle.' },
                { id: 'pq5', question: 'What is the space complexity of an in-place QuickSort implementation when using tail-recursion optimization?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 1, explanation: 'Tail recursion ensures the smaller partition is recurred into first, bounding the call stack depth to at most O(log n).' }
            ],
            projectTemplate: {
                name: 'High-Performance In-Memory Cache with LRU Eviction & Concurrency',
                description: 'Build an in-memory key-value cache utilizing a Doubly Linked List and Hash Map with thread-safe read/write operations and TTL expirations.'
            }
        },

        python: {
            id: 'python',
            name: 'Python Engineering',
            category: '⭐ Core Skills',
            branch: 'CSE',
            difficulty: 'Beginner',
            whyItMatters: 'The industry-standard programming language for Artificial Intelligence, Machine Learning, Automation, and Cloud Microservices.',
            whereToLearn: [
                { title: 'Official Python Documentation & Tutorial', provider: 'Python Software Foundation', type: 'Official Documentation', difficulty: 'Beginner', language: 'English', description: 'Official complete documentation, syntax, built-ins, and standard library.', link: 'https://docs.python.org/3/', isOfficial: true },
                { title: 'CS50P: Introduction to Programming with Python', provider: 'Harvard University', type: 'Course', difficulty: 'Beginner', language: 'English', description: 'Comprehensive university-level programming foundations in Python.', link: 'https://cs50.harvard.edu/python/', isOfficial: true },
                { title: 'Real Python Tutorials & Guides', provider: 'Real Python', type: 'Educational Website', difficulty: 'Intermediate', language: 'English', description: 'Deep dives on decorators, generators, asyncio, and type hinting.', link: 'https://realpython.com/', isOfficial: false }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['Variables', 'Data Types', 'Conditionals', 'Loops', 'Functions'], practiceTasks: ['Write modular calculator', 'String text cleaner'], miniProject: 'CLI Student Record Manager', completionCriteria: 'Write PEP-8 compliant code.' },
                { stage: '2. FOUNDATION', topics: ['Lists, Dictionaries, Sets, Tuples', 'List Comprehensions', 'File I/O'], practiceTasks: ['CSV Data parser', 'Log file error extractor'], miniProject: 'Automated Log Analyzer', completionCriteria: 'Zero file-handle leaks using context managers.' },
                { stage: '3. PRACTICE', topics: ['Object-Oriented Programming (Classes, Inheritance)', 'Magic Methods (__repr__, __len__)'], practiceTasks: ['Build BankAccount hierarchy', 'Custom iterable vector class'], miniProject: 'Inventory Simulation Engine', completionCriteria: 'Encapsulation and composition verified.' },
                { stage: '4. PROJECT', topics: ['Exception Handling', 'Custom Exceptions', 'Virtual Environments (venv/poetry)'], practiceTasks: ['Graceful API retry handler'], miniProject: 'Robust Weather API Consumer', completionCriteria: 'Handle network timeouts and JSON parsing gracefully.' },
                { stage: '5. INTERMEDIATE', topics: ['Decorators', 'Generators & Yield', 'Type Hinting & Pydantic'], practiceTasks: ['Execution time logger decorator', 'Streaming large file generator'], miniProject: 'Streaming Financial Ticker Processor', completionCriteria: '100% mypy strict type check pass.' },
                { stage: '6. ADVANCED', topics: ['Asyncio & Coroutines', 'Multiprocessing vs Multithreading', 'GIL Internals'], practiceTasks: ['Async concurrent web scraper', 'Parallel CPU-bound prime factorizer'], miniProject: 'Async High-Throughput HTTP Microservice', completionCriteria: 'Handle 500 concurrent connections.' },
                { stage: '7. PORTFOLIO', topics: ['FastAPI Microservice', 'Pytest Suite', 'Dockerization'], practiceTasks: ['Write 90% coverage test suite', 'Containerize FastAPI app'], miniProject: 'Full Production REST API with OpenAPI Docs', completionCriteria: 'Deployed and verified container image.' },
                { stage: '8. INTERVIEW READY', topics: ['Memory Management & Garbage Collection', 'Metaclasses', 'Interview System Design'], practiceTasks: ['Explain GIL and memory allocator internals'], miniProject: 'Technical Deep-Dive Architecture Document', completionCriteria: 'Defend design decisions in mock technical interview.' }
            ],
            diagnosticQuestions: [
                'Can you explain the difference between mutable and immutable types in Python with memory references?',
                'How do Python generators save memory compared to list comprehensions?',
                'Can you write and debug a custom decorator that accepts arguments?',
                'Have you built an asynchronous backend service using asyncio or FastAPI?',
                'Can you explain the Global Interpreter Lock (GIL) and when to use multiprocessing vs threading?',
                'Have you written comprehensive unit tests with pytest and mock fixtures?'
            ],
            practiceQuestions: [
                { id: 'py1', question: 'In Python, what happens when a mutable object (like a list) is passed as a default argument in a function definition?', options: ['It raises a SyntaxError at compile time', 'The default list is created once when the function is defined and shared across all subsequent calls', 'A new empty list is instantiated on every function invocation', 'Python automatically clones the list using deepcopy'], correctIndex: 1, explanation: 'Default parameter values are evaluated once when the function is loaded into memory, creating a persistent shared reference.' },
                { id: 'py2', question: 'Which built-in module provides asynchronous I/O, event loops, and coroutine execution in Python?', options: ['multiprocessing', 'asyncio', 'threading', 'concurrent.futures'], correctIndex: 1, explanation: 'The asyncio library provides the foundation for concurrent single-threaded asynchronous I/O and task scheduling.' },
                { id: 'py3', question: 'What is the primary function of Python __slots__ attribute inside a class definition?', options: ['To restrict dynamic attribute creation and significantly reduce instance memory footprint', 'To make all class attributes public and serializable', 'To allow multiple inheritance without name collisions', 'To convert all methods into static methods'], correctIndex: 0, explanation: '__slots__ prevents the creation of the default instance __dict__, saving significant RAM when instantiating millions of objects.' },
                { id: 'py4', question: 'What does the functools.wraps decorator do when applied to a custom wrapper function?', options: ['It speeds up execution by JIT compiling bytecode', 'It preserves the original function name, docstring, and annotations', 'It turns the function into a singleton', 'It prevents recursion errors'], correctIndex: 1, explanation: 'functools.wraps copies the original function metadata (__name__, __doc__) onto the wrapper function.' },
                { id: 'py5', question: 'How does Python garbage collector identify and clean up cyclic reference memory leaks?', options: ['Reference counting alone handles all cyclic references', 'Generational garbage collection tracking unreachable object reference graphs', 'Operating system page-level compaction', 'Immediate process termination'], correctIndex: 1, explanation: 'While reference counting frees non-cyclic objects instantly, the generational garbage collector runs periodic graph cycles to detect unreachable clusters.' }
            ],
            projectTemplate: {
                name: 'Production-Grade Async Microservice with FastAPI, Pydantic & Docker',
                description: 'Design a resilient RESTful service featuring async database pooling, JWT authentication, rate limiting, and comprehensive Pytest validation.'
            }
        },

        sql: {
            id: 'sql',
            name: 'SQL & Relational Databases',
            category: '⭐ Core Skills',
            branch: 'CSE',
            difficulty: 'Intermediate',
            whyItMatters: 'Essential for data querying, transactional consistency (ACID), enterprise backend persistence, and data analytics across every engineering role.',
            whereToLearn: [
                { title: 'PostgreSQL Official Documentation', provider: 'PostgreSQL Global Development Group', type: 'Official Documentation', difficulty: 'Intermediate', language: 'English', description: 'Comprehensive guide to SQL syntax, indexing, and window functions.', link: 'https://www.postgresql.org/docs/', isOfficial: true },
                { title: 'SQLBolt: Interactive SQL Lessons', provider: 'SQLBolt', type: 'Practice Platform', difficulty: 'Beginner', language: 'English', description: 'Interactive browser-based exercises for SELECT, JOINs, and aggregates.', link: 'https://sqlbolt.com/', isOfficial: false },
                { title: 'Use The Index, Luke!', provider: 'Markus Winand', type: 'Educational Website', difficulty: 'Advanced', language: 'English', description: 'A database indexing guide for developers to understand B-Trees and execution plans.', link: 'https://use-the-index-luke.com/', isOfficial: false }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT', 'Data Types'], practiceTasks: ['Query customer records', 'Filter active accounts'], miniProject: 'Basic Student Query Script', completionCriteria: 'Formulate syntax-error-free filtered queries.' },
                { stage: '2. FOUNDATION', topics: ['GROUP BY', 'HAVING', 'COUNT, SUM, AVG', 'Aggregate functions'], practiceTasks: ['Compute department averages', 'Filter groups by count threshold'], miniProject: 'Monthly Sales Report Generator', completionCriteria: 'Understand WHERE vs HAVING filters.' },
                { stage: '3. PRACTICE', topics: ['INNER JOIN', 'LEFT/RIGHT JOIN', 'FULL OUTER JOIN', 'Self Joins'], practiceTasks: ['Join orders with customer addresses', 'Manager-employee hierarchy self-join'], miniProject: 'E-commerce Order History Aggregator', completionCriteria: 'Accurately select correct JOIN type.' },
                { stage: '4. PROJECT', topics: ['Subqueries', 'Correlated Subqueries', 'Common Table Expressions (CTEs)'], practiceTasks: ['Find top earners per team using CTE', 'Subquery in WHERE IN'], miniProject: 'Hierarchical Organization Tree Query', completionCriteria: 'Write readable WITH queries.' },
                { stage: '5. INTERMEDIATE', topics: ['Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG)'], practiceTasks: ['Calculate running totals', 'Top 3 ranked items per category'], miniProject: 'Financial Leaderboard & Rolling Average Analytics', completionCriteria: 'Master PARTITION BY and ORDER BY clauses.' },
                { stage: '6. ADVANCED', topics: ['Indexes (B-Tree, Hash, GIN)', 'EXPLAIN ANALYZE', 'Query Execution Plans'], practiceTasks: ['Analyze slow query plan', 'Eliminate sequential scan with composite index'], miniProject: 'Database Optimization & Latency Benchmark', completionCriteria: 'Reduce query cost by >70% with targeted index.' },
                { stage: '7. PORTFOLIO', topics: ['Database Schema Normalization (1NF to BCNF)', 'ACID Transactions', 'Isolation Levels'], practiceTasks: ['Design normalized SaaS schema', 'Demonstrate phantom read prevention'], miniProject: 'Multi-Tenant SaaS Relational Schema & Migration', completionCriteria: 'Zero data redundancy and verified foreign keys.' },
                { stage: '8. INTERVIEW READY', topics: ['Complex Query Optimization under pressure', 'Sharding & Replication Concepts'], practiceTasks: ['Solve LeetCode Hard SQL problems timed'], miniProject: 'Relational Database Architecture Defense', completionCriteria: 'Defend indexing and transaction choices.' }
            ],
            diagnosticQuestions: [
                'Can you explain the difference between WHERE and HAVING clauses?',
                'How do Window Functions differ from standard GROUP BY aggregations?',
                'Can you interpret a PostgreSQL EXPLAIN ANALYZE execution plan to detect index scans?',
                'What is the difference between RANK() and DENSE_RANK() in SQL window calculations?',
                'Can you explain the four ACID properties and transaction isolation levels?',
                'Have you designed a normalized third normal form (3NF) production database schema?'
            ],
            practiceQuestions: [
                { id: 'sql1', question: 'Which clause in SQL is evaluated FIRST in query execution order?', options: ['SELECT', 'FROM', 'WHERE', 'GROUP BY'], correctIndex: 1, explanation: 'The database engine evaluates FROM (and JOINs) first to determine the candidate dataset, followed by WHERE, GROUP BY, HAVING, SELECT, and ORDER BY.' },
                { id: 'sql2', question: 'What is the difference between RANK() and DENSE_RANK() when two rows share the same value in 1st place?', options: ['RANK gives 1, 1, 3 while DENSE_RANK gives 1, 1, 2', 'RANK gives 1, 2, 3 while DENSE_RANK gives 1, 1, 1', 'There is no difference in relational SQL', 'DENSE_RANK ignores ties completely'], correctIndex: 0, explanation: 'RANK skips subsequent ranks corresponding to the count of ties (1, 1, 3), whereas DENSE_RANK assigns consecutive integers without gaps (1, 1, 2).' },
                { id: 'sql3', question: 'Which index type is best suited for equality and range queries on numerical or timestamp columns?', options: ['B-Tree Index', 'Hash Index', 'Full-Text Index', 'Bloom Filter'], correctIndex: 0, explanation: 'B-Tree indexes maintain sorted order, making them ideal for equality (=) as well as range comparisons (<, <=, >, >=, BETWEEN).' },
                { id: 'sql4', question: 'What does an EXPLAIN ANALYZE command output in PostgreSQL?', options: ['Only the estimated planner cost without running the query', 'The estimated plan AND the actual execution time, rows retrieved, and buffer memory hits by actually executing the query', 'A syntax validation check only', 'A database rollback command'], correctIndex: 1, explanation: 'EXPLAIN ANALYZE executes the statement, measuring real runtime metrics alongside planner estimates.' },
                { id: 'sql5', question: 'Which transaction isolation level prevents Dirty Reads, Non-Repeatable Reads, AND Phantom Reads completely?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], correctIndex: 3, explanation: 'Serializable isolation provides the strictest guarantee, simulating transactions as if they were executed one after another sequentially.' }
            ],
            projectTemplate: {
                name: 'High-Volume E-Commerce Relational Engine with Index Optimization',
                description: 'Implement a PostgreSQL database with partitioned tables, optimized composite B-trees, window analytical views, and transaction ACID guarantees.'
            }
        },

        docker: {
            id: 'docker',
            name: 'Docker & Containerization',
            category: '🧰 Tools',
            branch: 'CSE',
            difficulty: 'Intermediate',
            whyItMatters: 'Guarantees reliable software deployment across development, testing, and cloud production environments without "works on my machine" issues.',
            whereToLearn: [
                { title: 'Docker Official Documentation', provider: 'Docker Inc.', type: 'Official Documentation', difficulty: 'Beginner', language: 'English', description: 'Comprehensive guide to Dockerfiles, images, containers, and networking.', link: 'https://docs.docker.com/', isOfficial: true },
                { title: 'Docker for Beginners Tutorial', provider: 'freeCodeCamp', type: 'YouTube educational resources', difficulty: 'Beginner', language: 'English', description: 'Complete video walkthrough from installing Docker to multi-container compose.', link: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', isOfficial: false },
                { title: 'Play with Docker Classroom', provider: 'Docker / Community', type: 'Practice Platform', difficulty: 'Intermediate', language: 'English', description: 'Free in-browser Docker interactive command environment.', link: 'https://labs.play-with-docker.com/', isOfficial: true }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['Containers vs VMs', 'docker run', 'docker ps', 'docker stop'], practiceTasks: ['Run nginx container', 'Port map port 80 to 8080'], miniProject: 'Local Web Server Container', completionCriteria: 'Expose container port cleanly.' },
                { stage: '2. FOUNDATION', topics: ['Dockerfile Syntax', 'FROM, WORKDIR, COPY, RUN, CMD, ENTRYPOINT'], practiceTasks: ['Containerize basic Python script', 'Build custom image tag'], miniProject: 'Python CLI Container Image', completionCriteria: 'Build image without caching redundant files.' },
                { stage: '3. PRACTICE', topics: ['Docker Multi-stage Builds', 'Minimizing Image Size (Alpine vs Slim)'], practiceTasks: ['Reduce image from 1GB to 80MB using multi-stage build'], miniProject: 'Slim Microservice Container', completionCriteria: 'Image size under 100MB.' },
                { stage: '4. PROJECT', topics: ['Docker Volumes & Bind Mounts', 'State Persistence'], practiceTasks: ['Persist PostgreSQL data directory via named volume'], miniProject: 'Stateful Database Container Setup', completionCriteria: 'Data survives container destruction and recreation.' },
                { stage: '5. INTERMEDIATE', topics: ['Docker Compose (docker-compose.yml)', 'Multi-container Services', 'Internal Networks'], practiceTasks: ['Connect Web backend, Redis cache, and Postgres DB in Compose'], miniProject: 'Full Stack Multi-Container Orchestration', completionCriteria: 'Single docker-compose up brings up whole stack.' },
                { stage: '6. ADVANCED', topics: ['Container Security', 'Non-root Users', 'Read-only rootfs', 'Vulnerability Scanning'], practiceTasks: ['Run container as unprivileged UID 10001', 'Scan with trivy/docker scout'], miniProject: 'Hardened Production Container Setup', completionCriteria: 'Zero critical CVEs in base image.' },
                { stage: '7. PORTFOLIO', topics: ['CI/CD Container Pipelines', 'GitHub Actions Docker Build & Push'], practiceTasks: ['Automate build and publish to Docker Hub / GHCR'], miniProject: 'Automated CI/CD Container Pipeline', completionCriteria: 'Automated release on git push.' },
                { stage: '8. INTERVIEW READY', topics: ['Namespaces, Cgroups, and Linux Kernel Internals of Containers'], practiceTasks: ['Explain pivot_root and cgroups memory limits'], miniProject: 'Container Internals Technical Briefing', completionCriteria: 'Articulate containerization isolation architecture.' }
            ],
            diagnosticQuestions: [
                'Can you explain the difference between a Container and a Virtual Machine?',
                'What is the difference between CMD and ENTRYPOINT in a Dockerfile?',
                'How do multi-stage Docker builds reduce the final production image size?',
                'Can you connect multiple containers using a custom Docker bridge network in docker-compose?',
                'Why should you avoid running containers as the default root user in production?',
                'How do named volumes differ from host bind mounts in Docker storage?'
            ],
            practiceQuestions: [
                { id: 'dk1', question: 'Which Linux kernel features provide process isolation and resource limits for Docker containers?', options: ['Namespaces and Cgroups (Control Groups)', 'KVM and QEMU', 'Systemd and Init.d', 'SELinux alone'], correctIndex: 0, explanation: 'Namespaces isolate what a process can see (PIDs, network, mounts), while Cgroups restrict what resources it can use (CPU, RAM, I/O).' },
                { id: 'dk2', question: 'In a Dockerfile, which instruction specifies the executable that will ALWAYS run when the container starts, with CMD acting as default arguments?', options: ['RUN', 'ENTRYPOINT', 'START', 'WORKDIR'], correctIndex: 1, explanation: 'ENTRYPOINT defines the fixed binary to execute; any arguments passed to CMD or at runtime append to this command.' },
                { id: 'dk3', question: 'What is the primary architectural benefit of a Multi-stage Docker build?', options: ['It allows running multiple operating systems inside one container simultaneously', 'It separates build-time compilers and dependencies from the final lightweight runtime image', 'It eliminates the need for Docker volumes', 'It accelerates container download bandwidth only'], correctIndex: 1, explanation: 'Multi-stage builds allow compiling in a heavy SDK image and copying only the compiled artifacts into a clean, minimal runtime image.' },
                { id: 'dk4', question: 'Which command mounts a host directory into a container with read-only permissions?', options: ['docker run -v /host/path:/container/path:ro', 'docker run -mount read-only /path', 'docker run --lock-volume /path', 'docker run -p 80:80'], correctIndex: 0, explanation: 'The :ro flag appended to the volume argument marks the target container mount as strictly read-only.' },
                { id: 'dk5', question: 'How can you verify that container processes are running as a non-privileged user inside the container?', options: ['By executing "whoami" or "id" inside the running container', 'By running docker ps -a', 'By checking the container IP address', 'By restarting the Docker daemon'], correctIndex: 0, explanation: 'Running "docker exec -it <id> id" returns the current UID/GID, ensuring it is not UID 0 (root).' }
            ],
            projectTemplate: {
                name: 'Production Multi-Tier Microservice Orchestration with Hardened Docker',
                description: 'Build and deploy a multi-service architecture (FastAPI + Redis + PostgreSQL) using Docker Compose with multi-stage builds, health checks, and unprivileged execution.'
            }
        },

        git: {
            id: 'git',
            name: 'Git & GitHub Collaboration',
            category: '🧰 Tools',
            branch: 'CSE',
            difficulty: 'Beginner',
            whyItMatters: 'Universal version control foundation required by every engineering team for code versioning, peer review, and continuous integration.',
            whereToLearn: [
                { title: 'Pro Git Book (Official)', provider: 'Scott Chacon & Ben Straub', type: 'Book', difficulty: 'Beginner', language: 'English', description: 'The official free guide to Git internals, branching, and distributed workflows.', link: 'https://git-scm.com/book/en/v2', isOfficial: true },
                { title: 'Learn Git Branching (Interactive Visualizer)', provider: 'LearnGitBranching', type: 'Practice Platform', difficulty: 'Beginner', language: 'English', description: 'Interactive visual game teaching rebasing, cherry-picking, and branch manipulation.', link: 'https://learngitbranching.js.org/', isOfficial: false },
                { title: 'GitHub Skills Tutorials', provider: 'GitHub', type: 'Educational Website', difficulty: 'Beginner', language: 'English', description: 'Hands-on interactive repository challenges for Pull Requests and GitHub Actions.', link: 'https://skills.github.com/', isOfficial: true }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['git init', 'git add', 'git commit', 'git status', 'git log'], practiceTasks: ['Create local repo', 'Stage and commit files'], miniProject: 'Project Version Log', completionCriteria: 'Meaningful commit messages.' },
                { stage: '2. FOUNDATION', topics: ['git branch', 'git checkout / switch', 'git merge', 'Fast-forward merges'], practiceTasks: ['Create feature branch', 'Merge into main'], miniProject: 'Feature Branch Workflow', completionCriteria: 'Clean branch merges without conflicts.' },
                { stage: '3. PRACTICE', topics: ['Merge Conflicts Resolution', 'git diff', 'HEAD Pointer'], practiceTasks: ['Intentionally create and resolve conflict in two branches'], miniProject: 'Conflict Resolution Simulation', completionCriteria: 'Verify working code post-merge.' },
                { stage: '4. PROJECT', topics: ['Remotes', 'git push', 'git pull', 'git fetch', 'Tracking branches'], practiceTasks: ['Push to GitHub', 'Create pull request with review notes'], miniProject: 'Open-Source Pull Request Contribution', completionCriteria: 'PR reviewed and merged.' },
                { stage: '5. INTERMEDIATE', topics: ['git rebase', 'Interactive Rebase (git rebase -i)', 'Squashing Commits'], practiceTasks: ['Squash 4 messy commits into 1 atomic commit with rebase'], miniProject: 'Clean Git History Workshop', completionCriteria: 'Linear history produced.' },
                { stage: '6. ADVANCED', topics: ['git cherry-pick', 'git stash', 'git reset (--soft, --mixed, --hard)', 'git revert'], practiceTasks: ['Recover deleted branch using git reflog', 'Cherry-pick bugfix to main'], miniProject: 'Disaster Recovery with Git Reflog', completionCriteria: 'Zero lost commits in reflog recovery.' },
                { stage: '7. PORTFOLIO', topics: ['GitHub Actions CI Workflow', 'Branch Protection Rules', 'Code Review Protocols'], practiceTasks: ['Configure automated linting on PR', 'Enforce 1 approval before merge'], miniProject: 'Protected Enterprise Repository Setup', completionCriteria: 'Automated CI checks pass on all PRs.' },
                { stage: '8. INTERVIEW READY', topics: ['Git Internals (Blobs, Trees, Commits, Annotated Tags, DAG)'], practiceTasks: ['Inspect .git/objects directory and unpack SHA-1 hashes'], miniProject: 'Git Internals Architectural Breakdown', completionCriteria: 'Explain Git directed acyclic graph (DAG) structure.' }
            ],
            diagnosticQuestions: [
                'Can you explain the difference between git merge and git rebase?',
                'What is the difference between git reset --soft, --mixed, and --hard?',
                'How does Git store commits and files internally using SHA-1/SHA-256 hashes?',
                'Have you resolved a complex merge conflict involving multiple files?',
                'How can git reflog rescue commits that were accidentally detached or deleted?',
                'Have you set up GitHub Actions CI workflows to enforce lint and test passing on Pull Requests?'
            ],
            practiceQuestions: [
                { id: 'git1', question: 'What is the primary difference between "git merge" and "git rebase"?', options: ['Merge creates a merge commit preserving historical topology; rebase replays commits onto the target base creating a linear history', 'Merge deletes the branch while rebase preserves it', 'Rebase can only be used on remote repositories', 'There is no operational difference'], correctIndex: 0, explanation: 'Merge preserves the exact historical branching structure, whereas rebase rewrites commit history on top of the updated tip.' },
                { id: 'git2', question: 'Which command recovers a lost commit whose branch was accidentally deleted locally?', options: ['git reflog followed by git checkout <hash>', 'git push --force', 'git clean -fd', 'git fetch --all'], correctIndex: 0, explanation: 'git reflog records every movement of HEAD, allowing recovery of unreachable commits before garbage collection.' },
                { id: 'git3', question: 'What does "git reset --soft HEAD~1" do to the most recent commit?', options: ['It undoes the commit but leaves the changes staged in the index', 'It completely erases the commit and discards all file modifications', 'It pushes the commit to remote', 'It creates a revert commit'], correctIndex: 0, explanation: 'A --soft reset moves the branch pointer backward without touching the staging index or working directory.' },
                { id: 'git4', question: 'What is a "detached HEAD" state in Git?', options: ['A state where HEAD points directly to a specific commit rather than to a named branch', 'A corrupted Git database', 'When git pull fails due to network outage', 'When all branches are deleted'], correctIndex: 0, explanation: 'Checking out a specific commit hash or tag puts you in a detached HEAD state; new commits will be orphaned unless branched.' },
                { id: 'git5', question: 'Which file in the root of a Git repository specifies deliberately untracked files that Git should ignore?', options: ['.gitignore', '.gitattributes', '.gitmodules', '.gitconfig'], correctIndex: 0, explanation: '.gitignore contains glob patterns for build artifacts, node_modules, and secret credentials that should never be tracked.' }
            ],
            projectTemplate: {
                name: 'Production Repository Architecture with Branch Protection & Automated CI',
                description: 'Configure a production repository featuring Gitflow/Trunk-based workflow, automated GitHub Actions testing, code coverage gates, and semantic release tagging.'
            }
        },

        // --- HARDWARE & ELECTRONICS (ECE / EEE) ---
        verilog: {
            id: 'verilog',
            name: 'Verilog HDL & Digital Design',
            category: '⭐ Core Skills',
            branch: 'ECE',
            difficulty: 'Intermediate',
            whyItMatters: 'Fundamental hardware description language used in ASIC synthesis, FPGA prototyping, and semiconductor chip design.',
            whereToLearn: [
                { title: 'HDLBits Interactive Verilog Practice', provider: 'HDLBits / University of Toronto', type: 'Practice Platform', difficulty: 'Beginner', language: 'English', description: 'Step-by-step interactive browser-based digital circuit design exercises with waveform verification.', link: 'https://hdlbits.01xz.net/wiki/Main_Page', isOfficial: false },
                { title: 'ASIC World Verilog Tutorial', provider: 'ASIC World', type: 'Educational Website', difficulty: 'Beginner', language: 'English', description: 'Complete reference for combinational, sequential, and testbench constructs.', link: 'https://www.asic-world.com/verilog/veritut.html', isOfficial: false }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['Data Types (wire vs reg)', 'Module Ports', 'Bitwise Operators'], practiceTasks: ['Design 4-to-1 Multiplexer', 'Full Adder'], miniProject: 'Arithmetic Logic Unit (ALU) Slice', completionCriteria: 'Zero syntax errors in Icarus Verilog.' },
                { stage: '2. FOUNDATION', topics: ['Always Blocks (always @(*), always @(posedge clk))', 'Blocking vs Non-blocking Assignments'], practiceTasks: ['Design D-Flip Flop', 'Shift Register'], miniProject: 'Configurable 8-Bit Counter', completionCriteria: 'Correct non-blocking (<=) sequential assignment.' },
                { stage: '3. PRACTICE', topics: ['Finite State Machines (Moore vs Mealy)', 'State Encoding (Binary, One-hot)'], practiceTasks: ['Vending Machine FSM', 'Sequence Detector (1011)'], miniProject: 'Traffic Light Controller FSM', completionCriteria: 'Glitches eliminated in state transitions.' },
                { stage: '4. PROJECT', topics: ['Testbenches', '$monitor, $display, $dumpfile, $dumpvars', 'VCD Waveforms'], practiceTasks: ['Write comprehensive testbench for ALU with random stimuli'], miniProject: 'Self-Checking Verification Testbench', completionCriteria: 'Waveform verified in GTKWave.' },
                { stage: '5. INTERMEDIATE', topics: ['Synchronous vs Asynchronous Reset', 'Clock Dividers', 'Pipelining Basics'], practiceTasks: ['3-Stage Pipelined Multiplier'], miniProject: 'Digital Stop-Watch on FPGA', completionCriteria: 'Timing constraints met without hold violations.' },
                { stage: '6. ADVANCED', topics: ['Static Timing Analysis (Setup & Hold times)', 'Clock Domain Crossing (CDC)', 'Metastability & Synchronizers'], practiceTasks: ['Implement 2-Flip-Flop Synchronizer', 'Asynchronous FIFO'], miniProject: 'Dual-Clock Asynchronous FIFO Buffer', completionCriteria: 'Zero metastability in simulation.' },
                { stage: '7. PORTFOLIO', topics: ['Complete RISC-V 32I Core Design (Single Cycle / Pipelined)'], practiceTasks: ['Implement Instruction Decode, Execute, and Memory stages'], miniProject: 'Synthesizable RISC-V RV32I Processor', completionCriteria: 'Successfully run assembly sorting program in simulation.' },
                { stage: '8. INTERVIEW READY', topics: ['Setup/Hold Time Calculations', 'Metastability Resolution', 'FPGA Architecture (LUTs, BRAMs)'], practiceTasks: ['Solve timed STA calculation questions'], miniProject: 'FPGA Timing Closure Report Defense', completionCriteria: 'Defend timing budget in technical mock interview.' }
            ],
            diagnosticQuestions: [
                'Can you explain when to use blocking (=) vs non-blocking (<=) assignments in Verilog?',
                'What is the difference between a Mealy and a Moore state machine?',
                'How do you calculate Setup Time and Hold Time margins for a flip-flop timing path?',
                'How do you safely transfer multi-bit data across two independent clock domains?',
                'Have you written a self-checking testbench with automated assertion checks?',
                'Have you synthesized and deployed a design onto a physical FPGA development board?'
            ],
            practiceQuestions: [
                { id: 'vlg1', question: 'In sequential digital logic, why MUST non-blocking assignments (<=) be used inside an "always @(posedge clk)" block?', options: ['To prevent race conditions between registers evaluating at the same clock edge', 'Because blocking assignments are not supported by Verilog synthesis tools', 'To invert the clock phase', 'To force synchronous resets to act asynchronously'], correctIndex: 0, explanation: 'Non-blocking assignments evaluate their RHS concurrently and schedule updates at the end of the simulation time slot, preventing race conditions.' },
                { id: 'vlg2', question: 'What happens if a combinational "always @(*)" block contains an if-statement where not all conditional branches assign a value to a reg variable?', options: ['The compiler synthesizes an unintended transparent latch', 'The compiler reports a fatal syntax error', 'The signal becomes high-impedance (Z)', 'The register is converted into a flip-flop'], correctIndex: 0, explanation: 'Incomplete conditional assignments in combinational blocks infer unintended latches to hold the previous value, causing timing glitches.' },
                { id: 'vlg3', question: 'In a digital timing path, what is the maximum clock frequency if the register clock-to-Q delay is 2ns, combinational logic delay is 5ns, setup time is 1ns, and clock skew is 0ns?', options: ['125 MHz', '200 MHz', '100 MHz', '50 MHz'], correctIndex: 0, explanation: 'Minimum Clock Period T_min = T_clk_to_q + T_comb + T_setup = 2 + 5 + 1 = 8ns. Max frequency = 1 / 8ns = 125 MHz.' },
                { id: 'vlg4', question: 'Which state machine architecture output depends ONLY on the current state, and NOT directly on the current inputs?', options: ['Moore State Machine', 'Mealy State Machine', 'Combinational Multiplexer', 'Asynchronous Counter'], correctIndex: 0, explanation: 'Moore machine outputs are strictly a function of the current state registers, shielding them from asynchronous input glitches.' },
                { id: 'vlg5', question: 'Which circuit construct safely handles single-bit control signal transfer across asynchronous clock domains?', options: ['Two-flip-flop synchronizer (double-flop)', 'Standard tri-state buffer', 'A single pull-up resistor', 'A combinational XOR gate'], correctIndex: 0, explanation: 'A 2-FF synchronizer allows the first flip-flop an entire clock period to settle out of any metastable state before sampling by the target domain.' }
            ],
            projectTemplate: {
                name: 'Synthesizable 32-Bit Pipelined RISC-V Processor Core in Verilog',
                description: 'Design, verify, and simulate an RV32I core supporting arithmetic, load/store, branches, and hazard detection with forward-bypassing logic.'
            }
        },

        // --- MECHANICAL, CAD & ROBOTICS ---
        cad_solidworks: {
            id: 'cad_solidworks',
            name: 'CAD Modeling & SolidWorks / CATIA',
            category: '⭐ Core Skills',
            branch: 'MECH',
            difficulty: 'Intermediate',
            whyItMatters: 'Essential for mechanical parts design, 3D parametric modeling, assembly interference detection, and manufacturing drafting (GD&T).',
            whereToLearn: [
                { title: 'SolidWorks Official Certification & Tutorials', provider: 'Dassault Systèmes', type: 'Official Documentation', difficulty: 'Beginner', language: 'English', description: 'Official curriculum for CSWA (Certified SolidWorks Associate) certification.', link: 'https://www.solidworks.com/certifications', isOfficial: true },
                { title: 'MIT OCW Mechanical Engineering Design', provider: 'MIT OpenCourseWare', type: 'Educational Website', difficulty: 'Intermediate', language: 'English', description: 'Principles of mechanical engineering prototyping and machine design.', link: 'https://ocw.mit.edu/courses/2-007-design-and-manufacturing-i-spring-2009/', isOfficial: true }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['2D Sketching', 'Constraints (Coincident, Tangent, Concentric)', 'Dimensions'], practiceTasks: ['Fully define 2D mechanical profiles'], miniProject: 'Flange Plate Sketch', completionCriteria: '100% fully defined sketch (black lines, zero blue).' },
                { stage: '2. FOUNDATION', topics: ['Extrude Boss/Base', 'Extrude Cut', 'Revolve', 'Fillet & Chamfer'], practiceTasks: ['Model stepped transmission shaft', 'Hexagonal bolt'], miniProject: 'Stepped Drive Shaft Model', completionCriteria: 'Zero zero-thickness geometry errors.' },
                { stage: '3. PRACTICE', topics: ['Sweep', 'Loft', 'Shell', 'Reference Planes'], practiceTasks: ['Model exhaust manifold tube', 'Ergonomic handle'], miniProject: 'Curved Exhaust Pipe Manifold', completionCriteria: 'Smooth curvature continuity (G1/G2).' },
                { stage: '4. PROJECT', topics: ['3D Assembly Modeling', 'Standard Mates (Coincident, Concentric, Distance)'], practiceTasks: ['Assemble piston, connecting rod, and crankshaft'], miniProject: 'Single-Cylinder Engine Crank Mechanism', completionCriteria: 'Mechanism moves dynamically without interference.' },
                { stage: '5. INTERMEDIATE', topics: ['Geometric Dimensioning & Tolerancing (GD&T)', 'Engineering Drawings (ISO/ASME)'], practiceTasks: ['Create production drawing with datum features and position tolerances'], miniProject: 'Production-Ready Manufacturing Blueprint', completionCriteria: 'Complies with ASME Y14.5 standards.' },
                { stage: '6. ADVANCED', topics: ['Finite Element Analysis (FEA) Simulation', 'Von Mises Stress Analysis', 'Factor of Safety'], practiceTasks: ['Run static structural load simulation on suspension arm'], miniProject: 'Suspension Wishbone Stress Optimization', completionCriteria: 'Factor of Safety > 1.8 confirmed under maximum design load.' },
                { stage: '7. PORTFOLIO', topics: ['Complete Complex Robotic Arm / Gearbox Assembly with 50+ Parts'], practiceTasks: ['Design 2-stage planetary reduction gearbox'], miniProject: 'Precision Planetary Gearbox CAD Suite', completionCriteria: 'Bill of Materials (BOM) and exploded animation rendered.' },
                { stage: '8. INTERVIEW READY', topics: ['Design for Manufacturing & Assembly (DFMA)', 'Draft Angle for Injection Molding'], practiceTasks: ['Present CAD design choices and tolerance stackup'], miniProject: 'DFMA Design Review Presentation', completionCriteria: 'Defend material selection and tolerance stackup.' }
            ],
            diagnosticQuestions: [
                'How do you ensure a 2D sketch is fully defined before generating 3D features in CAD?',
                'Can you apply Geometric Dimensioning & Tolerancing (GD&T) datums and position tolerances?',
                'How do you detect physical collisions and dynamic interference in a 50+ part mechanical assembly?',
                'Can you conduct a basic linear static FEA simulation and interpret Von Mises stress concentrations?',
                'What design modifications are required when designing parts for CNC milling vs plastic injection molding?',
                'Have you built a dynamic mechanical mechanism assembly with kinematic motion limits?'
            ],
            practiceQuestions: [
                { id: 'cad1', question: 'In parametric CAD sketching, what visual indicator confirms that a sketch is fully constrained and defined in SolidWorks?', options: ['All sketch geometry lines turn black', 'The lines turn bright blue', 'The lines flash yellow', 'The cursor changes into a lock icon'], correctIndex: 0, explanation: 'In SolidWorks, under-defined entities are blue, fully defined entities turn black, and over-defined entities turn red or yellow.' },
                { id: 'cad2', question: 'Which GD&T symbol specifies the maximum permissible deviation of a cylindrical feature center axis relative to primary, secondary, and tertiary datum references?', options: ['True Position', 'Concentricity', 'Parallelism', 'Runout'], correctIndex: 0, explanation: 'True Position controls the exact location of a feature center, axis, or plane relative to datum reference frames.' },
                { id: 'cad3', question: 'In Finite Element Analysis (FEA), what is the definition of the Factor of Safety (FoS) for ductile metals?', options: ['Yield Strength divided by Maximum Von Mises Stress', 'Ultimate Tensile Strength multiplied by load', 'Deformation divided by original length', 'Poisson ratio divided by Young Modulus'], correctIndex: 0, explanation: 'Factor of Safety FoS = Yield Strength / Max Von Mises Stress. An FoS > 1.0 indicates no permanent plastic deformation.' },
                { id: 'cad4', question: 'Why must draft angles (typically 1° to 3°) be incorporated into CAD models of parts designed for plastic injection molding?', options: ['To allow the molded plastic part to be ejected cleanly from the metal mold core without tearing or scoring', 'To increase structural stiffness only', 'To make 3D printing faster', 'To reduce CAD file size'], correctIndex: 0, explanation: 'Draft angles ensure that as the plastic cools and shrinks, it pulls away from the mold walls, allowing clean ejection.' },
                { id: 'cad5', question: 'What is the primary function of an assembly "Interference Detection" tool in 3D CAD modeling?', options: ['To identify overlapping physical solid volumes between parts that would prevent physical manufacturing or assembly', 'To check for electrical shorts in wires', 'To speed up rendering frame rate', 'To delete duplicate part files'], correctIndex: 0, explanation: 'Interference detection scans all solid bodies in an assembly to report physical volume overlaps that would cause collision in real life.' }
            ],
            projectTemplate: {
                name: 'Complete 6-DOF Robotic Arm Mechanical Assembly & FEA Optimization',
                description: 'Design a 6-axis robotic manipulator assembly in SolidWorks with motor mounts, bearing fits, GD&T manufacturing drawings, and structural stress validation.'
            }
        },

        // --- CIVIL & STRUCTURAL ENGINEERING ---
        staad_pro: {
            id: 'staad_pro',
            name: 'Structural Analysis (STAAD.Pro / ETABS)',
            category: '⭐ Core Skills',
            branch: 'CIVIL',
            difficulty: 'Intermediate',
            whyItMatters: 'Standard computational tools for structural analysis of high-rise buildings, bridges, seismic load distribution, and reinforced concrete design.',
            whereToLearn: [
                { title: 'Bentley STAAD.Pro Official Training', provider: 'Bentley Systems', type: 'Official Documentation', difficulty: 'Intermediate', language: 'English', description: 'Official structural modeling, FEM frame analysis, and code compliance tutorials.', link: 'https://www.bentley.com/software/staad/', isOfficial: true },
                { title: 'NPTEL: Structural Analysis I & II', provider: 'IIT Kharagpur / NPTEL', type: 'Educational Website', difficulty: 'Intermediate', language: 'English', description: 'Comprehensive lecture series on matrix stiffness methods and structural mechanics.', link: 'https://nptel.ac.in/courses/105105166', isOfficial: true }
            ],
            roadmap: [
                { stage: '1. BEGINNER', topics: ['Structural Nodes & Beams', 'Support Conditions (Pinned, Fixed, Roller)', 'Material Properties'], practiceTasks: ['Model simply supported beam', 'Cantilever deflection'], miniProject: 'Single-Bay Portal Frame Analysis', completionCriteria: 'Reactions match analytical equilibrium equations.' },
                { stage: '2. FOUNDATION', topics: ['Dead Loads (DL)', 'Live Loads (LL)', 'Load Combinations (IS 875 / ASCE 7)'], practiceTasks: ['Apply floor live loads', 'Self-weight assignment'], miniProject: '2-Story Residential Frame Load Setup', completionCriteria: 'Load combinations generated per building code.' },
                { stage: '3. PRACTICE', topics: ['Shear Force Diagrams (SFD)', 'Bending Moment Diagrams (BMD)', 'Deflection Checks'], practiceTasks: ['Extract maximum sagging and hogging moments'], miniProject: 'Continuous Multi-Span Beam Analysis', completionCriteria: 'Deflection within permissible L/325 limits.' },
                { stage: '4. PROJECT', topics: ['3D Multi-Storey Building Modeling', 'Plate/Slab Finite Elements', 'Column Axial Loads'], practiceTasks: ['Model G+4 commercial building skeleton'], miniProject: 'G+4 Commercial Building 3D Analysis', completionCriteria: 'Zero instability warnings in analysis engine.' },
                { stage: '5. INTERMEDIATE', topics: ['Wind Load Calculation', 'Lateral Force Distribution', 'Gust Factor Analysis'], practiceTasks: ['Apply lateral wind pressure to building face'], miniProject: 'Wind-Resistant High-Rise Frame Evaluation', completionCriteria: 'Drift limits verified per code.' },
                { stage: '6. ADVANCED', topics: ['Seismic Analysis (Response Spectrum & Equivalent Static)', 'Base Shear', 'Torsional Irregularity'], practiceTasks: ['Perform Response Spectrum analysis for Seismic Zone V'], miniProject: 'Earthquake Resilient Building Simulation', completionCriteria: 'Base shear matched with empirical static code formula.' },
                { stage: '7. PORTFOLIO', topics: ['Concrete Reinforcement Design (Columns, Beams, Footings)', 'Schedule of Steel'], practiceTasks: ['Export structural detailing and rebar schedules'], miniProject: 'Complete Structural Engineering Package for G+10 Tower', completionCriteria: 'Detailed rebar drawings and structural design report.' },
                { stage: '8. INTERVIEW READY', topics: ['Codes of Practice Defense (IS 456, IS 1893, ACI 318)', 'Structural Failure Modes'], practiceTasks: ['Defend column reinforcement and ductility detailing choices'], miniProject: 'Structural Peer Review Audit', completionCriteria: 'Articulate structural load paths and seismic resilience.' }
            ],
            diagnosticQuestions: [
                'Can you explain the load path from floor slab down to the foundation in a reinforced concrete structure?',
                'How do you model and apply seismic lateral loads using the Response Spectrum method?',
                'What is the difference between a fixed support and a pinned support in terms of degrees of freedom and reactions?',
                'How do you check for storey drift and torsional irregularity in a high-rise building?',
                'Can you interpret Bending Moment Diagrams (BMD) to design longitudinal steel reinforcement?',
                'Have you performed structural analysis of a multi-storey building adhering to national building codes?'
            ],
            practiceQuestions: [
                { id: 'st1', question: 'In structural mechanics, how many reaction components exist for an idealized 2D Fixed Support?', options: ['Three: Horizontal force (Rx), Vertical force (Ry), and Moment (Mz)', 'Two: Horizontal and Vertical force only', 'One: Vertical force only', 'Six reactions'], correctIndex: 0, explanation: 'A 2D fixed support restrains translation in X, translation in Y, and rotation about Z, creating three reaction components.' },
                { id: 'st2', question: 'In reinforced concrete beam design, where does the maximum tension occur in a propped cantilever beam under uniform gravity load?', options: ['At the top fibers adjacent to the fixed support (hogging moment)', 'At the bottom fiber at the roller support', 'At the exact mid-span top fiber', 'Nowhere, concrete resists all tension'], correctIndex: 0, explanation: 'Fixed end moments induce hogging (negative moment), placing the top fibers in tension and requiring top tension reinforcement.' },
                { id: 'st3', question: 'What is the primary objective of the "Response Spectrum Method" in structural earthquake engineering?', options: ['To estimate peak structural response (forces and displacements) across dynamic vibration modes under seismic ground motion', 'To check for corrosion in rebar', 'To measure acoustic reverberation in rooms', 'To design water supply pipes'], correctIndex: 0, explanation: 'Response spectrum analysis calculates the maximum dynamic modal response of a building structure subjected to earthquake ground acceleration.' },
                { id: 'st4', question: 'What structural defect occurs when the center of mass and center of stiffness of a building floor do not coincide?', options: ['Torsional twist under lateral seismic or wind forces', 'Immediate foundation settlement', 'Thermal expansion only', 'Excessive dead weight'], correctIndex: 0, explanation: 'Eccentricity between the center of mass and center of rigidity produces an unintended twisting moment (torsion) during lateral shaking.' },
                { id: 'st5', question: 'Which Indian / International Standard code governs the criteria for earthquake resistant design of structures?', options: ['IS 1893 / ASCE 7', 'IS 456 only', 'IS 875 Part 1 only', 'ISO 9001'], correctIndex: 0, explanation: 'IS 1893 (Part 1) is the standard code of practice for earthquake resistant design of structures in India, mirrored by ASCE 7 / IBC globally.' }
            ],
            projectTemplate: {
                name: 'Complete Structural Modeling & Seismic Resilience Analysis of G+8 Building',
                description: 'Model a multi-storey RCC frame in STAAD.Pro/ETABS, apply dead, live, wind, and seismic response spectrum loads, and produce rebar detailing compliant with building codes.'
            }
        }
    },

    // 2. Career Roles Taxonomy & Mapping (Across Engineering Disciplines)
    careers: {
        // Computer Science & IT Tracks
        sde: {
            id: 'sde',
            title: 'Software Development Engineer (SDE)',
            branch: 'CSE',
            description: 'Designs, builds, and maintains scalable software applications, backend services, and high-performance algorithms.',
            skills: ['dsa', 'python', 'sql', 'git', 'docker'],
            coreFocus: 'Data Structures, Algorithmic Efficiency, System Architecture, Code Reliability'
        },
        fullstack: {
            id: 'fullstack',
            title: 'Full-Stack Web Architect',
            branch: 'CSE',
            description: 'Architects end-to-end web applications covering responsive frontend UI, REST/GraphQL APIs, and database persistence.',
            skills: ['python', 'sql', 'git', 'docker', 'dsa'],
            coreFocus: 'API Design, Frontend State Management, Relational Schema, Cloud Deployment'
        },
        aiml_engineer: {
            id: 'aiml_engineer',
            title: 'Machine Learning & AI Engineer',
            branch: 'AIML',
            description: 'Develops predictive machine learning models, deep neural networks, and scalable AI inference pipelines.',
            skills: ['python', 'dsa', 'sql', 'docker', 'git'],
            coreFocus: 'Statistical Modeling, Neural Networks, Feature Engineering, MLOps Deployment'
        },
        cloud_devops: {
            id: 'cloud_devops',
            title: 'Cloud Infrastructure & DevOps Engineer',
            branch: 'IT',
            description: 'Automates CI/CD pipelines, container orchestration, cloud security, and high-availability infrastructure.',
            skills: ['docker', 'git', 'python', 'sql', 'dsa'],
            coreFocus: 'Containerization, IaC, CI/CD Automation, System Observability'
        },
        data_analyst: {
            id: 'data_analyst',
            title: 'Data Analyst & BI Specialist',
            branch: 'DS',
            description: 'Extracts actionable business intelligence, builds analytical dashboards, and writes optimized analytical queries.',
            skills: ['sql', 'python', 'git'],
            coreFocus: 'Complex SQL Aggregations, Statistical Inference, Data Storytelling'
        },

        // Electronics & Communication Tracks
        vlsi_engineer: {
            id: 'vlsi_engineer',
            title: 'VLSI Digital Design Engineer',
            branch: 'ECE',
            description: 'Designs digital integrated circuits, RTL microarchitectures, and conducts static timing analysis for silicon chips.',
            skills: ['verilog', 'git', 'python'],
            coreFocus: 'Verilog Synthesis, Static Timing Analysis, FSM Optimization, FPGA Prototyping'
        },
        embedded_engineer: {
            id: 'embedded_engineer',
            title: 'Embedded Systems & Firmware Developer',
            branch: 'ECE',
            description: 'Programs microcontrollers, real-time operating systems (RTOS), and hardware communication protocols (CAN/SPI/I2C).',
            skills: ['verilog', 'git', 'python'],
            coreFocus: 'Firmware Development, Hardware-Software Co-Design, Peripheral Interfacing'
        },

        // Mechanical & Industrial Tracks
        cad_engineer: {
            id: 'cad_engineer',
            title: 'Mechanical Design & CAD/CAM Engineer',
            branch: 'MECH',
            description: 'Creates 3D parametric CAD models, conducts FEA stress simulations, and produces manufacturing drawings.',
            skills: ['cad_solidworks', 'git'],
            coreFocus: 'Parametric CAD Modeling, GD&T Tolerancing, FEA Simulation, DFMA Principles'
        },
        robotics_engineer: {
            id: 'robotics_engineer',
            title: 'Robotics & Automation Systems Engineer',
            branch: 'MECHTRON',
            description: 'Designs autonomous robotic mechanisms, kinematics, sensor integration, and motion planning algorithms.',
            skills: ['python', 'cad_solidworks', 'git', 'dsa'],
            coreFocus: 'Robot Kinematics, ROS Software, Embedded Motion Control, Actuator Design'
        },

        // Civil & Structural Tracks
        structural_engineer: {
            id: 'structural_engineer',
            title: 'Structural Design & Analysis Engineer',
            branch: 'CIVIL',
            description: 'Performs computational structural analysis for high-rise buildings, bridges, and earthquake-resilient foundations.',
            skills: ['staad_pro', 'cad_solidworks'],
            coreFocus: 'Finite Element Frame Analysis, Building Code Compliance, Seismic Detailing'
        }
    },

    // Helper: Get careers by engineering branch code
    getCareersForBranch(branchCode = 'CSE') {
        const normalized = (branchCode || 'CSE').toUpperCase();
        const list = Object.values(this.careers).filter(c => c.branch === normalized);
        if (list.length > 0) return list;

        // Fallback matching related disciplines
        if (['IT', 'AIML', 'DS', 'AIDS', 'CSIT', 'SE', 'CYBER', 'CLOUD'].includes(normalized)) {
            return Object.values(this.careers).filter(c => ['CSE', 'AIML', 'IT', 'DS'].includes(c.branch));
        }
        if (['EEE', 'EIE', 'VLSI', 'EMBEDDED'].includes(normalized)) {
            return Object.values(this.careers).filter(c => ['ECE'].includes(c.branch));
        }
        if (['AUTO', 'MECHTRON', 'ROBOTICS', 'MFG', 'IND'].includes(normalized)) {
            return Object.values(this.careers).filter(c => ['MECH', 'MECHTRON'].includes(c.branch));
        }
        if (['STRUCT', 'CONST', 'TRANS', 'ENV'].includes(normalized)) {
            return Object.values(this.careers).filter(c => ['CIVIL'].includes(c.branch));
        }

        return Object.values(this.careers);
    },

    // Helper: Get skills for selected career
    getSkillsForCareer(careerId) {
        const career = this.careers[careerId] || this.careers.sde;
        const skillList = [];
        career.skills.forEach(sid => {
            if (this.skills[sid]) {
                skillList.push(this.skills[sid]);
            }
        });
        return skillList;
    },

    // Helper: Get single skill details
    getSkill(skillId) {
        return this.skills[skillId] || this.skills.python;
    }
};

// Export to window
if (typeof window !== 'undefined') {
    window.SkillsCatalog = SkillsCatalog;
}
if (typeof module !== 'undefined') {
    module.exports = SkillsCatalog;
}
