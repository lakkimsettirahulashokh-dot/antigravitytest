const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'data', 'branch_learning_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

if (catalog.CSE) {
    const additionalModules = [
        {
            id: 'module-3',
            title: 'Module 3: Operating Systems, Concurrency & Systems Programming',
            badge: 'Systems & Kernels',
            semesterRecommendation: [3, 4, 5],
            topics: [
                {
                    id: 'cse-os-kernel',
                    name: 'Kernel Architecture, Process Scheduling & Context Switching',
                    content: 'Core operating system foundations:\n• Monolithic vs. Microkernel architectures (Linux vs. Mach/seL4).\n• Process State Model: New, Ready, Running, Waiting, Terminated.\n• CPU Scheduling: Completely Fair Scheduler (CFS with Red-Black tree virtual runtime), Multi-Level Feedback Queues (MLFQ), Round Robin with time-quantum trade-offs.\n• Context Switching: Register state preservation, Program Counter saving, TLB invalidation cost, and user-space to kernel-space transition overhead.'
                },
                {
                    id: 'cse-memory-management',
                    name: 'Virtual Memory, Paging, TLB & Memory Allocation',
                    content: 'Hardware-level virtual memory mapping:\n• Multi-Level Page Tables & Inverted Page Tables: Translating 48-bit canonical virtual addresses to 52-bit physical RAM addresses.\n• Translation Lookaside Buffer (TLB): Hardware associative cache; hit ratio impact on effective memory access time (EMAT = h*(t_tlb + t_ram) + (1-h)*(t_tlb + 2*t_ram)).\n• Page Replacement Algorithms: LRU, Clock algorithm, and Working Set model preventing trashing.\n• Dynamic Memory Allocators: Free list management, Buddy Allocator, slab allocation, and internal/external fragmentation mitigation.'
                },
                {
                    id: 'cse-concurrency-sync',
                    name: 'Concurrency, Synchronization Primitives & Deadlocks',
                    content: 'Multi-threaded software guarantees:\n• Race Conditions & Critical Section: Mutual exclusion, progress, and bounded waiting.\n• Synchronization Primitives: Mutexes, Semaphores (counting vs. binary), Spinlocks, Condition Variables, and Atomic Compare-And-Swap (CAS) instructions.\n• Deadlock Analysis: Coffman Conditions (Mutual exclusion, Hold and wait, No preemption, Circular wait). Banker\'s algorithm for deadlock avoidance; wait-for graphs for detection.\n• Lock-Free Data Structures: Memory barriers, cache coherency protocols (MESI), and hazard pointers.'
                },
                {
                    id: 'cse-ipc-syscalls',
                    name: 'Inter-Process Communication (IPC) & POSIX System Calls',
                    content: 'Process boundary crossings:\n• IPC Mechanisms: Anonymous/Named Pipes, POSIX Shared Memory (shm_open), Message Queues, Unix Domain Sockets.\n• System Call Mechanics: Software interrupts (int 0x80 / syscall instruction), trap handlers, and kernel privilege level escalation.\n• File Systems: Inodes, superblocks, journaling (ext4 JBD2), and VFS (Virtual File System) abstraction layer.'
                }
            ]
        },
        {
            id: 'module-4',
            title: 'Module 4: Database Internals, Storage Engines & Query Optimization',
            badge: 'Data Infrastructure',
            semesterRecommendation: [5, 6],
            topics: [
                {
                    id: 'cse-storage-engines',
                    name: 'Storage Engines: B+ Trees vs. Log-Structured Merge (LSM) Trees',
                    content: 'Low-level persistence and disk I/O architectures:\n• B+ Trees (e.g., PostgreSQL, InnoDB): Fanout, node splitting, pointer chasing, high read efficiency (O(log_B N) disk seeks), and random write amplification.\n• LSM-Trees (e.g., RocksDB, Cassandra): MemTable in RAM, Write-Ahead Log (WAL), immutable SSTables on disk, tiered/leveled compaction, Bloom filters mitigating point lookup latency.\n• Disk I/O & SSD Characteristics: Sequential writes vs. random block writes, Flash Translation Layer (FTL), write amplification factor (WAF).'
                },
                {
                    id: 'cse-acid-transactions',
                    name: 'ACID Guarantees, Concurrency Control & Write-Ahead Logging',
                    content: 'Transaction safety mechanics:\n• Atomicity & Durability: ARIES recovery algorithm, Write-Ahead Logging (WAL) protocol ensuring uncommitted transactions can be rolled back and committed changes survive power failure.\n• Isolation Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable. Anomalies: Dirty reads, non-repeatable reads, phantom reads, and write skew.\n• Multi-Version Concurrency Control (MVCC): Row snapshot visibility using transaction IDs, garbage collecting obsolete tuple versions without locking readers.'
                },
                {
                    id: 'cse-query-optimizer',
                    name: 'Relational Query Optimization & Indexing Strategies',
                    content: 'SQL execution pipeline:\n• Parser, Abstract Syntax Tree (AST), Logical Query Plan, and Cost-Based Optimizer (CBO) computing join order permutations (System R dynamic programming).\n• Join Algorithms: Nested Loop, Hash Join (grace hash join with partition spilling), and Sort-Merge Join.\n• Advanced Indexing: Clustered vs. Secondary indexes, Covering indexes, B-Tree prefix compression, GiST and GIN indexes for inverted text search.'
                }
            ]
        },
        {
            id: 'module-5',
            title: 'Module 5: Industry Roles, Capstones, Career Roadmap & Technical Interview Bank',
            badge: 'Career Acceleration',
            semesterRecommendation: [7, 8],
            topics: [
                {
                    id: 'cse-career-roles',
                    name: 'Target High-Growth Software Engineering Careers',
                    content: 'Premier industry software careers:\n• Software Development Engineer (SDE I/II): Designs fault-tolerant microservices, resilient APIs, and enterprise software systems.\n• Distributed Systems / Infrastructure Engineer: Builds high-throughput streaming pipelines, consensus clusters, and database storage engines.\n• Cloud Architect & Site Reliability Engineer (SRE): Manages multi-region Kubernetes clusters, observability pipelines, and disaster recovery SLA guarantees.\n• Systems / Kernel Engineer: Programs low-level C/C++/Rust systems, device drivers, embedded software, and real-time audio/video codecs.'
                },
                {
                    id: 'cse-learning-roadmap',
                    name: 'Semester-by-Semester Academic Roadmap',
                    content: '• Sem 1-2 (Foundation): Programming in C/Python, Discrete Mathematics, Digital Logic Design, Basic Data Structures.\n• Sem 3-4 (Core Systems): Advanced Data Structures & Algorithms, Computer Organization & Architecture, Operating Systems, Database Management Systems.\n• Sem 5-6 (Advanced Engineering): Computer Networks, Distributed Systems, Software Engineering & Design Patterns, Compiler Design, Web & Cloud Engineering.\n• Sem 7-8 (Mastery & Placement): High-Scale System Design, Artificial Intelligence / Machine Learning, Capstone Production Project, Technical Interview Drills.'
                },
                {
                    id: 'cse-capstone-projects',
                    name: 'High-Impact Portfolio Projects',
                    content: '1. Distributed Key-Value Store with Raft Consensus: Implemented in Go/Rust with leader election, log replication, snapshotting, and fault recovery under simulated network partitions.\n2. High-Performance L7 Reverse Proxy & Load Balancer: Built in C/C++ using epoll asynchronous event loops, zero-copy socket transfers, and dynamic health checking.\n3. Microservices E-Commerce Core with Event Sourcing: Architected with Spring Boot / Node.js, Apache Kafka, transactional outbox pattern, and distributed tracing via OpenTelemetry.'
                },
                {
                    id: 'cse-interview-questions',
                    name: 'Top Computer Science Technical Interview Bank',
                    content: 'Q1: Explain how an LSM-tree achieves superior write performance compared to a B+ tree.\nA: In a B+ tree, every write operation must update pages directly on disk, causing random I/O and disk seeks. In contrast, an LSM-tree writes all incoming mutations sequentially to an in-memory MemTable and an append-only Write-Ahead Log (WAL). Sequential disk writes are orders of magnitude faster than random writes. When the MemTable fills, it flushes sequentially to disk as an immutable SSTable. Periodic background compaction merges and cleans old SSTables without blocking write throughput.\n\nQ2: What is the difference between a process and a thread, and how does Linux represent both?\nA: A process is an independent execution unit with its own private virtual address space, file descriptor table, and security context. A thread is an execution context within a process that shares the same virtual address space, heap, and file descriptors but maintains its own program counter, stack, and register set. In Linux, the kernel makes no fundamental structural distinction: both processes and threads are represented as `struct task_struct`. The `clone()` system call creates them; passing `CLONE_VM`, `CLONE_FILES`, and `CLONE_FS` shares the address space and resources, creating a thread.\n\nQ3: What is the CAP theorem, and how does PACELC expand upon it?\nA: The CAP theorem states that a distributed data store can guarantee at most two out of Consistency, Availability, and Partition Tolerance under a network partition. PACELC expands this by recognizing that partitions are rare: If there is a Partition (P), how does the system trade Availability (A) versus Consistency (C); Else (E), when running normally without partitions, how does the system trade Latency (L) versus Consistency (C)?'
                }
            ]
        }
    ];

    catalog.CSE.modules = catalog.CSE.modules.slice(0, 2).concat(additionalModules);
    catalog.CSE.topicsCount = 25;
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log('Successfully expanded CSE to 5 modules with 25 topics in catalog.');
}
