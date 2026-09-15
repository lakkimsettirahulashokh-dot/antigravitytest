/* ==========================================================================
   BTechPath AI OS - Comprehensive Engineering Branch System & Careers
   Supports all major disciplines + Admin-configurable custom branches
   ========================================================================== */

const BranchSystem = {
  STORAGE_KEY: 'btechpath_custom_branches',

  // Master Branch Directory (All 40+ disciplines required by prompt)
  branches: [
    // 1. Computing & Information Sciences
    { code: 'CSE', name: 'Computer Science & Engineering', category: 'Computing', icon: 'computer',
      careers: ['Software Development Engineer (SDE)', 'Full-Stack Web Architect', 'Cloud Infrastructure Engineer', 'Cybersecurity Specialist', 'Distributed Systems Engineer'],
      coreSkills: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'System Design'] },
    { code: 'IT', name: 'Information Technology', category: 'Computing', icon: 'lan',
      careers: ['DevOps & Cloud Engineer', 'Enterprise Systems Architect', 'Database Administrator', 'Network Security Engineer', 'IT Solutions Consultant'],
      coreSkills: ['Cloud Computing (AWS/GCP)', 'Linux Administration', 'Network Architecture', 'Web Technologies', 'IT Project Management'] },
    { code: 'AI', name: 'Artificial Intelligence', category: 'Computing', icon: 'smart_toy',
      careers: ['AI Research Engineer', 'Computer Vision Engineer', 'NLP Specialist', 'Robotics AI Engineer', 'Deep Learning Architect'],
      coreSkills: ['PyTorch & TensorFlow', 'Linear Algebra & Calculus', 'Neural Networks', 'Transformer Architectures', 'Reinforcement Learning'] },
    { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', category: 'Computing', icon: 'psychology',
      careers: ['Machine Learning Engineer', 'MLOps Engineer', 'Predictive Modeling Specialist', 'AI Product Engineer', 'Cognitive Systems Analyst'],
      coreSkills: ['Machine Learning Algorithms', 'Model Deployment & Docker', 'Data Pipelines & Feature Stores', 'Statistics & Probability', 'Vector Databases'] },
    { code: 'DS', name: 'Data Science', category: 'Computing', icon: 'analytics',
      careers: ['Data Scientist', 'Big Data Engineer', 'Quantitative Analyst', 'Business Intelligence Architect', 'Data Visualization Specialist'],
      coreSkills: ['Statistical Inference', 'Apache Spark & Kafka', 'SQL & Data Warehousing', 'Pandas & NumPy', 'Hypothesis Testing'] },
    { code: 'AIDS', name: 'AI & Data Science', category: 'Computing', icon: 'query_stats',
      careers: ['Data Scientist', 'AI Solutions Engineer', 'Big Data Architect', 'Machine Learning Specialist'],
      coreSkills: ['Python & R', 'Data Mining', 'Machine Learning', 'Big Data Engineering', 'Feature Analysis'] },
    { code: 'CSIT', name: 'Computer Science & Information Technology', category: 'Computing', icon: 'lan',
      careers: ['Full-Stack Developer', 'Cloud Architect', 'Systems Engineer', 'DevOps Specialist'],
      coreSkills: ['DSA', 'Java/C++', 'Cloud Infrastructure', 'Databases', 'Web Architecture'] },
    { code: 'SE', name: 'Software Engineering', category: 'Computing', icon: 'code',
      careers: ['Principal Software Architect', 'Enterprise Systems Engineer', 'Full-Stack Lead', 'Application Developer'],
      coreSkills: ['Software Design Patterns', 'Clean Code', 'Agile & CI/CD', 'Testing & Verification'] },
    { code: 'CLOUD', name: 'Cloud Computing & DevOps', category: 'Computing', icon: 'cloud',
      careers: ['DevOps & Cloud Engineer', 'Site Reliability Engineer (SRE)', 'Platform Engineer', 'Kubernetes Administrator'],
      coreSkills: ['Docker & Kubernetes', 'Terraform (IaC)', 'AWS / GCP / Azure', 'Linux Systems', 'CI/CD Pipelines'] },
    { code: 'BLOCK', name: 'Blockchain Technology', category: 'Computing', icon: 'currency_bitcoin',
      careers: ['Smart Contract Developer', 'Blockchain Architect', 'Web3 Protocols Engineer', 'DeFi Developer'],
      coreSkills: ['Solidity', 'Rust', 'EVM Architecture', 'Cryptographic Primitives', 'Distributed Consensus'] },
    { code: 'IOT', name: 'Internet of Things (IoT)', category: 'Computing', icon: 'sensors',
      careers: ['IoT Systems Architect', 'Edge Computing Engineer', 'Sensor Network Specialist', 'Embedded IoT Developer'],
      coreSkills: ['MQTT & CoAP', 'Microcontrollers (ESP32)', 'Edge AI', 'Wireless Sensor Networks', 'Embedded C'] },
    { code: 'CYBER', name: 'Cyber Security & Digital Forensics', category: 'Computing', icon: 'security',
      careers: ['SOC Analyst', 'Penetration Tester / Ethical Hacker', 'Application Security Engineer', 'Cryptographic Engineer'],
      coreSkills: ['Network Protocols & Wireshark', 'Cryptography', 'Threat Hunting', 'Vulnerability Assessment'] },

    // 2. Electrical & Electronics
    { code: 'ECE', name: 'Electronics & Communication Engineering', category: 'Electrical', icon: 'settings_input_antenna',
      careers: ['VLSI Physical Design Engineer', 'Embedded Systems Firmware Developer', 'FPGA & Digital Design Engineer', 'RF & Antenna Engineer', 'IoT Systems Architect'],
      coreSkills: ['Digital System Design (Verilog/VHDL)', 'Embedded C/C++', 'Microcontrollers (ARM/RISC-V)', 'Signal & Image Processing', 'Analog CMOS Design'] },
    { code: 'EEE', name: 'Electrical & Electronics Engineering', category: 'Electrical', icon: 'bolt',
      careers: ['Power Systems Engineer', 'Electric Vehicle (EV) Powertrain Specialist', 'Industrial Automation & PLC Engineer', 'Renewable Energy Grid Architect', 'Substation Design Engineer'],
      coreSkills: ['Power Electronics', 'Electrical Machines', 'Control Systems Theory', 'Battery Management Systems (BMS)', 'SCADA & PLC Programming'] },
    { code: 'EIE', name: 'Electronics & Instrumentation Engineering', category: 'Electrical', icon: 'tune',
      careers: ['Instrumentation Specialist', 'Process Automation Engineer', 'Biomedical Instrument Designer', 'Sensor Systems Engineer', 'Control & Calibration Lead'],
      coreSkills: ['Sensors & Transducers', 'Industrial Instrumentation', 'DCS/PLC Systems', 'Data Acquisition (DAQ)', 'Bio-Signal Amplifiers'] },
    { code: 'VLSI', name: 'VLSI & Microelectronics', category: 'Electrical', icon: 'memory',
      careers: ['ASIC Verification Engineer', 'Physical Layout & Timing Engineer', 'Semiconductor Characterization Engineer', 'Analog Circuit Designer', 'SoC Design Architect'],
      coreSkills: ['SystemVerilog & UVM', 'Static Timing Analysis (STA)', 'CMOS Fabrication Tech', 'Place & Route (Cadence/Synopsys)', 'Low Power Architecture'] },
    { code: 'EMBEDDED', name: 'Embedded Systems', category: 'Electrical', icon: 'developer_board',
      careers: ['RTOS Firmware Architect', 'Automotive ECU Developer', 'IoT Hardware/Software Engineer', 'Robotics Systems Programmer', 'Kernel Driver Developer'],
      coreSkills: ['FreeRTOS & Embedded Linux', 'Device Driver Development', 'CAN / SPI / I2C Protocols', 'Hardware-Software Co-Design', 'C / Rust Programming'] },

    // 3. Mechanical, Robotics & Industrial
    { code: 'MECH', name: 'Mechanical Engineering', category: 'Mechanical', icon: 'precision_manufacturing',
      careers: ['CAD/CAM Design Engineer', 'Finite Element Analysis (FEA) Specialist', 'Automotive Propulsion Engineer', 'HVAC & Thermal Systems Designer', 'Robotics & Automation Lead'],
      coreSkills: ['SolidWorks / CATIA CAD', 'Thermodynamics & Heat Transfer', 'Fluid Mechanics & CFD', 'Mechanics of Materials', 'CNC & Modern Manufacturing'] },
    { code: 'AUTO', name: 'Automobile Engineering', category: 'Mechanical', icon: 'directions_car',
      careers: ['EV Battery & Powertrain Engineer', 'Chassis & Suspension Designer', 'Vehicle Dynamics Specialist', 'Autonomous Driving Systems Engineer', 'Crash Safety Analyst'],
      coreSkills: ['Automotive Dynamics', 'Electric & Hybrid Vehicles', 'Internal Combustion & Batteries', 'ANSYS Mechanical Simulation', 'Automotive Ergonomics'] },
    { code: 'MECHTRON', name: 'Mechatronics Engineering', category: 'Mechanical', icon: 'smart_toy',
      careers: ['Mechatronics Integration Engineer', 'Automation & Motion Control Specialist', 'Robotics Software Developer', 'Smart Manufacturing Architect', 'Electro-Mechanical Designer'],
      coreSkills: ['Actuators & Sensors', 'Microcontroller Interfacing', 'Control Theory', 'ROS (Robot Operating System)', 'Pneumatics & Hydraulics'] },
    { code: 'ROBOTICS', name: 'Robotics Engineering', category: 'Mechanical', icon: 'precision_manufacturing',
      careers: ['Robotics Algorithm Engineer', 'Motion Planning Specialist', 'Perception & SLAM Engineer', 'Cobot Systems Integrator', 'Autonomous Navigation Engineer'],
      coreSkills: ['Robot Kinematics & Dynamics', 'SLAM (Simultaneous Localization & Mapping)', 'OpenCV & Computer Vision', 'ROS 2 & Gazebo', 'C++ & Python for Robotics'] },
    { code: 'MFG', name: 'Manufacturing Engineering', category: 'Mechanical', icon: 'factory',
      careers: ['Manufacturing Systems Engineer', 'Additive Manufacturing (3D Printing) Lead', 'Tooling & Fixture Designer', 'Industry 4.0 Smart Factory Lead', 'Plant Layout Planner'],
      coreSkills: ['Advanced Machining Processes', 'Lean Manufacturing', '3D Metal Printing', 'CAD/CAM Integration', 'Shop Floor Automation'] },
    { code: 'IND', name: 'Industrial & Production Engineering', category: 'Mechanical', icon: 'conveyor_belt',
      careers: ['Operations Research Analyst', 'Supply Chain Optimization Engineer', 'Quality Assurance & Six Sigma Black Belt', 'Production Planning & Control Manager', 'Process Improvement Lead'],
      coreSkills: ['Statistical Quality Control', 'Supply Chain Analytics', 'Operations Research Modeling', 'Ergonomics & Work Study', 'ERP Systems (SAP)'] },

    // 4. Civil, Structural & Environmental
    { code: 'CIVIL', name: 'Civil Engineering', category: 'Civil', icon: 'architecture',
      careers: ['Structural Design Engineer', 'Construction Project Manager (BIM)', 'Geotechnical Engineer', 'Transportation Infrastructure Planner', 'Water Resources Engineer'],
      coreSkills: ['STAAD.Pro / ETABS Analysis', 'Building Information Modeling (BIM)', 'Soil Mechanics & Foundations', 'Concrete & Steel Technology', 'Surveying & GIS'] },
    { code: 'STRUCT', name: 'Structural Engineering', category: 'Civil', icon: 'domain',
      careers: ['High-Rise Structural Specialist', 'Bridge & Tunnel Engineer', 'Earthquake Resilient Design Engineer', 'Forensic Structural Auditor', 'Prestressed Concrete Architect'],
      coreSkills: ['Seismic Design Codes', 'Non-linear Structural Analysis', 'Finite Element Modeling for Civil', 'Prestressed Concrete', 'Wind Tunnel Analysis'] },
    { code: 'CONST', name: 'Construction Engineering & Management', category: 'Civil', icon: 'construction',
      careers: ['EPC Project Manager', 'Cost Estimation & Quantity Surveyor', 'Site Construction Superintendent', 'Safety & Compliance Officer', 'Smart Construction Technologist'],
      coreSkills: ['Primavera P6 & MS Project', 'Cost Estimation & Tendering', 'Construction Law & Contracts', 'Lean Construction Protocols', 'Prefabricated Construction'] },
    { code: 'TRANS', name: 'Transportation Engineering', category: 'Civil', icon: 'traffic',
      careers: ['Highway & Geometric Design Engineer', 'Traffic Flow Simulation Analyst', 'Metro & High-Speed Rail Planner', 'Intelligent Transportation Systems (ITS) Engineer', 'Airport Infrastructure Lead'],
      coreSkills: ['VISSIM / PTV Traffic Modeling', 'Highway Pavement Design', 'Urban Transit Planning', 'Geometric Design Codes', 'Traffic Signal Optimization'] },
    { code: 'ENV', name: 'Environmental Engineering', category: 'Civil', icon: 'eco',
      careers: ['Environmental Impact Assessment (EIA) Lead', 'Water & Wastewater Treatment Architect', 'Air Quality Management Specialist', 'Circular Economy & Waste Engineer', 'Carbon Footprint Auditor'],
      coreSkills: ['Wastewater Treatment Design', 'Air Pollution Dispersion Modeling', 'Environmental Microbiology', 'Solid Waste Resource Recovery', 'GIS for Environmental Monitoring'] },

    // 5. Chemical, Petroleum & Materials
    { code: 'CHEM', name: 'Chemical Engineering', category: 'Chemical', icon: 'science',
      careers: ['Chemical Process Design Engineer', 'Refinery Operations Specialist', 'Catalysis & Polymer Engineer', 'Scale-up & Pilot Plant Lead', 'Process Safety & HAZOP Leader'],
      coreSkills: ['Aspen Plus / HYSYS Simulation', 'Chemical Reaction Engineering', 'Mass & Heat Transfer Operations', 'Thermodynamics & Phase Equilibria', 'Process Dynamics & Control'] },
    { code: 'PETRO', name: 'Petroleum & Petrochemical Engineering', category: 'Chemical', icon: 'oil_barrel',
      careers: ['Reservoir Simulation Engineer', 'Drilling & Well Operations Lead', 'Petrochemical Refinery Architect', 'Offshore Production Engineer', 'Carbon Capture & Storage (CCS) Lead'],
      coreSkills: ['Reservoir Engineering', 'Petroleum Refining Technology', 'Well Logging & Petrophysics', 'Drilling Fluids & Hydraulics', 'Enhanced Oil Recovery (EOR)'] },
    { code: 'MET', name: 'Metallurgical & Materials Engineering', category: 'Chemical', icon: 'volcano',
      careers: ['Materials Selection & Failure Analyst', 'Aerospace Alloys Specialist', 'Corrosion Prevention Engineer', 'Nanomaterials Scientist', 'Extractive Metallurgy Lead'],
      coreSkills: ['Physical Metallurgy', 'X-ray Diffraction & SEM Analysis', 'Phase Transformations', 'Corrosion Engineering', 'Composite Materials'] },

    // 6. Biotechnology & Bioengineering
    { code: 'BIOTECH', name: 'Biotechnology', category: 'Bio', icon: 'biotech',
      careers: ['Bioprocess R&D Specialist', 'Genetic Engineering Scientist', 'Biopharmaceutical Formulation Lead', 'Microbial Fermentation Engineer', 'Regulatory Affairs Strategist'],
      coreSkills: ['Recombinant DNA Technology', 'Upstream & Downstream Processing', 'Bioreactor Design & Scale-up', 'Immunology & Cell Biology', 'Analytical HPLC & Mass Spec'] },
    { code: 'BIOINFO', name: 'Bioinformatics', category: 'Bio', icon: 'dna',
      careers: ['Computational Biologist', 'Genomics Data Scientist', 'Structural Biology & Drug Design Specialist', 'Bioinformatics Pipeline Developer', 'Clinical Genomics Analyst'],
      coreSkills: ['Next-Generation Sequencing (NGS) Analysis', 'Python & Biopython', 'Molecular Dynamics (GROMACS)', 'Bio-Database Mining (NCBI/UniProt)', 'Machine Learning in Genomics'] },
    { code: 'BIOMED', name: 'Biomedical Engineering', category: 'Bio', icon: 'monitor_heart',
      careers: ['Medical Device Hardware Designer', 'Biomedical Signal Processing Engineer', 'Prosthetics & Biomechanics Specialist', 'Clinical Systems Engineer', 'Medical Imaging Software Lead'],
      coreSkills: ['Bio-Sensors & Telemetry', 'Biomechanics & Biomaterials', 'Medical Imaging (MRI/CT Processing)', 'FDA 510(k) Medical Device Standards', 'Analog ECG/EEG Circuitry'] },

    // 7. Aerospace & Aeronautical
    { code: 'AERO', name: 'Aerospace Engineering', category: 'Aerospace', icon: 'rocket_launch',
      careers: ['Spacecraft Systems Architect', 'Propulsion & Rocket Engine Designer', 'Aerodynamicist (Supersonic & Hypersonic)', 'Orbital Mechanics Specialist', 'Space Mission Planner'],
      coreSkills: ['Orbital Mechanics (Astrodynamics)', 'Rocket Propulsion & Combustion', 'Computational Fluid Dynamics (CFD)', 'Aerospace Composite Structures', 'GNC (Guidance, Navigation, Control)'] },
    { code: 'AERONAUT', name: 'Aeronautical Engineering', category: 'Aerospace', icon: 'flight',
      careers: ['Aircraft Aerodynamicist', 'Gas Turbine Propulsion Engineer', 'Flight Dynamics & Control Engineer', 'Aero-Structural Stress Analyst', 'Airworthiness & Certification Specialist'],
      coreSkills: ['Aircraft Stability & Control', 'Compressible Flow & Shock Waves', 'Gas Turbine Engines', 'Aircraft Structural Design', 'Flight Simulation Modeling'] },
    { code: 'AVIONICS', name: 'Avionics Engineering', category: 'Aerospace', icon: 'radar',
      careers: ['Avionics Systems Integrator', 'Flight Control Computers Architect', 'Radar & Satellite Communication Engineer', 'Airborne Embedded Software Engineer', 'Navigation & GPS Specialist'],
      coreSkills: ['DO-178C & DO-254 Aerospace Standards', 'Avionics Bus Protocols (MIL-STD-1553, ARINC 429)', 'Radar Signal Processing', 'Inertial Navigation Systems (INS)', 'Fly-By-Wire Architecture'] },

    // 8. Agricultural, Food, Marine & Specialized
    { code: 'AGRI', name: 'Agricultural Engineering', category: 'Specialized', icon: 'agriculture',
      careers: ['Precision Farming & Drone Specialist', 'Soil & Water Conservation Engineer', 'Farm Power & Machinery Designer', 'Post-Harvest Technology Lead', 'Smart Greenhouse Automation Engineer'],
      coreSkills: ['Hydrology & Irrigation Design', 'Farm Machinery Kinematics', 'GIS & Satellite Remote Sensing for Agriculture', 'Bio-Energy & Bio-Fuel Production', 'Sensor-based Automated Irrigation'] },
    { code: 'FOOD', name: 'Food Technology', category: 'Specialized', icon: 'nutrition',
      careers: ['Food Process Design Specialist', 'Quality Assurance & HACCP Lead', 'Novel Food Product Developer', 'Food Packaging Technologist', 'Sensory Evaluation & Safety Scientist'],
      coreSkills: ['Food Microbiology & Fermentation', 'Thermal Food Processing', 'Rheology & Texture Analysis', 'Food Safety Auditing (FSSAI/FDA)', 'Aseptic Packaging Engineering'] },
    { code: 'TEXTILE', name: 'Textile Engineering', category: 'Specialized', icon: 'styler',
      careers: ['Smart Textiles & Wearables Developer', 'Technical Textiles Specialist (Aerospace/Medical)', 'Polymer Fiber Extrusion Engineer', 'Sustainable Dyeing & Finishing Lead', 'Textile Plant Operations Manager'],
      coreSkills: ['Fiber Science & Polymer Chemistry', 'Yarn & Fabric Manufacturing', 'Technical & Geo-Textiles', 'Surface Chemistry & Colorimetry', 'Eco-friendly Textile Processing'] },
    { code: 'MARINE', name: 'Marine Engineering', category: 'Specialized', icon: 'sailing',
      careers: ['Chief Marine Engineer (Offshore)', 'Naval Propulsion & Auxiliary Systems Lead', 'Ship Automation & Automation Specialist', 'Shipyard Construction Manager', 'Maritime Safety Inspector'],
      coreSkills: ['Marine Diesel Engines & Turbines', 'Naval Architecture & Hydrodynamics', 'Refrigeration & Auxiliary Systems', 'Ship Electrical & Automation Control', 'MARPOL Environmental Regulations'] },
    { code: 'MINING', name: 'Mining Engineering', category: 'Specialized', icon: 'hardware',
      careers: ['Mine Planning & Scheduling Engineer', 'Rock Mechanics & Slope Stability Specialist', 'Drilling & Blasting Optimization Lead', 'Mineral Processing Technologist', 'Mine Safety & Ventilation Director'],
      coreSkills: ['Rock Mechanics & Ground Control', 'Surface & Underground Mining Methods', 'Mine Ventilation Systems', 'Geostatistics & Block Modeling', 'Blasting Physics & Vibration Analysis'] },
    { code: 'ENERGY', name: 'Energy Engineering', category: 'Specialized', icon: 'solar_power',
      careers: ['Solar PV & Wind Farm Design Engineer', 'Energy Storage & Green Hydrogen Specialist', 'Energy Auditor & Efficiency Consultant', 'Smart Grid Operations Engineer', 'Carbon Mitigation Project Lead'],
      coreSkills: ['Solar Thermal & Photovoltaic Systems', 'Wind Turbine Aerodynamics', 'Electrochemical Energy Storage', 'Energy Audit & ISO 50001 Standards', 'Microgrid Controller Architecture'] }
  ],

  // Initialize and load any admin-configured custom branches from localStorage / Supabase
  init() {
    this.branches.forEach(b => {
      if (b.is_active === undefined) b.is_active = true;
    });

    try {
      if (typeof localStorage !== 'undefined') {
        const custom = localStorage.getItem(this.STORAGE_KEY);
        if (custom) {
          const parsed = JSON.parse(custom);
          parsed.forEach(cb => {
            if (!this.branches.some(b => b.code.toUpperCase() === cb.code.toUpperCase())) {
              cb.is_active = cb.is_active !== false;
              this.branches.push(cb);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not load custom branches', e);
    }
  },

  // Asynchronous sync from Supabase database (with /api/branches fallback)
  async loadFromSupabase() {
    this.init();

    // 1. Try Supabase Bridge first
    if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.isConfigured && SupabaseBridge.isConfigured()) {
      const client = SupabaseBridge.getClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('branches')
            .select('*')
            .order('name');
          if (data && !error && data.length > 0) {
            data.forEach(dbBranch => {
              const existing = this.branches.find(b => b.code.toUpperCase() === dbBranch.code.toUpperCase());
              if (existing) {
                existing.name = dbBranch.name || existing.name;
                existing.category = dbBranch.category || existing.category;
                existing.icon = dbBranch.icon || existing.icon;
                existing.is_active = dbBranch.is_active !== false;
              } else {
                this.branches.push({
                  code: dbBranch.code,
                  name: dbBranch.name,
                  category: dbBranch.category || 'Specialized',
                  icon: dbBranch.icon || 'school',
                  is_active: dbBranch.is_active !== false,
                  careers: Array.isArray(dbBranch.careers) ? dbBranch.careers : ['Specialized Engineer'],
                  coreSkills: Array.isArray(dbBranch.core_skills) ? dbBranch.core_skills : ['Core Foundations']
                });
              }
            });
            return this.getActiveBranches();
          }
        } catch (err) {
          console.warn('[BranchSystem] Supabase branches query error:', err.message);
        }
      }
    }

    // 2. Try Local Server REST Endpoint
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && Array.isArray(payload.branches)) {
          payload.branches.forEach(sbBranch => {
            const existing = this.branches.find(b => b.code.toUpperCase() === sbBranch.code.toUpperCase());
            if (existing) {
              existing.is_active = sbBranch.is_active !== false;
            } else {
              this.branches.push({
                ...sbBranch,
                is_active: sbBranch.is_active !== false,
                careers: ['Specialized Systems Engineer'],
                coreSkills: ['Core Engineering Fundamentals']
              });
            }
          });
        }
      }
    } catch (e) {
      // Offline / Static mode: local catalog intact
    }

    return this.getActiveBranches();
  },

  getAllBranches() {
    this.init();
    return this.branches;
  },

  getActiveBranches() {
    this.init();
    return this.branches.filter(b => b.is_active !== false);
  },

  getCategories() {
    const branches = this.getActiveBranches();
    const set = new Set();
    branches.forEach(b => set.add(b.category || 'Specialized'));
    return Array.from(set);
  },

  getBranchesByCategory(category) {
    if (!category) {
      const grouped = {};
      this.getActiveBranches().forEach(b => {
        const cat = b.category || 'Specialized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(b);
      });
      return grouped;
    }
    return this.getActiveBranches().filter(b => (b.category || 'Specialized').toLowerCase() === String(category).toLowerCase());
  },

  getBranch(code) {
    this.init();
    if (!code) return this.branches[0];
    return this.branches.find(b => b.code.toUpperCase() === code.toUpperCase()) || this.branches[0];
  },

  getBranchCareers(code) {
    const b = this.getBranch(code);
    return b ? b.careers : this.branches[0].careers;
  },

  searchBranches(query) {
    if (!query) return this.getActiveBranches();
    const q = query.toLowerCase().trim();
    return this.getActiveBranches().filter(b =>
      b.code.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  },

  // Generate grouped HTML <optgroup> options for any select dropdown
  renderSelectOptions(selectedCode = '') {
    const active = this.getActiveBranches();
    const categoryDisplayNames = {
      'Computing': 'Computing, Software & Artificial Intelligence',
      'Electrical': 'Electrical, Electronics & Semiconductors',
      'Mechanical': 'Mechanical, Robotics & Automotive',
      'Civil': 'Civil, Infrastructure & Environmental',
      'Chemical': 'Chemical, Petrochemical & Process',
      'Bio': 'Biotechnology, Life Sciences & Biomedical',
      'Biotech': 'Biotechnology, Life Sciences & Biomedical',
      'Aerospace': 'Aerospace, Avionics & Defense',
      'Marine': 'Marine & Naval Architecture',
      'Specialized': 'Materials, Energy & Specialized Disciplines'
    };

    const groups = {};
    active.forEach(branch => {
      const cat = branch.category || 'Specialized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(branch);
    });

    let html = '';
    for (const [cat, list] of Object.entries(groups)) {
      const groupLabel = categoryDisplayNames[cat] || `${cat} Engineering`;
      html += `<optgroup label="${groupLabel}">`;
      list.forEach(b => {
        const isSelected = selectedCode && selectedCode.toUpperCase() === b.code.toUpperCase() ? 'selected' : '';
        html += `<option value="${b.code}" ${isSelected}>B.Tech — ${b.name} (${b.code})</option>`;
      });
      html += `</optgroup>`;
    }
    return html;
  },

  // Populate any <select> element with the full 45+ categorized branch catalog
  populateSelect(selectElementOrId, selectedCode = '') {
    const el = typeof selectElementOrId === 'string'
      ? document.getElementById(selectElementOrId)
      : selectElementOrId;
    if (!el) return;

    const currentVal = selectedCode || el.value || 'AIML';
    el.innerHTML = this.renderSelectOptions(currentVal);
    el.value = currentVal;
  },

  addCustomBranch(branchData) {
    this.init();
    if (!branchData.code || !branchData.name) return false;
    const cleanData = {
      ...branchData,
      code: branchData.code.toUpperCase().trim(),
      is_active: branchData.is_active !== false,
      careers: branchData.careers || ['Specialized Systems Engineer'],
      coreSkills: branchData.coreSkills || ['Core Engineering Foundations']
    };
    this.branches.push(cleanData);
    try {
      const custom = localStorage.getItem(this.STORAGE_KEY);
      const parsed = custom ? JSON.parse(custom) : [];
      parsed.push(cleanData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Auto initialize
BranchSystem.init();

if (typeof window !== 'undefined') {
  window.BranchSystem = BranchSystem;
  window.BTechBranches = BranchSystem;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BranchSystem;
}
