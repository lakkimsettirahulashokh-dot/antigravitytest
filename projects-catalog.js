// projects-catalog.js - Authoritative Projects Hub & Multi-Department Architecture
// Provides 24-section comprehensive project guides and full B.Tech engineering departments

const ALL_DEPARTMENTS = [
    // Computing & Information Sciences
    { code: 'CSE', name: 'Computer Science & Engineering', category: 'Computing', icon: 'computer' },
    { code: 'IT', name: 'Information Technology', category: 'Computing', icon: 'lan' },
    { code: 'AI', name: 'Artificial Intelligence', category: 'Computing', icon: 'smart_toy' },
    { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', category: 'Computing', icon: 'psychology' },
    { code: 'DS', name: 'Data Science', category: 'Computing', icon: 'analytics' },
    { code: 'AIDS', name: 'AI & Data Science', category: 'Computing', icon: 'query_stats' },
    { code: 'CSIT', name: 'Computer Science & Information Technology', category: 'Computing', icon: 'lan' },
    { code: 'SE', name: 'Software Engineering', category: 'Computing', icon: 'code' },
    { code: 'CLOUD', name: 'Cloud Computing & DevOps', category: 'Computing', icon: 'cloud' },
    { code: 'BLOCK', name: 'Blockchain Technology', category: 'Computing', icon: 'currency_bitcoin' },
    { code: 'IOT', name: 'Internet of Things (IoT)', category: 'Computing', icon: 'sensors' },
    { code: 'CYBER', name: 'Cyber Security & Digital Forensics', category: 'Computing', icon: 'security' },

    // Electrical & Electronics
    { code: 'ECE', name: 'Electronics & Communication Engineering', category: 'Electrical', icon: 'settings_input_antenna' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering', category: 'Electrical', icon: 'bolt' },
    { code: 'EIE', name: 'Electronics & Instrumentation Engineering', category: 'Electrical', icon: 'tune' },
    { code: 'VLSI', name: 'VLSI & Microelectronics', category: 'Electrical', icon: 'memory' },
    { code: 'EMBEDDED', name: 'Embedded Systems', category: 'Electrical', icon: 'developer_board' },
    { code: 'POWER', name: 'Power Engineering & Smart Grids', category: 'Electrical', icon: 'electric_meter' },

    // Mechanical, Robotics & Industrial
    { code: 'MECH', name: 'Mechanical Engineering', category: 'Mechanical', icon: 'precision_manufacturing' },
    { code: 'AUTO', name: 'Automobile & EV Engineering', category: 'Mechanical', icon: 'directions_car' },
    { code: 'MECHTRON', name: 'Mechatronics Engineering', category: 'Mechanical', icon: 'smart_toy' },
    { code: 'ROBOTICS', name: 'Robotics Engineering', category: 'Mechanical', icon: 'precision_manufacturing' },
    { code: 'MFG', name: 'Manufacturing Engineering', category: 'Mechanical', icon: 'factory' },
    { code: 'IND', name: 'Industrial & Production Engineering', category: 'Mechanical', icon: 'conveyor_belt' },

    // Civil, Structural & Environmental
    { code: 'CIVIL', name: 'Civil Engineering', category: 'Civil', icon: 'apartment' },
    { code: 'STRUCT', name: 'Structural Engineering', category: 'Civil', icon: 'domain' },
    { code: 'CONST', name: 'Construction Engineering & Management', category: 'Civil', icon: 'construction' },
    { code: 'TRANS', name: 'Transportation Engineering', category: 'Civil', icon: 'traffic' },
    { code: 'ENV', name: 'Environmental Engineering', category: 'Civil', icon: 'eco' },
    { code: 'GEO', name: 'Geotechnical Engineering', category: 'Civil', icon: 'landscape' },

    // Chemical, Materials & Energy
    { code: 'CHEM', name: 'Chemical Engineering', category: 'Chemical', icon: 'science' },
    { code: 'PETRO', name: 'Petroleum Engineering', category: 'Chemical', icon: 'oil_barrel' },
    { code: 'MAT', name: 'Materials & Metallurgy Engineering', category: 'Chemical', icon: 'volcano' },
    { code: 'ENERGY', name: 'Renewable Energy & Clean Tech', category: 'Chemical', icon: 'solar_power' },

    // Biotech, Biomedical & Life Sciences
    { code: 'BIOTECH', name: 'Biotechnology Engineering', category: 'Biotech', icon: 'biotech' },
    { code: 'BIOMED', name: 'Biomedical Engineering', category: 'Biotech', icon: 'medical_services' },
    { code: 'BIOINFO', name: 'Bioinformatics Engineering', category: 'Biotech', icon: 'dna' },

    // Aerospace, Defense & Marine
    { code: 'AERO', name: 'Aerospace Engineering', category: 'Aerospace', icon: 'rocket_launch' },
    { code: 'AERONAUT', name: 'Aeronautical Engineering', category: 'Aerospace', icon: 'flight' },
    { code: 'AVIONICS', name: 'Avionics Engineering', category: 'Aerospace', icon: 'satellite_alt' },
    { code: 'MARINE', name: 'Marine Engineering & Ocean Tech', category: 'Aerospace', icon: 'directions_boat' },

    // Agriculture, Food & Specialized
    { code: 'AGRI', name: 'Agricultural & Food Engineering', category: 'Specialized', icon: 'agriculture' },
    { code: 'FOOD', name: 'Food Technology & Process Engineering', category: 'Specialized', icon: 'restaurant' },
    { code: 'TEXTILE', name: 'Textile & Fiber Technology', category: 'Specialized', icon: 'texture' }
];

const MASTER_PROJECTS_CATALOG = [
    // -------------------------------------------------------------------------
    // 1. COMPUTING / AI CAPSTONE
    // -------------------------------------------------------------------------
    {
        id: 'proj-edge-ai-vision',
        title: 'AutoVision: Real-Time Edge AI Defect Classifier with TensorRT & YOLOv8',
        slug: 'autovision-edge-ai-defect-classifier',
        category: 'Computing',
        departments: ['AIML', 'AI', 'CSE', 'DS', 'AIDS', 'ROBOTICS', 'MECHTRON', 'ECE'],
        years: [3, 4],
        semesters: [5, 6, 7, 8],
        difficulty: 'Production Capstone',
        durationWeeks: 6,
        estimatedHours: 80,
        overview: 'A high-throughput computer vision pipeline running quantized YOLOv8 object detection and defect classification models optimized with NVIDIA TensorRT on edge embedded hardware. Designed for automated industrial manufacturing quality assurance.',
        problemStatement: 'Manual visual inspection on factory assembly lines suffers from a 12-18% error rate, human fatigue, and slow throughput (under 10 parts/min). Cloud-based computer vision solutions introduce unfeasible network latency (>300ms) and bandwidth costs for high-resolution video streams.',
        whyBuildIt: 'Demonstrates end-to-end edge AI engineering: model training, INT8 quantization, C++ TensorRT runtime execution, hardware acceleration, and industrial IoT integration. Highly sought after by Tier-1 OEMs, robotics startups, and semiconductor firms.',
        whoItIsFor: '3rd and 4th year students targeting Computer Vision Engineer, MLOps Specialist, Robotics Perception, and Embedded AI roles.',
        objective: 'Build an autonomous inspection workstation that captures 1080p camera frames at 60+ FPS, classifies structural surface defects with >96% mAP, and triggers automated pneumatic reject actuators via GPIO within 25 milliseconds.',
        expectedOutput: 'A functional edge service with a live web dashboard showing realtime bounding-box detections, defect confidence scores, FPS telemetry, and historical inspection logs in PostgreSQL.',
        prerequisites: [
            'Python 3.10+ and PyTorch fundamentals',
            'Basic knowledge of Convolutional Neural Networks (CNNs)',
            'Linux terminal navigation and Docker fundamentals',
            'Understanding of precision trade-offs (FP32 vs FP16 vs INT8)'
        ],
        requiredSkills: [
            { name: 'PyTorch & YOLOv8', category: 'AI/ML', level: 'Intermediate' },
            { name: 'NVIDIA TensorRT / ONNX', category: 'Acceleration', level: 'Intermediate' },
            { name: 'FastAPI & WebSockets', category: 'Backend', level: 'Intermediate' },
            { name: 'Docker & Linux', category: 'DevOps', level: 'Intermediate' },
            { name: 'PostgreSQL', category: 'Database', level: 'Beginner' }
        ],
        techStack: {
            frontend: ['Tailwind CSS', 'Chart.js', 'HTML5 Canvas', 'Vanilla JS'],
            backend: ['Python 3.11', 'FastAPI', 'Uvicorn', 'OpenCV'],
            ai: ['Ultralytics YOLOv8', 'ONNX Runtime', 'TensorRT 8.6'],
            database: ['PostgreSQL', 'Redis (Frame Queue)'],
            devops: ['Docker Compose', 'NVIDIA Container Toolkit']
        },
        hardwareRequirements: [
            'Host PC with NVIDIA GPU (GTX 1650 or higher / Jetson Orin Nano / Jetson Xavier)',
            'USB 3.0 or RTSP IP Camera (1080p 30+ FPS)',
            'Microcontroller (ESP32/Arduino) for GPIO actuator simulation (optional)'
        ],
        softwareRequirements: [
            'Ubuntu 22.04 LTS or Windows 11 with WSL2',
            'CUDA Toolkit 12.1 + cuDNN 8.9',
            'Python 3.11 + Virtualenv',
            'Docker Desktop'
        ],
        howItWorks: `Camera Feed (1080p)
   ↓
OpenCV VideoCapture Thread
   ↓
Shared Ring Buffer / Redis Queue
   ↓
Preprocessing (Resize 640x640, Normalization, RGB to BGR)
   ↓
TensorRT Execution Engine (INT8 Quantized Weights)
   ↓
Postprocessing (Non-Max Suppression [NMS], Confidence Filtering > 0.75)
   ↓
WebSocket Broadcast (< 15ms)
   ↓
Browser Dashboard (Canvas Overlay) & GPIO Signal`,
        folderStructure: `autovision/
├── data/
│   ├── raw_images/
│   └── annotations/
├── models/
│   ├── yolov8n_defects.pt
│   └── yolov8n_defects.engine
├── src/
│   ├── capture/
│   │   └── camera_stream.py
│   ├── inference/
│   │   ├── trt_engine.py
│   │   └── postprocess.py
│   ├── api/
│   │   ├── main.py
│   │   └── websocket_feed.py
│   └── db/
│       ├── models.py
│       └── database.py
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── Dockerfile
├── docker-compose.yml
└── requirements.txt`,
        databaseDesign: {
            tables: [
                {
                    name: 'inspections',
                    columns: 'id (UUID), timestamp (TIMESTAMPTZ), defect_detected (BOOLEAN), defect_class (TEXT), confidence (FLOAT), inference_time_ms (FLOAT), image_path (TEXT)'
                },
                {
                    name: 'defect_classes',
                    columns: 'id (INT), class_name (TEXT), severity (TEXT), tolerance_threshold (FLOAT)'
                }
            ]
        },
        apiDesign: [
            { method: 'GET', endpoint: '/api/v1/health', description: 'Returns GPU status, VRAM usage, and inference temperature.' },
            { method: 'GET', endpoint: '/api/v1/stats', description: 'Aggregated defect counts, total parts scanned, and pass rate.' },
            { method: 'WS', endpoint: '/ws/stream', description: 'High-frequency binary WebSocket streaming annotated JPEG frames and bounding boxes.' }
        ],
        stepByStepGuide: [
            {
                stepNumber: 1,
                title: 'Environment & CUDA Configuration',
                description: 'Set up Python 3.11 virtual environment, install PyTorch with CUDA 12.1 acceleration, and verify GPU detection.',
                codeSnippet: `python -m venv venv\nsource venv/bin/activate\npip install torch torchvision --index-url https://download.pytorch.org/whl/cu121\npython -c "import torch; print('CUDA Available:', torch.cuda.is_available())"`
            },
            {
                stepNumber: 2,
                title: 'Dataset Preparation & Model Fine-Tuning',
                description: 'Label custom manufacturing defect dataset (scratches, dents, cracks) in YOLO format and fine-tune YOLOv8 nano for 50 epochs.',
                codeSnippet: `from ultralytics import YOLO\nmodel = YOLO('yolov8n.pt')\nmodel.train(data='defects.yaml', epochs=50, imgsz=640, device=0)`
            },
            {
                stepNumber: 3,
                title: 'ONNX & TensorRT Engine Export',
                description: 'Export PyTorch weights to ONNX format, then compile into a TensorRT optimized engine with FP16/INT8 calibration.',
                codeSnippet: `yolo export model=yolov8n_defects.pt format=engine device=0 half=True`
            },
            {
                stepNumber: 4,
                title: 'High-Throughput Threaded Camera Ingestion',
                description: 'Implement a non-blocking threaded camera reader in OpenCV to decouple video decode from inference bottlenecks.',
                codeSnippet: `import cv2, threading\nclass CameraStream:\n    def __init__(self, src=0):\n        self.cap = cv2.VideoCapture(src)\n        self.grabbed, self.frame = self.cap.read()\n        self.running = True\n        threading.Thread(target=self.update, daemon=True).start()`
            },
            {
                stepNumber: 5,
                title: 'TensorRT C++/Python Inference Pipeline',
                description: 'Load the compiled engine, allocate pinned host/device buffers using PyCUDA, and execute asynchronous inference.',
                codeSnippet: `import tensorrt as trt\nlogger = trt.Logger(trt.Logger.WARNING)\nwith open('model.engine', 'rb') as f, trt.Runtime(logger) as runtime:\n    engine = runtime.deserialize_cuda_engine(f.read())\ncontext = engine.create_execution_context()`
            },
            {
                stepNumber: 6,
                title: 'Real-Time FastAPI WebSocket Broadcast',
                description: 'Build an asynchronous WebSocket endpoint broadcasting annotated base64/binary frames to connected UI clients at 60 FPS.',
                codeSnippet: `@app.websocket('/ws/stream')\nasync def stream_frames(ws: WebSocket):\n    await ws.accept()\n    while True:\n        frame = get_latest_annotated_frame()\n        await ws.send_bytes(cv2.imencode('.jpg', frame)[1].tobytes())`
            },
            {
                stepNumber: 7,
                title: 'PostgreSQL Defect Telemetry Logging',
                description: 'Record timestamped inspection anomalies to PostgreSQL using async SQLAlchemy connection pooling.',
                codeSnippet: `await db.execute(insert(Inspection).values(defect_class='scratch', confidence=0.92, inference_time_ms=8.4))`
            },
            {
                stepNumber: 8,
                title: 'Interactive Real-Time Frontend Dashboard',
                description: 'Construct a responsive dark dashboard using Tailwind CSS and HTML5 Canvas to render bounding boxes with zero flicker.',
                codeSnippet: `const ws = new WebSocket('ws://localhost:8000/ws/stream');\nws.binaryType = 'arraybuffer';\nws.onmessage = (e) => { drawBlobToCanvas(e.data); };`
            },
            {
                stepNumber: 9,
                title: 'GPIO / Actuator Hardware Interfacing',
                description: 'Trigger serial/GPIO signals to pneumatic solenoids to kick defective components off the virtual conveyor belt.',
                codeSnippet: `if defect_detected:\n    serial_port.write(b'TRIGGER_REJECT\\n')`
            },
            {
                stepNumber: 10,
                title: 'Stress Testing & Latency Benchmarking',
                description: 'Simulate 1,000 continuous frames and benchmark p95 and p99 inference latency, ensuring p99 stays under 20ms.',
                codeSnippet: `python benchmark.py --engine model.engine --warmup 100 --iterations 1000`
            },
            {
                stepNumber: 11,
                title: 'Production Docker Containerization',
                description: 'Create multi-stage Dockerfile utilizing NVIDIA CUDA base image and package runtime dependencies.',
                codeSnippet: `FROM nvcr.io/nvidia/tensorrt:23.08-py3\nCOPY . /app\nRUN pip install -r /app/requirements.txt\nCMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]`
            },
            {
                stepNumber: 12,
                title: 'Documentation & Recruiter Demo Video',
                description: 'Publish code repository with architectural diagrams, latency graphs, and a 2-minute Loom demonstration walkthrough.',
                codeSnippet: `git tag -a v1.0.0 -m "Release Production Edge AI Defect Classifier"`
            }
        ],
        testingGuide: {
            unitTests: 'Test NMS coordinate calculations, bounding box clipping, and TensorRT memory buffer allocation.',
            integrationTests: 'Validate end-to-end frame capture -> inference -> WebSocket delivery latency under synthetic video input.',
            performanceChecklist: 'Verify GPU temperature < 75°C, VRAM utilization < 2.5 GB, and inference FPS >= 60 on 1080p frames.'
        },
        commonErrors: [
            { error: 'CUDA out of memory during engine compilation', fix: 'Reduce max_workspace_size in TensorRT builder configuration to 2GB.' },
            { error: 'OpenCV VideoCapture lagging / buffer bloat', fix: 'Set cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) and consume frames in a dedicated thread.' },
            { error: 'WebSocket disconnects on high FPS', fix: 'Compress frames with JPEG quality 75 and drop intermediate frames if client TCP buffer is saturated.' }
        ],
        demoGuide: '1. Start by stating the industrial problem: 15% manual inspection error rates on high-speed lines. 2. Show the live dashboard running at 65 FPS with sub-15ms latency. 3. Introduce a defective part on camera: show instant bounding box detection and GPIO trigger log. 4. Explain why TensorRT INT8 was chosen over PyTorch FP32 (3.8x speedup).',
        resumeBullet: 'Architected an edge computer vision pipeline using YOLOv8 and NVIDIA TensorRT, achieving 68 FPS on 1080p industrial streams with 14.2ms p99 latency and 96.4% defect classification accuracy.',
        interviewQuestions: [
            {
                question: 'Why did you choose TensorRT over standard PyTorch or ONNX Runtime?',
                answer: 'TensorRT fuses convolution, bias, and ReLU layers into single GPU kernels, optimizes memory footprint through layer calibration, and performs INT8 quantization with negligible precision drop, yielding a 3.5x inference speedup on NVIDIA silicon.'
            },
            {
                question: 'How did you prevent video frame buffer delay in OpenCV?',
                answer: 'Standard OpenCV VideoCapture maintains an internal OS queue. I implemented a producer-consumer thread model with buffer size 1 that immediately overwrites unconsumed frames, guaranteeing zero latency between camera capture and model inference.'
            }
        ],
        extensions: [
            { level: 'Level 2 Intermediate', title: 'Multi-Camera Orchestration', description: 'Scale to 4 simultaneous camera streams using GStreamer hardware decode pipelines.' },
            { level: 'Level 3 Advanced', title: 'Active Learning Feedback Loop', description: 'Automatically upload low-confidence frames (< 0.70) to cloud bucket for retraining.' },
            { level: 'Level 4 Production', title: 'Kubernetes Edge Deployment', description: 'Deploy using K3s with NVIDIA GPU Operator and Prometheus latency alerts.' }
        ],
        targetCareers: ['Computer Vision Engineer', 'Edge AI Engineer', 'Robotics Perception Specialist', 'MLOps Engineer'],
        connectedVideos: ['bkSWJJZNgf8', 'aircAruvnKk', 'z-EtmaFJieY']
    },

    // -------------------------------------------------------------------------
    // 2. COMPUTING / DISTRIBUTED SYSTEMS
    // -------------------------------------------------------------------------
    {
        id: 'proj-distributed-kv-raft',
        title: 'RaftEngine: Fault-Tolerant Distributed Key-Value Store with Consensus Protocol',
        slug: 'raft-distributed-kv-store',
        category: 'Computing',
        departments: ['CSE', 'IT', 'CLOUD', 'SE', 'CSIT'],
        years: [3, 4],
        semesters: [5, 6, 7, 8],
        difficulty: 'Production Capstone',
        durationWeeks: 5,
        estimatedHours: 70,
        overview: 'A robust, multi-node distributed replicated state machine implementing the Raft Consensus Algorithm in Go or C++. Features leader election, replicated write-ahead logging (WAL), log compaction via snapshotting, and strict linearizable reads and writes.',
        problemStatement: 'Single-node databases represent single points of failure. In hyperscale environments, nodes crash, networks partition, and messages get delayed. Systems must guarantee strict consistency and continuous availability despite arbitrary fail-stop node crashes.',
        whyBuildIt: 'The definitive project for landing Tier-1 Systems, Cloud Infrastructure, and Backend Engineering roles (Google Cloud, AWS, Datadog, Snowflake). Proves deep understanding of network partitioning, state machines, and concurrency.',
        whoItIsFor: '3rd and 4th year CSE/IT students targeting Cloud Infrastructure, Distributed Systems, and High-Performance Backend roles.',
        objective: 'Construct a 5-node distributed cluster that safely tolerates the simultaneous crash of up to 2 nodes, elects a new leader within 300ms, and preserves 100% data consistency without split-brain anomalies.',
        expectedOutput: 'A functional clustered service exposed via gRPC/REST with a real-time topology visualization dashboard showing cluster nodes, leader elections, log terms, and partition resilience.',
        prerequisites: [
            'Go (Golang) or C++ concurrent programming (goroutines/channels or pthreads)',
            'TCP/IP networking and gRPC protocol buffers',
            'Understanding of State Machine Replication (SMR) and ACID guarantees'
        ],
        requiredSkills: [
            { name: 'Distributed Systems & Raft', category: 'Systems', level: 'Advanced' },
            { name: 'Go / C++', category: 'Backend', level: 'Advanced' },
            { name: 'gRPC & Protocol Buffers', category: 'Networking', level: 'Intermediate' },
            { name: 'Write-Ahead Logging & RocksDB', category: 'Storage', level: 'Intermediate' }
        ],
        techStack: {
            frontend: ['Tailwind CSS', 'D3.js Network Graph', 'Vanilla JS'],
            backend: ['Go 1.22', 'gRPC', 'Protobuf'],
            storage: ['BuntDB / BadgerDB', 'Custom WAL'],
            testing: ['Chaos Engineering Simulation', 'Jepsen-style Partition Tests']
        },
        hardwareRequirements: ['Standard Laptop/PC (Supports running 5 Docker containers concurrently)'],
        softwareRequirements: ['Go 1.22+', 'Docker & Docker Compose', 'Git'],
        howItWorks: `Client Put("user_1", "Alex")
   ↓
Cluster Gateway (Routes to Leader Node)
   ↓
Leader Appends Entry to Local WAL (Term: 2, Index: 104)
   ↓
Leader Sends AppendEntries RPC to All Followers concurrently
   ↓
Followers verify Term, append to local WAL, return Success
   ↓
Leader collects Quorum (Majority: floor(N/2) + 1 = 3 of 5)
   ↓
Leader commits entry, applies to State Machine, returns OK to Client
   ↓
Leader notifies followers of new commitIndex on subsequent heartbeats`,
        folderStructure: `raft-engine/
├── cmd/
│   ├── server/main.go
│   └── client/main.go
├── proto/
│   └── raft.proto
├── internal/
│   ├── raft/
│   │   ├── node.go
│   │   ├── election.go
│   │   ├── replication.go
│   │   └── storage.go
│   ├── statemachine/
│   │   └── kv_store.go
│   └── rpc/
│       └── server.go
├── tests/
│   ├── partition_test.go
│   └── chaos_test.go
├── Dockerfile
└── docker-compose.yml`,
        databaseDesign: {
            tables: [
                {
                    name: 'wal_log_entries',
                    columns: 'term (INT64), index (INT64), command_type (PUT/DELETE), key (TEXT), value (BLOB)'
                },
                {
                    name: 'hard_state',
                    columns: 'current_term (INT64), voted_for (TEXT)'
                }
            ]
        },
        apiDesign: [
            { method: 'POST', endpoint: '/rpc/RaftService/RequestVote', description: 'Invoked by candidates to gather votes during leader election.' },
            { method: 'POST', endpoint: '/rpc/RaftService/AppendEntries', description: 'Invoked by leader to replicate log entries and heartbeat followers.' },
            { method: 'POST', endpoint: '/api/v1/kv/put', description: 'Client write operation to linearizable distributed key-value store.' },
            { method: 'GET', endpoint: '/api/v1/kv/get', description: 'Client read operation with linearizable lease verification.' }
        ],
        stepByStepGuide: [
            {
                stepNumber: 1,
                title: 'Protocol Buffer & gRPC Schema Definition',
                description: 'Define Raft RPC messages (RequestVote, AppendEntries) in Protocol Buffers and compile Go stubs.',
                codeSnippet: `syntax = "proto3";\nservice RaftService {\n  rpc RequestVote(VoteArgs) returns (VoteReply);\n  rpc AppendEntries(AppendArgs) returns (AppendReply);\n}`
            },
            {
                stepNumber: 2,
                title: 'Raft Node State Representation',
                description: 'Model the 3 states (Follower, Candidate, Leader), term counters, vote trackers, and volatile commit indexes.',
                codeSnippet: `type NodeRole int\nconst (Follower NodeRole = iota; Candidate; Leader)\ntype RaftNode struct {\n    mu sync.Mutex\n    currentTerm int\n    votedFor string\n    log []LogEntry\n    role NodeRole\n}`
            },
            {
                stepNumber: 3,
                title: 'Randomized Election Timers & Heartbeats',
                description: 'Implement randomized election timeouts (150ms-300ms) to avoid split votes, and periodic 50ms leader heartbeats.',
                codeSnippet: `timeout := time.Duration(150 + rand.Intn(150)) * time.Millisecond\ntimer := time.NewTimer(timeout)`
            },
            {
                stepNumber: 4,
                title: 'Leader Election Routine & Vote Quorum',
                description: 'Handle transition to Candidate, increment term, vote for self, and broadcast RequestVote to all peers.',
                codeSnippet: `if votesReceived > len(peers)/2 {\n    node.role = Leader\n    node.startHeartbeats()\n}`
            },
            {
                stepNumber: 5,
                title: 'Log Replication & Quorum Commitment',
                description: 'Implement AppendEntries logic on leader and followers, resolving log discrepancies and advancing commitIndex.',
                codeSnippet: `for i := len(node.peers); i > 0; i-- {\n    if matchCount >= quorum {\n        node.commitIndex = N\n        node.applyToStateMachine()\n    }\n}`
            },
            {
                stepNumber: 6,
                title: 'State Machine Key-Value Engine',
                description: 'Construct concurrent in-memory map protected with RWMutex applied strictly in commitIndex sequence.',
                codeSnippet: `type KVStore struct {\n    mu sync.RWMutex\n    data map[string]string\n}`
            },
            {
                stepNumber: 7,
                title: 'Persistent Storage & Write-Ahead Log (WAL)',
                description: 'Persist currentTerm, votedFor, and log entries to disk before responding to RPCs to survive crashes.',
                codeSnippet: `func (rn *RaftNode) persist() {\n    data := encode(rn.currentTerm, rn.votedFor, rn.log)\n    os.WriteFile("state.bin", data, 0644)\n}`
            },
            {
                stepNumber: 8,
                title: 'Snapshotting & Log Compaction',
                description: 'Discard applied log entries past threshold and replace with compact memory snapshot.',
                codeSnippet: `func (rn *RaftNode) Snapshot(index int, snapshot []byte) {\n    rn.log = rn.log[index:]\n}`
            },
            {
                stepNumber: 9,
                title: 'Linearizable Read Optimization (Read Index)',
                description: 'Verify leader lease or perform heartbeat round before serving GET requests to prevent stale reads.',
                codeSnippet: `if !node.confirmLeadershipWithQuorum() { return ErrorNotLeader }`
            },
            {
                stepNumber: 10,
                title: 'Chaos Network Partitioning Test Suite',
                description: 'Simulate split-brain scenarios using iptables/netem to isolate 2 nodes and ensure 3-node partition progresses.',
                codeSnippet: `func TestNetworkPartition(t *testing.T) {\n    cluster.Disconnect(node4, node5)\n    cluster.Put("k1", "v1")\n    // Verify cluster succeeds with 3 nodes\n}`
            },
            {
                stepNumber: 11,
                title: 'Interactive Topology Dashboard',
                description: 'Serve a live web UI visualizing heartbeats, log indexes, and node health using Server-Sent Events (SSE).',
                codeSnippet: `const sse = new EventSource('/api/v1/cluster/events');\nsse.onmessage = (e) => updateTopology(JSON.parse(e.data));`
            },
            {
                stepNumber: 12,
                title: 'Benchmarking & Production Packaging',
                description: 'Execute Go benchmark tests measuring operations/second and write complete architectural design document.',
                codeSnippet: `go test -bench=. -benchmem ./...`
            }
        ],
        testingGuide: {
            unitTests: 'Test election timeouts, log conflict resolution, and snapshot serialization.',
            integrationTests: 'Jepsen-style automated failure injection: kill leader, verify new leader election, recover old leader.',
            performanceChecklist: 'Sustain > 5,000 replicated writes/second with sub-10ms latency across 5 local nodes.'
        },
        commonErrors: [
            { error: 'Split-vote deadlock loops', fix: 'Ensure election timeouts are properly re-randomized on every reset.' },
            { error: 'Deadlocks during peer RPC inside mutex locks', fix: 'Never hold node.mu mutex while making blocking network RPC calls.' },
            { error: 'Out-of-order log application', fix: 'Apply entries to state machine strictly sequentially using a dedicated applier channel.' }
        ],
        demoGuide: '1. Launch 5-node cluster and show realtime dashboard. 2. Write key-value pairs to leader. 3. Kill leader process: show cluster elect new leader in 250ms with zero data loss. 4. Revive old leader: show it rejoin as follower and synchronize logs.',
        resumeBullet: 'Engineered a fault-tolerant distributed key-value store in Go based on Raft Consensus protocol, achieving 5,200 writes/sec and linearizable reads with sub-300ms leader failover across network partitions.',
        interviewQuestions: [
            {
                question: 'How does Raft prevent split-brain with two leaders?',
                answer: 'A candidate requires a strict majority quorum (N/2 + 1) of cluster votes to become leader. Because any two majorities must overlap by at least one node, and each node can vote at most once per term, it is mathematically impossible for two candidates to receive a majority in the same term.'
            },
            {
                question: 'What is the log matching invariant in Raft?',
                answer: 'If two entries in different logs have the same index and term, then they store the same command, and their logs are identical in all preceding entries. This is inductively guaranteed by AppendEntries consistency checks.'
            }
        ],
        extensions: [
            { level: 'Level 2 Intermediate', title: 'Multi-Raft Sharding', description: 'Implement multi-Raft groups to shard keys across independent consensus groups.' },
            { level: 'Level 3 Advanced', title: 'Pre-Vote Protocol', description: 'Prevent partitioned nodes with stale terms from disrupting healthy leaders upon reconnect.' },
            { level: 'Level 4 Production', title: 'Zero-Copy Direct Disk I/O', description: 'Bypass kernel page cache using O_DIRECT for predictable write latency.' }
        ],
        targetCareers: ['Distributed Systems Engineer', 'Cloud Infrastructure Architect', 'Site Reliability Engineer', 'Backend Lead'],
        connectedVideos: ['bkSWJJZNgf8', 'ZA-tUyM_y7s', 'VwN91x5i25g']
    },

    // -------------------------------------------------------------------------
    // 3. ELECTRICAL / EMBEDDED / EV CAPSTONE
    // -------------------------------------------------------------------------
    {
        id: 'proj-iot-smart-grid-bms',
        title: 'GridPulse: EV Battery Management System (BMS) with Kalman Filter & CAN Telemetry',
        slug: 'ev-battery-management-system-kalman',
        category: 'Electrical',
        departments: ['EEE', 'POWER', 'ECE', 'EMBEDDED', 'AUTO', 'ENERGY', 'MECHTRON'],
        years: [3, 4],
        semesters: [5, 6, 7, 8],
        difficulty: 'Production Capstone',
        durationWeeks: 6,
        estimatedHours: 75,
        overview: 'An embedded Battery Management System (BMS) for electric vehicle lithium-ion packs (8S-16S). Features Extended Kalman Filtering (EKF) for State-of-Charge (SoC) estimation, passive cell balancing, overcurrent/thermal protection, and real-time CAN bus telemetry.',
        problemStatement: 'Lithium-ion cells in EV battery packs exhibit non-linear degradation and thermal runaway risks. Simple voltage-based SoC estimation errors exceed 15%, leading to premature vehicle shutdown or irreversible cell damage during high-current regenerative braking.',
        whyBuildIt: 'The cornerstone project for landing core Electric Vehicle (EV), Automotive Tier-1 (Tesla, Rivian, Bosch, Tata Motors), and Clean Energy Powertrain roles.',
        whoItIsFor: '3rd and 4th year EEE, ECE, Automobile, and Embedded Systems students.',
        objective: 'Construct an embedded hardware/software BMS controller that measures cell voltages with 1mV resolution, estimates State-of-Charge with < 3% error using Kalman filtering, and transmits CAN 2.0B diagnostic frames at 100Hz.',
        expectedOutput: 'An operational STM32/ESP32 firmware system with an interactive web telemetry dashboard displaying live cell voltages, pack temperature thermistor graphs, SoC %, and safety relay trips.',
        prerequisites: [
            'Embedded C programming and microcontroller peripherals (ADC, SPI, CAN, I2C)',
            'Basics of Lithium-ion chemistry (NMC/LFP open-circuit voltage curves)',
            'Linear algebra basics (matrix multiplication for Kalman filter equations)'
        ],
        requiredSkills: [
            { name: 'Embedded C & RTOS', category: 'Firmware', level: 'Advanced' },
            { name: 'CAN Bus Protocol (CAN 2.0B)', category: 'Automotive', level: 'Intermediate' },
            { name: 'Kalman Filtering (State Estimation)', category: 'Control Systems', level: 'Intermediate' },
            { name: 'Power Electronics & PCB Design', category: 'Hardware', level: 'Intermediate' }
        ],
        techStack: {
            firmware: ['Embedded C', 'FreeRTOS', 'STM32CubeIDE / ESP-IDF'],
            hardware: ['STM32F4 / ESP32', 'TI BQ76940 / LTC6804 AFE', 'MCP2551 CAN Transceiver'],
            telemetry: ['Python', 'SocketCAN / CANalyzer', 'Chart.js', 'FastAPI']
        },
        hardwareRequirements: [
            'STM32F4 Discovery / Nucleo or ESP32 dev board',
            'Multi-cell Li-ion Battery Simulator (Resistor divider network or 4S test pack)',
            'MCP2515 CAN module + USB-CAN adapter'
        ],
        softwareRequirements: ['STM32CubeIDE or VS Code PlatformIO', 'Python 3.10+', 'Saleae Logic Analyzer or Wireshark'],
        howItWorks: `Analog Front-End (AFE BQ76940)
   ↓
Differential Voltage & NTC Temperature Sensing (SPI Bus, 50ms)
   ↓
Microcontroller Interrupt & Analog Sampling
   ↓
Coulomb Counting + Extended Kalman Filter (EKF) State Update
   ↓
Safety Limit Checks (Overvoltage > 4.2V, Undervoltage < 2.8V, Temp > 55°C)
   ↓
Passive Cell Balancing Shunt Control (MOSFET Gates)
   ↓
CAN 2.0B Frame Packing (0x18F00100) & Transceiver Broadcast
   ↓
Vehicle Control Unit (VCU) / Web Telemetry Dashboard`,
        folderStructure: `gridpulse-bms/
├── firmware/
│   ├── Core/
│   │   ├── Inc/
│   │   │   ├── bms_kalman.h
│   │   │   ├── bms_can.h
│   │   │   └── bms_safety.h
│   │   └── Src/
│   │       ├── main.c
│   │       ├── bms_kalman.c
│   │       └── bms_can.c
├── simulation/
│   └── ekf_battery_model.py
├── telemetry_dashboard/
│   ├── app.py
│   └── static/
├── docs/
│   └── schematic.pdf
└── README.md`,
        databaseDesign: {
            tables: [
                {
                    name: 'battery_telemetry',
                    columns: 'pack_id (TEXT), timestamp (TIMESTAMPTZ), avg_cell_voltage (FLOAT), max_temp_c (FLOAT), soc_percent (FLOAT), pack_current_a (FLOAT)'
                }
            ]
        },
        apiDesign: [
            { method: 'GET', endpoint: '/api/v1/pack/status', description: 'Returns live 16-cell voltages, temperatures, and contactor state.' },
            { method: 'POST', endpoint: '/api/v1/pack/balance', description: 'Manually toggles active passive cell balancing mode.' }
        ],
        stepByStepGuide: [
            {
                stepNumber: 1,
                title: 'Battery Equivalent Circuit Model (ECM) Characterization',
                description: 'Model the battery as an Open-Circuit Voltage (OCV) with series resistor and parallel RC network (Thevenin Model).',
                codeSnippet: `// Thevenin Equivalent Circuit: V_terminal = OCV - I*R0 - V_rc\nfloat ocv = calculate_ocv_from_lookup(soc);`
            },
            {
                stepNumber: 2,
                title: 'Extended Kalman Filter (EKF) Mathematical Formulation',
                description: 'Implement state prediction and measurement update steps in C using matrix covariance updates.',
                codeSnippet: `void EKF_Update(float current, float measured_voltage, float dt) {\n    // Predict State: SoC_k = SoC_{k-1} - (I*dt)/Q_nom\n    soc_pred = soc_est - (current * dt) / NOMINAL_CAPACITY;\n}`
            },
            {
                stepNumber: 3,
                title: 'AFE SPI Communication & CRC-8 Verification',
                description: 'Interface with the Analog Front End (AFE) chip over SPI with hardware CRC checksum to prevent corrupted voltage reads.',
                codeSnippet: `uint8_t crc = calculate_crc8(rx_buffer, 4);\nif (crc != rx_buffer[4]) { handle_afe_comm_fault(); }`
            },
            {
                stepNumber: 4,
                title: 'Cell Balancing Shunt Control Logic',
                description: 'Activate discharge balance resistors across cells exceeding average pack voltage by > 15mV during charging.',
                codeSnippet: `if (cell_v[i] > min_v + 0.015f && is_charging) {\n    enable_balance_fet(i);\n}`
            },
            {
                stepNumber: 5,
                title: 'Automotive Safety Contactor Trip Loop',
                description: 'Implement hardware safety checks executed in a deterministic 10ms RTOS task with priority over telemetry.',
                codeSnippet: `if (max_temp > 60.0f || pack_current > 150.0f) {\n    GPIO_SetPin(CONTACTOR_RELAY_PIN, GPIO_LOW); // Immediate Isolation\n}`
            },
            {
                stepNumber: 6,
                title: 'CAN 2.0B Protocol Transceiver Configuration',
                description: 'Configure CAN hardware filter banks and format standard SAE J1939 battery broadcast frames.',
                codeSnippet: `CAN_TxHeaderTypeDef header;\nheader.StdId = 0x305;\nheader.DLC = 8;\nHAL_CAN_AddTxMessage(&hcan, &header, can_payload, &mailbox);`
            },
            {
                stepNumber: 7,
                title: 'FreeRTOS Multitasking Architecture',
                description: 'Partition firmware into 3 priorities: Safety Task (10ms), Estimation Task (50ms), and Telemetry Task (100ms).',
                codeSnippet: `xTaskCreate(vSafetyTask, "Safety", 256, NULL, configMAX_PRIORITIES - 1, NULL);`
            },
            {
                stepNumber: 8,
                title: 'Python CAN Bus Telemetry Gateway',
                description: 'Read physical CAN frames from USB adapter using python-can and stream to local WebSocket server.',
                codeSnippet: `import can\nbus = can.interface.Bus(bustype='socketcan', channel='can0', bitrate=500000)`
            },
            {
                stepNumber: 9,
                title: 'Real-Time Web Diagnostics Dashboard',
                description: 'Build visualization dashboard showing per-cell bar charts, SoC gauges, and temperature heat maps.',
                codeSnippet: `function updateCellVoltages(voltages) {\n    voltages.forEach((v, i) => updateBarHeight(i, v));\n}`
            },
            {
                stepNumber: 10,
                title: 'Thermal Chamber & Overcurrent Testing',
                description: 'Test firmware reaction to simulated 65°C thermistor faults and verify relay cutoff in < 5 milliseconds.',
                codeSnippet: `// Verify oscilloscope trace shows contactor opening within 4.2ms`
            },
            {
                stepNumber: 11,
                title: 'ISO 26262 Automotive Functional Safety Review',
                description: 'Document Failure Mode and Effects Analysis (FMEA) and single-point fault tolerance for ASIL-C compliance.',
                codeSnippet: `// Document FMEA table: Sensor Open Circuit -> Safe Default State`
            },
            {
                stepNumber: 12,
                title: 'Final Demonstration & GitHub Packaging',
                description: 'Record test bench video demonstration with load resistors, oscilloscopes, and live telemetry.',
                codeSnippet: `git push origin main --tags`
            }
        ],
        testingGuide: {
            unitTests: 'Test EKF convergence across varying starting SoC offsets (e.g. initialize at 20% when actual is 80%).',
            integrationTests: 'Inject simulated CAN bus errors and verify automatic hardware bus recovery.',
            performanceChecklist: 'Verify ADC sampling jitter < 100 microseconds and SoC estimation error < 3% compared to Coulomb counting.'
        },
        commonErrors: [
            { error: 'EKF covariance matrix diverging', fix: 'Add numerical clipping and ensure process noise covariance Q is appropriately tuned.' },
            { error: 'CAN bus transmission timeouts', fix: 'Verify 120 ohm termination resistors are installed at both physical ends of the differential CAN bus.' },
            { error: 'Ground bounce during cell balancing', fix: 'Isolate digital microcontroller ground from high-current discharge ground via optocouplers.' }
        ],
        demoGuide: '1. Connect simulated battery pack to BMS. 2. Show live cell voltages on CAN telemetry dashboard. 3. Simulate an unbalanced cell: demonstrate balance MOSFET turning on. 4. Trigger an over-temperature condition: show contactor disconnect within 4ms.',
        resumeBullet: 'Engineered an automotive Battery Management System (BMS) firmware on STM32 in C/FreeRTOS, implementing an Extended Kalman Filter for State-of-Charge estimation (< 2.8% error) and CAN 2.0B telemetry at 100Hz.',
        interviewQuestions: [
            {
                question: 'Why is simple Coulomb counting insufficient for State-of-Charge estimation?',
                answer: 'Coulomb counting integrates current over time, which causes cumulative drift from sensor noise and ADC bias. Furthermore, it cannot self-correct without knowing the initial state. The Extended Kalman Filter combines Coulomb counting with the non-linear OCV-SoC curve to bound drift and dynamically estimate state uncertainty.'
            },
            {
                question: 'What is the difference between active and passive cell balancing?',
                answer: 'Passive balancing burns excess energy from higher-voltage cells as heat through shunt resistors. Active balancing shuttles charge from higher cells to lower cells using capacitive or inductive DC-DC converters, offering higher efficiency at greater circuit complexity.'
            }
        ],
        extensions: [
            { level: 'Level 2 Intermediate', title: 'State-of-Health (SoH) Estimation', description: 'Implement dual EKF to estimate internal resistance growth and capacity degradation.' },
            { level: 'Level 3 Advanced', title: 'Wireless BMS (wBMS)', description: 'Replace physical wiring harnesses with 2.4 GHz wireless mesh sensor nodes.' },
            { level: 'Level 4 Production', title: 'Hardware-in-the-Loop (HIL) Test Bench', description: 'Integrate with dSPACE or Speedgoat for real-time automated drive cycle testing.' }
        ],
        targetCareers: ['BMS Firmware Engineer', 'EV Powertrain Engineer', 'Automotive Systems Engineer', 'Embedded Hardware Lead'],
        connectedVideos: ['AfQxyVuLeCs', '4a0FbQdH3dY', '1mHjMNZZvFo']
    },

    // -------------------------------------------------------------------------
    // 4. MECHANICAL / ROBOTICS CAPSTONE
    // -------------------------------------------------------------------------
    {
        id: 'proj-robotics-6dof-ros2',
        title: 'RoboArm-6X: 6-DOF Industrial Robotic Arm with ROS 2 & MoveIt Motion Planning',
        slug: '6dof-robotic-arm-ros2-moveit',
        category: 'Mechanical',
        departments: ['ROBOTICS', 'MECHTRON', 'MECH', 'AUTO', 'MFG', 'IND'],
        years: [3, 4],
        semesters: [5, 6, 7, 8],
        difficulty: 'Production Capstone',
        durationWeeks: 7,
        estimatedHours: 90,
        overview: 'Complete mechanical design, kinematic simulation, and trajectory control of a 6-Degree-of-Freedom articulated robotic arm. Features Denavit-Hartenberg (D-H) forward/inverse kinematics, MoveIt 2 obstacle avoidance, and Gazebo physical simulation.',
        problemStatement: 'Industrial pick-and-place automation requires precise Cartesian positioning under kinematic singularities and joint limits. Proprietary robot controllers are expensive closed ecosystems that lock universities and startups out of custom path planning.',
        whyBuildIt: 'The ultimate showcase project for Robotics Engineer, Mechatronics Architect, and Automation roles at companies like Boston Dynamics, ABB, KUKA, Tesla Optimus, and Fanuc.',
        whoItIsFor: '3rd and 4th year Mechanical, Mechatronics, and Robotics Engineering students.',
        objective: 'Design a 3D-printable or machined 6-axis robotic arm, solve its analytical inverse kinematics in C++, and control it in both simulated (Gazebo) and physical environments with sub-millimeter trajectory repeatability.',
        expectedOutput: 'A complete ROS 2 workspace with URDF robot description, MoveIt 2 motion planning pipeline, Gazebo simulation world, and an interactive 3D Web visualization interface.',
        prerequisites: [
            'Matrix kinematics (Rotation matrices, Homogeneous transformation matrices)',
            'C++ and Python programming on Linux (Ubuntu 22.04)',
            'Basic SolidWorks or CAD 3D modeling'
        ],
        requiredSkills: [
            { name: 'ROS 2 (Robot Operating System)', category: 'Robotics', level: 'Advanced' },
            { name: 'Inverse Kinematics (D-H Parameters)', category: 'Kinematics', level: 'Advanced' },
            { name: 'MoveIt 2 & Gazebo Simulation', category: 'Simulation', level: 'Intermediate' },
            { name: 'CAD & Finite Element Analysis (FEA)', category: 'Mechanical Design', level: 'Intermediate' }
        ],
        techStack: {
            robotics: ['ROS 2 Humble', 'MoveIt 2', 'Gazebo Sim', 'URDF / Xacro'],
            software: ['C++ 17', 'Python 3.10', 'Eigen3 Linear Algebra Library'],
            hardware: ['Stepper / Servo Actuators', 'Cycloidal / Harmonic Drives', 'Arduino / CAN Controller']
        },
        hardwareRequirements: ['PC running Ubuntu 22.04 LTS (NVIDIA GPU recommended for Gazebo physics)'],
        softwareRequirements: ['ROS 2 Humble Desktop Full', 'MoveIt 2', 'Gazebo Ignition', 'rviz2'],
        howItWorks: `User Input (Target XYZ Cartesian Coordinate: [0.4m, 0.2m, 0.3m])
   ↓
ROS 2 Action Client
   ↓
MoveIt 2 Trajectory Planner (OMPL RRT-Connect Algorithm)
   ↓
3D Scene Collision Checking (OctoMap / Depth Sensor)
   ↓
Inverse Kinematics Solver (Computes 6 Joint Angles theta_1 to theta_6)
   ↓
Joint Trajectory Controller (Spline Interpolation & Velocity Profiling)
   ↓
Gazebo Physics Engine / Physical Motor Controllers (CAN Bus)`,
        folderStructure: `roboarm_ws/
├── src/
│   ├── roboarm_description/
│   │   ├── urdf/roboarm.urdf.xacro
│   │   └── meshes/
│   ├── roboarm_moveit_config/
│   ├── roboarm_kinematics/
│   │   ├── src/analytical_ik.cpp
│   │   └── include/dh_parameters.hpp
│   └── roboarm_gazebo/
│       └── worlds/factory.world
└── README.md`,
        databaseDesign: {
            tables: [
                {
                    name: 'trajectory_waypoints',
                    columns: 'trajectory_id (UUID), step (INT), j1 (FLOAT), j2 (FLOAT), j3 (FLOAT), j4 (FLOAT), j5 (FLOAT), j6 (FLOAT), duration_s (FLOAT)'
                }
            ]
        },
        apiDesign: [
            { method: 'POST', endpoint: '/api/v1/arm/move_to_pose', description: 'Commands arm end-effector to Cartesian pose [x, y, z, roll, pitch, yaw].' },
            { method: 'GET', endpoint: '/api/v1/arm/joint_states', description: 'Streams real-time 6-axis joint encoders and torque telemetry.' }
        ],
        stepByStepGuide: [
            {
                stepNumber: 1,
                title: 'D-H Parameter Kinematic Table Derivation',
                description: 'Assign coordinate frames to all 6 joints according to standard Denavit-Hartenberg conventions and derive transformation matrices.',
                codeSnippet: `// T_i = Rot_z(theta) * Trans_z(d) * Trans_x(a) * Rot_x(alpha)`
            },
            {
                stepNumber: 2,
                title: 'CAD Modeling & Mass Property Extraction',
                description: 'Design arm links in SolidWorks, compute center of mass and moment of inertia tensors, and export STEP/STL meshes.',
                codeSnippet: `// Export STL meshes with origin coincident with joint rotation axis`
            },
            {
                stepNumber: 3,
                title: 'Parametric URDF / Xacro Robot Model Creation',
                description: 'Write xacro description defining visual, collision, and inertial properties for all 6 links and revolute joints.',
                codeSnippet: `<joint name="joint_2" type="revolute">\n  <parent link="link_1"/>\n  <child link="link_2"/>\n  <limit lower="-1.57" upper="1.57" effort="50" velocity="1.0"/>\n</joint>`
            },
            {
                stepNumber: 4,
                title: 'Gazebo Physics & Ros2_Control Plugin Integration',
                description: 'Configure hardware interfaces in URDF to link Gazebo joint physics with ros2_control trajectory controllers.',
                codeSnippet: `<ros2_control name="GazeboSystem" type="system">\n  <hardware><plugin>gazebo_ros2_control/GazeboSystem</plugin></hardware>\n</ros2_control>`
            },
            {
                stepNumber: 5,
                title: 'MoveIt 2 Setup Assistant Configuration',
                description: 'Generate SRDF, define planning groups (arm and hand), set collision matrices, and specify Cartesian end-effector frame.',
                codeSnippet: `ros2 launch roboarm_moveit_config moveit_rviz.launch.py`
            },
            {
                stepNumber: 6,
                title: 'Analytical Inverse Kinematics (IK) C++ Node',
                description: 'Solve closed-form geometric inverse kinematics using spherical wrist decoupling (Pieper criterion) in C++.',
                codeSnippet: `Eigen::Vector3d wrist_center = target_pos - d6 * target_rot.col(2);\n// Solve theta_1, theta_2, theta_3 geometrically`
            },
            {
                stepNumber: 7,
                title: 'Collision Avoidance with Dynamic Obstacles',
                description: 'Integrate simulated 3D depth camera point clouds into MoveIt planning scene to route arm around obstacles.',
                codeSnippet: `moveit::planning_interface::MoveGroupInterface move_group(node, "arm");\nmove_group.setPoseTarget(target_pose);\nmove_group.plan(my_plan);`
            },
            {
                stepNumber: 8,
                title: 'Cubic Spline Trajectory Smoothing',
                description: 'Apply jerk-limited cubic polynomial interpolation across waypoints to prevent actuator mechanical resonance.',
                codeSnippet: `// theta(t) = a0 + a1*t + a2*t^2 + a3*t^3`
            },
            {
                stepNumber: 9,
                title: 'ROS 2 Action Server for Task Sequencing',
                description: 'Expose pick-and-place task action server coordinating gripper close, elevate, transport, and release.',
                codeSnippet: `rclcpp_action::create_server<PickPlaceAction>(node, "execute_pick_place", ...);`
            },
            {
                stepNumber: 10,
                title: 'Singularity Detection & Avoidance',
                description: 'Compute Jacobian determinant; detect and brake when approaching wrist or shoulder singularities (det(J) -> 0).',
                codeSnippet: `Eigen::MatrixXd J = compute_jacobian(q);\nif (std::abs(J.determinant()) < 0.001) { trigger_singularity_slowdown(); }`
            },
            {
                stepNumber: 11,
                title: 'Web-Based 3D Visualization Client',
                description: 'Connect roslibjs to ROS 2 websocket bridge to render interactive 3D robot model directly in browser.',
                codeSnippet: `const ros = new ROSLIB.Ros({ url: 'ws://localhost:9090' });`
            },
            {
                stepNumber: 12,
                title: 'Final Benchmarking & Packaging',
                description: 'Verify 100 consecutive pick-and-place cycles with 0 planning failures in Gazebo, record demo video.',
                codeSnippet: `colcon build --symlink-install`
            }
        ],
        testingGuide: {
            unitTests: 'Test analytical IK solutions against forward kinematics (verify FK(IK(x)) == x).',
            integrationTests: 'Automate 50 randomized target poses in Gazebo to verify collision-free trajectory execution.',
            performanceChecklist: 'Planning time < 150ms for Cartesian targets, trajectory execution time within 5% of calculated duration.'
        },
        commonErrors: [
            { error: 'IK solver returning imaginary angles', fix: 'Target point is outside robot physical reach envelope; add Cartesian reach boundary check.' },
            { error: 'Joint vibration in Gazebo', fix: 'Tune PID controller values in ros2_control yaml and verify link moments of inertia are physically plausible.' },
            { error: 'Self-collision during path planning', fix: 'Regenerate default self-collision matrix in MoveIt Setup Assistant.' }
        ],
        demoGuide: '1. Launch ROS 2 Gazebo and RViz. 2. Command end-effector to pick a virtual cube from a conveyor. 3. Place an unexpected obstacle in the trajectory: show MoveIt re-plan around obstacle in real-time. 4. Explain the D-H parameters and closed-form IK formulation.',
        resumeBullet: 'Developed a 6-DOF industrial robotic arm simulation and control stack in ROS 2 and C++, solving closed-form inverse kinematics and implementing MoveIt 2 obstacle-avoiding trajectory planning with sub-millimeter precision.',
        interviewQuestions: [
            {
                question: 'What is a kinematic singularity and why is it dangerous for robotic manipulators?',
                answer: 'A singularity occurs when the manipulator Jacobian loses rank (determinant equals zero), causing the arm to lose one or more degrees of freedom in Cartesian space. Attempting to move in the singular direction requires infinite joint velocities, leading to extreme mechanical stress or controller crashes.'
            },
            {
                question: 'Explain the difference between Forward Kinematics and Inverse Kinematics.',
                answer: 'Forward Kinematics computes the end-effector position and orientation given known joint angles (unique solution). Inverse Kinematics computes the joint angles required to reach a desired end-effector pose, which is non-linear and often has multiple valid geometric configurations.'
            }
        ],
        extensions: [
            { level: 'Level 2 Intermediate', title: 'Computer Vision Eye-in-Hand', description: 'Attach simulated Intel RealSense camera to end-effector for visual servoing.' },
            { level: 'Level 3 Advanced', title: 'Force-Torque Compliance Control', description: 'Implement impedance control to safely handle delicate contact assemblies.' },
            { level: 'Level 4 Production', title: 'ROS 2 Micro-ROS on Microcontrollers', description: 'Run native micro-ROS nodes directly on STM32 for embedded motor driver communication.' }
        ],
        targetCareers: ['Robotics Software Engineer', 'Mechatronics Automation Architect', 'Motion Planning Specialist', 'Simulation Engineer'],
        connectedVideos: ['4a0FbQdH3dY', '7K1sB05pE0A', 'ZA-tUyM_y7s']
    },

    // -------------------------------------------------------------------------
    // 5. CIVIL / STRUCTURAL CAPSTONE
    // -------------------------------------------------------------------------
    {
        id: 'proj-civil-bim-seismic',
        title: 'SeismoFrame: Multi-Story Seismic Resistance Structural Modeling & Automated Load Analysis',
        slug: 'seismic-structural-modeling-rc-frame',
        category: 'Civil',
        departments: ['CIVIL', 'STRUCT', 'CONST', 'GEO'],
        years: [3, 4],
        semesters: [5, 6, 7, 8],
        difficulty: 'Production Capstone',
        durationWeeks: 5,
        estimatedHours: 65,
        overview: 'Complete structural design, static equivalent lateral force analysis, and dynamic response spectrum analysis of a G+10 story Reinforced Concrete (RC) space frame building subjected to seismic Zone V ground accelerations according to IS 1893:2016 and ACI 318.',
        problemStatement: 'Earthquakes induce lateral dynamic shear forces that cause brittle shear failure in columns, soft-story collapse, and structural torsion. Manual matrix calculations for high-rise frames are mathematically intractable and error-prone.',
        whyBuildIt: 'The premier project for landing Structural Design Engineer, High-Rise Consultant, and BIM Analyst roles at firms like L&T Construction, Arup, AECOM, and Tata Projects.',
        whoItIsFor: '3rd and 4th year Civil and Structural Engineering students.',
        objective: 'Model a 10-story commercial building frame, perform automated matrix stiffness calculation in Python/ETABS, design ductile shear reinforcement, and produce verified engineering calculation sheets.',
        expectedOutput: 'An interactive structural engineering dashboard displaying 3D frame wireframes, bending moment / shear force diagrams, story drift ratios, and reinforcement bar schedules.',
        prerequisites: [
            'Mechanics of Solids and Structural Analysis (Stiffness Matrix Method)',
            'Reinforced Concrete Design (Limit State Method / IS 456 / ACI 318)',
            'Python basics for matrix numerical calculation'
        ],
        requiredSkills: [
            { name: 'Structural Analysis & Dynamic Modeling', category: 'Civil', level: 'Advanced' },
            { name: 'Seismic Design Codes (IS 1893 / ACI)', category: 'Design Codes', level: 'Advanced' },
            { name: 'ETABS / STAAD.Pro / Python', category: 'Software', level: 'Intermediate' },
            { name: 'Rebar Detailing & AutoCAD', category: 'Drafting', level: 'Intermediate' }
        ],
        techStack: {
            structural: ['ETABS / STAAD.Pro', 'Python (NumPy, SciPy)', 'OpenSees'],
            cad: ['AutoCAD Structural', 'Revit BIM'],
            web: ['Three.js (3D Frame Viewer)', 'Tailwind CSS', 'FastAPI']
        },
        hardwareRequirements: ['Standard Laptop/PC (8GB+ RAM for finite element matrix inversion)'],
        softwareRequirements: ['Python 3.10+', 'OpenSees / ETABS (Trial/Student) or NumPy FEM', 'Web Browser'],
        howItWorks: `Architectural Floor Plan (Grid: 6m x 6m, 10 Stories)
   ↓
Dead Load (DL) + Live Load (LL) Computation
   ↓
Seismic Weight (W) = 100% DL + 25%/50% LL (IS 1893:2016)
   ↓
Fundamental Time Period (Ta = 0.075 * h^0.9)
   ↓
Design Horizontal Acceleration Spectrum (Ah = (Z/2) * (I/R) * (Sa/g))
   ↓
Base Shear Computation (Vb = Ah * W)
   ↓
Vertical Distribution of Lateral Forces to Floor Levels (Qi)
   ↓
Direct Stiffness Matrix Method Inversion ([K]{delta} = {F})
   ↓
Story Drift & P-Delta Verification (Drift < 0.004 * h)
   ↓
Beam & Column Section Ductile Reinforcement Detailing`,
        folderStructure: `seismoframe/
├── src/
│   ├── fem/
│   │   ├── frame_3d.py
│   │   ├── stiffness_matrix.py
│   │   └── dynamic_analysis.py
│   ├── codes/
│   │   ├── is1893_2016.py
│   │   └── is456_2000.py
│   └── api/
│       └── server.py
├── data/
│   └── building_params.json
├── frontend/
│   ├── viewer.html
│   └── viewer3d.js
├── reports/
│   └── structural_calculation_report.pdf
└── README.md`,
        databaseDesign: {
            tables: [
                {
                    name: 'story_results',
                    columns: 'story_number (INT), lateral_force_kn (FLOAT), shear_kn (FLOAT), drift_ratio (FLOAT), compliant (BOOLEAN)'
                }
            ]
        },
        apiDesign: [
            { method: 'POST', endpoint: '/api/v1/structure/analyze', description: 'Executes stiffness analysis for specified grid geometry and seismic zone.' },
            { method: 'GET', endpoint: '/api/v1/structure/drift_report', description: 'Returns story drift ratios compared against maximum permissible 0.004 code limit.' }
        ],
        stepByStepGuide: [
            {
                stepNumber: 1,
                title: 'Building Geometry & Gravity Load Specification',
                description: 'Define 3D frame node coordinates, member connectivity, material grades (M30 concrete, Fe500 steel), and floor dead loads.',
                codeSnippet: `dead_load = slab_thickness * concrete_density + floor_finish # kN/m2`
            },
            {
                stepNumber: 2,
                title: 'Seismic Zone & Base Shear Computation',
                description: 'Implement IS 1893:2016 equations for Design Lateral Base Shear (Vb = Ah * W) with Zone Factor Z=0.36 and Response Reduction R=5.',
                codeSnippet: `def compute_base_shear(Z, I, R, Sa_g, total_weight):\n    Ah = (Z / 2.0) * (I / R) * Sa_g\n    return Ah * total_weight`
            },
            {
                stepNumber: 3,
                title: 'Vertical Lateral Force Distribution',
                description: 'Distribute total base shear across floors proportionally to floor mass and height squared (Qi = Vb * (Wi*hi^2)/sum(Wj*hj^2)).',
                codeSnippet: `floor_force = base_shear * (w[i] * h[i]**2) / sum(w * h**2)`
            },
            {
                stepNumber: 4,
                title: '3D Frame Element Stiffness Matrix Formulation',
                description: 'Construct 12x12 spatial frame element stiffness matrices accounting for axial, torsional, and bi-axial bending degrees of freedom.',
                codeSnippet: `k_element = assemble_spatial_beam_stiffness(E, G, A, Iz, Iy, J, length)`
            },
            {
                stepNumber: 5,
                title: 'Global Stiffness Assembly & Boundary Conditions',
                description: 'Assemble global stiffness matrix K (size 6*N x 6*N) and enforce fixed-base foundation restraints.',
                codeSnippet: `K_global[free_dofs, free_dofs] = K_sub\ndisplacements = np.linalg.solve(K_free, forces_free)`
            },
            {
                stepNumber: 6,
                title: 'Story Drift & P-Delta Stability Check',
                description: 'Calculate inter-story drift between adjacent floors and verify it does not exceed the mandatory 0.004 height limit.',
                codeSnippet: `drift_ratio = (disp[floor] - disp[floor-1]) / story_height\nassert drift_ratio <= 0.004, "Story drift violation!"`
            },
            {
                stepNumber: 7,
                title: 'Ductile Column & Beam Section Design',
                description: 'Design longitudinal and confining transverse reinforcement according to IS 13920:2016 ductile detailing rules.',
                codeSnippet: `// Confining hoop spacing: s <= min(d/4, 8*db, 100mm)`
            },
            {
                stepNumber: 8,
                title: 'Interactive Three.js 3D Wireframe Viewer',
                description: 'Render the structural frame wireframe in Three.js with exaggerated displacement scaling to visually demonstrate sway.',
                codeSnippet: `const line = new THREE.LineSegments(geometry, material);\nscene.add(line);`
            },
            {
                stepNumber: 9,
                title: 'Bending Moment & Shear Force Diagram Plotter',
                description: 'Plot continuous shear and bending moment envelopes along critical structural frames.',
                codeSnippet: `plot_moment_diagram(member_id, moments_list)`
            },
            {
                stepNumber: 10,
                title: 'Automated Calculation Report Generator',
                description: 'Export structured PDF engineering design calculation document detailing member check pass/fail flags.',
                codeSnippet: `pdf.generate_report("Seismic_Design_Report_G+10.pdf")`
            },
            {
                stepNumber: 11,
                title: 'Rebar Detailing & AutoCAD Schedule Export',
                description: 'Generate rebar cut lists, steel tonnage summaries, and structural cross-section drawings.',
                codeSnippet: `export_bar_bending_schedule(columns_list)`
            },
            {
                stepNumber: 12,
                title: 'Final Defense Presentation & Project Release',
                description: 'Review structural calculations and compile presentation slides for faculty evaluation.',
                codeSnippet: `git commit -m "Complete SeismoFrame G+10 analysis"`
            }
        ],
        testingGuide: {
            unitTests: 'Verify beam deflection matches Euler-Bernoulli analytical solutions for simple span benchmarks.',
            integrationTests: 'Validate total reactionary base shear matches applied lateral force sum within 0.1% tolerance.',
            performanceChecklist: 'Execute full 10-story 3D frame matrix inversion in < 3.5 seconds on Python NumPy.'
        },
        commonErrors: [
            { error: 'Singular matrix during global stiffness inversion', fix: 'Missing rotational restraint or unconstrained joint degree of freedom; verify support boundary conditions.' },
            { error: 'Excessive top-story drift ratio', fix: 'Increase column cross-section dimensions or introduce reinforced concrete shear walls in core bays.' },
            { error: 'Torsional irregularity in asymmetric plans', fix: 'Re-align center of mass with center of rigidity to reduce structural eccentricity.' }
        ],
        demoGuide: '1. Present the G+10 building architectural plan. 2. Show the Python script executing the lateral force distribution across stories. 3. Display the 3D Three.js wireframe model with animated sway. 4. Show the ductile detailing rebar schedule complying with IS 13920.',
        resumeBullet: 'Engineered a G+10 RC building structural analysis and seismic design model in Python and ETABS, automating 3D matrix stiffness calculations and ductile reinforcement detailing under IS 1893:2016 Zone V criteria.',
        interviewQuestions: [
            {
                question: 'What is the physical significance of the Response Reduction Factor (R) in seismic design?',
                answer: 'The response reduction factor accounts for the structural ductility, damping, and energy dissipation capacity of the building. Designing for the elastic earthquake force would be economically unviable; R reduces the design force while requiring ductile detailing so the structure deforms inelastically without collapsing.'
            },
            {
                question: 'Why is the "strong-column weak-beam" design philosophy enforced in earthquake engineering?',
                answer: 'In strong-column weak-beam design, flexural plastic hinges form in beams before columns. Beams dissipating energy through ductile yielding localized failure, whereas column yielding could cause catastrophic total story collapse.'
            }
        ],
        extensions: [
            { level: 'Level 2 Intermediate', title: 'RC Shear Wall Integration', description: 'Model coupled shear walls to resist 80% of lateral seismic forces in Zone V.' },
            { level: 'Level 3 Advanced', title: 'Nonlinear Pushover Analysis', description: 'Evaluate plastic hinge formation sequence under incrementally increasing lateral displacement.' },
            { level: 'Level 4 Production', title: 'BIM Revit API Plugin', description: 'Export analytical member dimensions automatically into Autodesk Revit structural models.' }
        ],
        targetCareers: ['Structural Design Engineer', 'Civil BIM Specialist', 'Earthquake Engineering Consultant', 'Construction Project Lead'],
        connectedVideos: ['4a0FbQdH3dY', '7K1sB05pE0A', '1mHjMNZZvFo']
    }
];

module.exports = {
    ALL_DEPARTMENTS,
    MASTER_PROJECTS_CATALOG
};
