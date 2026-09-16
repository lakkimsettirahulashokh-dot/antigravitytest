const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'data', 'branch_learning_catalog.json');
let catalog = {};
if (fs.existsSync(catalogPath)) {
  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } catch (e) {
    catalog = {};
  }
}

// -----------------------------------------------------------------------------
// 1. EIE: ELECTRICAL & INSTRUMENTATION ENGINEERING
// -----------------------------------------------------------------------------
catalog['EIE'] = {
  branchCode: 'EIE',
  branchName: 'Electrical & Instrumentation Engineering',
  slug: 'eie',
  specializationTitle: 'Industrial Instrumentation, Process Control & Automation',
  specializationTagline: 'Sensors, industrial transducers, PLC/SCADA, distributed control systems (DCS), and precision measurement',
  badge: 'INSTRUMENTATION & INDUSTRIAL AUTOMATION',
  icon: 'tune',
  accentColor: '#06b6d4',
  topicsCount: 25,
  overview: 'Electrical & Instrumentation Engineering (EIE) represents the critical neural network of modern industrial plants, manufacturing refineries, power stations, and robotic automation lines. This specialization bridges precision electrical metrology with modern software automation: from primary sensors, transducers, and signal conditioners, through feedback control mathematics and digital signal processing, to industrial Programmable Logic Controllers (PLCs), Supervisory Control and Data Acquisition (SCADA), and Distributed Control Systems (DCS).',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Electrical Fundamentals & Precision Measurement',
      badge: 'Circuit Theory & Metrology',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'eie-circuits-theorems',
          name: 'Circuit Analysis, Network Theorems & AC Bridges',
          content: 'Foundational circuit analysis for precision instrumentation:\n• Kirchhoff’s Laws (KCL, KVL) applied to complex multi-mesh sensor networks.\n• Thevenin & Norton Equivalent Circuits: Simplifying non-linear sensor loading effects into linear voltage/current sources with internal impedance.\n• AC Bridges for Impedance Measurement: Maxwell Bridge (medium inductance), Hay Bridge (high Q inductance), Schering Bridge (capacitance and dielectric loss factor), and Wien Bridge (frequency & distortion measurement).\n• Operating Equations: In balanced bridge condition, Z1 * Z4 = Z2 * Z3. Phase angle balance must be simultaneously satisfied: ∠θ1 + ∠θ4 = ∠θ2 + ∠θ3.'
        },
        {
          id: 'eie-analog-digital-meters',
          name: 'Electromechanical & Digital Meters (PMMC, MI & DMM)',
          content: 'Precision electrical meters and signal measurement devices:\n• PMMC (Permanent Magnet Moving Coil): Operates on Lorentz force (F = B * I * L). Features linear deflecting torque (Td = B * I * N * A). Measures DC exclusively with high sensitivity (up to 50 μA full scale).\n• Moving Iron (MI): Attraction and repulsion types. Deflecting torque proportional to current squared (Td = 0.5 * I^2 * (dL/dθ)), measuring true RMS value of AC and DC waveforms.\n• Digital Multimeter (DMM) Architecture: Dual-slope integrating Analog-to-Digital Converter (ADC), input auto-ranging attenuators, current-to-voltage converters, and RMS-to-DC converters with high input impedance (>10 MΩ).'
        },
        {
          id: 'eie-signal-conditioning',
          name: 'Signal Conditioning & Instrumentation Amplifiers',
          content: 'Conditioning raw low-level sensor signals for digitization:\n• Operational Amplifiers in Instrumentation: Low offset voltage drift, ultra-high CMRR (>100 dB), high input impedance (10^12 Ω with JFET inputs).\n• 3-Op-Amp Instrumentation Amplifier: Gain equation Vout = (1 + 2*R1/Rg) * (R3/R2) * (V2 - V1). Setting a single resistor Rg adjusts gain without degrading common-mode rejection.\n• Active Filtering: Butterworth (maximally flat passband), Chebyshev (sharp transition band cutoff), and Bessel (linear phase response) low-pass active filters for anti-aliasing prior to ADC sampling.\n• Galvanic Isolation: Optical isolators (optocouplers) and capacitive isolation barriers eliminating high-voltage industrial ground loops.'
        },
        {
          id: 'eie-measurement-error',
          name: 'Measurement Systems, Errors & Calibration Standards',
          content: 'Metrology characteristics and standards:\n• Static Characteristics: Accuracy, precision, sensitivity, resolution, dead band, hysteresis, and repeatability.\n• Dynamic Characteristics: Zero-order, first-order (time constant τ), and second-order (natural frequency ωn, damping ratio ζ) sensor dynamic responses to step and sinusoidal inputs.\n• Error Classification: Gross errors (human operator), Systematic errors (instrumental, environmental, loading), and Random errors (Gaussian noise distribution).\n• Calibration & Traceability: Calibration hierarchy tracing back to international SI standards maintained by national metrology institutes (NIST / NPL).'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Sensors, Transducers & Industrial Metrology',
      badge: 'Sensors & Transducers',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'eie-temp-sensors',
          name: 'Temperature Transducers (RTD, Thermocouple, Thermistor & Pyrometer)',
          content: 'Industrial temperature measurement principles and selection:\n• RTD (Resistance Temperature Detector): Platinum Pt100 (100 Ω at 0°C, α = 0.00385 Ω/Ω/°C). Linear Callendar-Van Dusen relationship. 3-wire and 4-wire lead resistance cancellation.\n• Thermocouples: Seebeck effect (thermoelectric voltage across dissimilar metal junctions: V = α * ΔT). J-type (Iron-Constantan), K-type (Chromel-Alumel), S/R-type (Platinum-Rhodium). Cold junction compensation (CJC) using thermistors or solid-state silicon sensors.\n• Thermistors (NTC/PTC): Sintered metal oxides with high negative temperature coefficient governed by Steinhart-Hart equation (1/T = A + B*ln(R) + C*(ln(R))^3).\n• Radiation Pyrometry: Non-contact infrared temperature measurement based on Stefan-Boltzmann law (E = ε * σ * T^4) and Wien\'s displacement law.'
        },
        {
          id: 'eie-pressure-transducers',
          name: 'Pressure Transducers (Strain Gauges, Piezoelectric & Capacitive)',
          content: 'Continuous static and dynamic pressure sensing:\n• Resistance Strain Gauges: Piezoresistive effect. Gauge factor GF = (ΔR/R) / (ΔL/L) = 1 + 2ν + (Δρ/ρ)/ε. Mounted on elastic diaphragms in full Wheatstone bridge configuration with temperature compensation.\n• Capacitive Pressure Transducers: Diaphragm displacement alters capacitor plate separation (C = ε * A / d). High sensitivity, excellent linearity, and minimal thermal hysteresis.\n• Piezoelectric Transducers: Quartz and PZT crystals generating electric charge in response to mechanical stress (q = d * F). Dedicated to fast dynamic pressure fluctuations and shockwaves (zero static DC response due to internal charge leakage).\n• Bourdon Tubes & Bellows: Mechanical elastic deformation elements linked to LVDTs for local and remote pneumatic telemetry.'
        },
        {
          id: 'eie-flow-level-sensors',
          name: 'Flow & Level Measurement (Electromagnetic, Ultrasonic & Radar)',
          content: 'Industrial fluid dynamics and storage level metrology:\n• Flow Measurement:\n  - Differential Pressure (DP): Orifice plates, Venturi tubes, and Pitot tubes based on Bernoulli equation (Q = Cd * A * √(2ΔP/ρ)).\n  - Electromagnetic Flowmeter: Faraday\'s law of induction (E = B * v * D) for conductive liquid slurries without pipe obstructions.\n  - Ultrasonic Flowmeter: Transit-time difference (Δt = 2 * L * v * cosθ / c^2) and Doppler shift frequency analysis.\n• Level Measurement:\n  - Hydrostatic Pressure: P = ρ * g * h using DP transmitters with diaphragm seals.\n  - Ultrasonic & Guided Wave Radar (GWR): Time-of-Flight (ToF) reflection of microwave pulses off liquid-vapor interfaces.'
        },
        {
          id: 'eie-displacement-vibration',
          name: 'Displacement, Proximity & Vibration Sensors (LVDT, Hall & MEMS)',
          content: 'Position, speed, and vibration monitoring:\n• LVDT (Linear Variable Differential Transformer): Mutually inductive transducer with primary coil and two opposed secondary coils. Output voltage amplitude indicates displacement magnitude; phase angle indicates direction.\n• Eddy Current Proximity Probes: High-frequency RF magnetic field measuring non-contact shaft vibration and radial runout in turbomachinery.\n• Hall Effect & Optical Encoders: Rotary incremental and absolute Gray-code encoders for angular shaft position and velocity feedback.\n• MEMS Accelerometers: Micro-machined silicon cantilever seismic masses with capacitive sensing electrodes for 3-axis machine vibration diagnostics (ISO 10816 standards).'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Control Systems & Process Loop Dynamics',
      badge: 'Control Theory',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'eie-feedback-control',
          name: 'Feedback Control Fundamentals & Transfer Functions',
          content: 'Classical and modern control systems theory:\n• Open-Loop vs. Closed-Loop Control: Negative feedback reducing plant sensitivity to parameter variations and external disturbances.\n• Mathematical Modeling: Laplace transform modeling of physical electrical, hydraulic, thermal, and mechanical systems. Transfer function G(s) = Y(s) / U(s).\n• Transient Response Characteristics: Rise time (tr), peak time (tp), percentage overshoot (%OS = e^(-ζπ / √(1-ζ^2)) * 100), settling time (ts = 4 / (ζ * ωn)), and steady-state error (ess).'
        },
        {
          id: 'eie-stability-analysis',
          name: 'Control Stability (Routh-Hurwitz, Root Locus & Bode Plots)',
          content: 'Frequency and time domain stability criteria:\n• Characteristic Equation: 1 + G(s)H(s) = 0. System is asymptotically stable if and only if all poles reside strictly in the Left Half of the s-plane (LHP).\n• Routh-Hurwitz Stability Criterion: Algebraic test on polynomial coefficients without direct root factorization.\n• Root Locus Technique: Trajectory of closed-loop poles as scalar loop gain K varies from 0 to ∞.\n• Frequency Response: Bode plot analysis determining Gain Margin (GM) and Phase Margin (PM). Nyquist stability criterion based on Cauchy’s argument principle for non-minimum phase plants.'
        },
        {
          id: 'eie-pid-controllers',
          name: 'Industrial PID Controllers & Tuning Methodologies',
          content: 'Three-term controller algorithms and closed-loop optimization:\n• Proportional (P): Output proportional to error (u(t) = Kp * e(t)). Accelerates response but leaves persistent steady-state offset.\n• Integral (I): Accumulates error over time (Ki * ∫ e(t) dt). Eliminates steady-state error completely; causes phase lag and potential integrator windup.\n• Derivative (D): Responds to rate of error change (Kd * de(t)/dt). Anticipates future errors, adding damping and phase lead; sensitive to high-frequency sensor noise.\n• Industrial Tuning: Ziegler-Nichols open-loop process reaction curve and closed-loop ultimate oscillation method (Ku, Pu). Cohen-Coon and IMC (Internal Model Control) tuning rules.'
        },
        {
          id: 'eie-valves-actuators',
          name: 'Final Control Elements: Control Valves & Actuators',
          content: 'Pneumatic, hydraulic, and electrical actuators:\n• Control Valve Trim & Flow Characteristics: Linear, Equal Percentage (ΔQ/Q = R * Δh/h), and Quick Opening.\n• Actuators: Pneumatic diaphragm actuators with fail-safe return springs (Air-to-Open / Fail-Closed vs. Air-to-Close / Fail-Open).\n• Valve Positioners: Digital smart electro-pneumatic positioners with 4-20 mA current loop input and HART feedback for valve stem position correction.\n• Cavitation & Flashing: Pressure drops below liquid vapor pressure causing vapor bubbles to collapse violently, eroding valve plugs and downstream piping.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Industrial Automation, PLC, SCADA & DCS',
      badge: 'Automation Architecture',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'eie-plc-architecture',
          name: 'Programmable Logic Controllers (PLC) & IEC 61131-3 Languages',
          content: 'Industrial digital computer architecture:\n• Hardware Architecture: Ruggedized CPU, optically isolated digital I/O (24V DC), analog I/O (4-20 mA, 0-10V DC with 16-bit ADC/DAC), power supply, and communication rack.\n• Scan Cycle: 1. Read Inputs → 2. Execute Program Logic → 3. Write Outputs → 4. Diagnostics & Communication.\n• IEC 61131-3 Standard Programming Languages:\n  1. Ladder Diagram (LD): Graphical contact-and-coil relay logic.\n  2. Function Block Diagram (FBD): Signal flow through modular mathematical blocks.\n  3. Structured Text (ST): Pascal-like high-level language for complex arithmetic.\n  4. Sequential Function Chart (SFC): State-machine step-transition execution for batch automation.\n  5. Instruction List (IL).'
        },
        {
          id: 'eie-scada-hmi',
          name: 'SCADA, HMI & Industrial Telemetry Architecture',
          content: 'Plant supervisory monitoring and visualization:\n• SCADA (Supervisory Control and Data Acquisition): Central server architecture collecting real-time process telemetry from remote terminal units (RTUs) and PLCs over wide-area networks.\n• HMI (Human-Machine Interface): Touchpanel displays on machine shop floors displaying dynamic process graphics, alarms, trends, and recipe management.\n• Industrial Alarming: High-High (HH), High (H), Low (L), Low-Low (LL) alarm setpoints, alarm shelving, and ISA-18.2 alarm management lifecycle standards.'
        },
        {
          id: 'eie-dcs-systems',
          name: 'Distributed Control Systems (DCS) & Safety Instrumented Systems (SIS)',
          content: 'Large-scale continuous plant control and functional safety:\n• DCS Architecture: Redundant controllers and I/O nodes distributed across an entire petrochemical refinery or power plant (e.g., Emerson DeltaV, Honeywell Experion, ABB 800xA, Yokogawa Centum).\n• SIS (Safety Instrumented Systems): Independent emergency shutdown (ESD) layer operating on IEC 61508 / IEC 61511 standards.\n• Safety Integrity Level (SIL): SIL 1 to SIL 4 classification based on Probability of Failure on Demand (PFDavg), 2-out-of-3 (2oo3) voting logic for catastrophic risk mitigation.'
        },
        {
          id: 'eie-industrial-bus',
          name: 'Industrial Communication Protocols (Modbus, Profibus, OPC UA & IIoT)',
          content: 'Fieldbuses and plant network communication protocols:\n• Fieldbus Standards: RS-485 serial communication, Modbus RTU/TCP, Profibus-DP, Foundation Fieldbus, and HART (Highway Addressable Remote Transducer: FSK digital signal superimposed over 4-20 mA analog wires).\n• Industrial Ethernet: Profinet, EtherCAT, and Ethernet/IP delivering deterministic sub-millisecond motion synchronization.\n• OPC Unified Architecture (OPC UA): Platform-independent, service-oriented data exchange bridging OT (Operational Technology) shop floor sensors to IT cloud analytics.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'eie-career-roles',
          name: 'Instrumentation & Process Automation Career Paths',
          content: 'Premier industry roles for EIE graduates:\n• Process Instrumentation Engineer: Specifies, calibrates, and commissions sensors, control valves, and transmitters in oil/gas, pharmaceuticals, and power plants.\n• Industrial Automation / PLC Programmer: Develops logic, HMI screens, and safety systems for automotive assembly lines and robotic workcells.\n• DCS Systems Specialist: Architects multi-thousand I/O redundant control networks, loop tuning, and batch automation engines.\n• Metrology & Calibration Engineer: Maintains primary measurement standards, uncertainty budgets, and ISO/IEC 17025 compliance in precision calibration labs.\n• Embedded Instrumentation Designer: Designs smart IIoT edge sensors with low-power microcontrollers, 24-bit ADCs, and wireless telemetry (LoRaWAN / WirelessHART).\n• Safety Systems (SIS/SIL) Consultant: Performs HAZOP (Hazard and Operability) studies and validates safety integrity levels for critical process units.'
        },
        {
          id: 'eie-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Hardware & Sensors: 4-20 mA loop design, RTD/Thermocouple wiring, P&ID (Piping & Instrumentation Diagram) reading, LVDT, smart positioners.\n• PLC & PAC Software: Siemens TIA Portal (S7-1200 / S7-1500), Rockwell RSLogix / Studio 5000, Schneider EcoStruxure, Beckhoff TwinCAT.\n• SCADA / HMI Platforms: Wonderware InTouch, Ignition by Inductive Automation, WinCC, FactoryTalk View.\n• Calibration Software & Instruments: Beamex, Fluke Documenting Process Calibrators, HART 475 / Trex communicators.\n• Programming & Analytics: C/C++ for embedded microcontrollers, Python for process data science and automated test scripting, IEC 61131-3 (Ladder, Structured Text).\n• Industrial Standards: ISA-5.1 (Instrumentation Symbols), IEC 61508 / 61511 (Functional Safety), ISO 9001, ATEX / IECEx (hazardous area classification).'
        },
        {
          id: 'eie-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Mathematics (Differential Equations, Laplace), Circuit Theory, Basic Electrical Engineering, Engineering Physics, C Programming.\n• Year 2 (Semesters 3-4): Electrical & Electronic Measurements, Analog Electronics (Op-Amps & Filters), Sensors & Transducers, Digital Logic & Microprocessors (8051 / ARM).\n• Year 3 (Semesters 5-6): Linear Control Systems, Industrial Instrumentation (Flow/Level/Pressure/Temp), Signal Conditioning, PLC Programming & Industrial Data Communications.\n• Year 4 (Semesters 7-8): Process Control Dynamics, Distributed Control Systems (DCS), Virtual Instrumentation (LabVIEW), Safety Instrumented Systems (SIL), Capstone Industrial Project.'
        },
        {
          id: 'eie-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Industrial Closed-Loop Three-Tank Water Level Control Station: Implemented on a Siemens S7-1200 PLC using analog ultrasonic level transmitters, motorized proportional control valves, and custom PID tuning with anti-windup algorithms.\n2. Smart Multi-Sensor Edge Telemetry Transmitter (HART & LoRaWAN): Designed a battery-powered sensor node using ARM Cortex-M0+, 24-bit Sigma-Delta ADC, RTD cold-junction compensated thermocouple front-end, and HART FSK physical layer modem.\n3. SCADA Supervisory Control Dashboard for Automated Bottling Plant: Developed in Ignition SCADA with real-time Modbus TCP telemetry, dynamic SVG tank visualization, automated alarm shelving, and SQL database batch tracking.\n4. Precision Impedance Measurement Analyzer with Active Lead Compensation: Built a precision 4-wire LCR meter utilizing an STM32 microcontroller, DDS sine wave generator, synchronous demodulator, and automated calibration routines.'
        },
        {
          id: 'eie-interview-questions',
          name: 'Top Instrumentation & Control Technical Interview Questions',
          content: 'Q1: Why is the 4-20 mA current loop universally preferred over voltage signaling (0-10V) in industrial plants?\nA: Current loops have four immense advantages: 1. Immunity to lead-wire resistance and voltage drops over kilometer-long distances, as current remains constant throughout a series loop; 2. Superior immunity to industrial electrical noise and EMI; 3. \'Live Zero\' (4 mA represents zero scale, not 0 mA), enabling the system to immediately distinguish between a true zero reading and a broken/disconnected wire (0 mA = wire break fault); 4. The 4 mA baseline allows 2-wire loop-powered field instruments to draw operating electrical power directly from the signal loop without requiring separate power cables.\n\nQ2: What is the difference between a 2-wire, 3-wire, and 4-wire RTD connection?\nA: Lead wires have non-zero electrical resistance that adds directly to the RTD sensor resistance, causing severe temperature measurement error. In a 2-wire setup, lead resistance cannot be compensated. In a 3-wire setup, a Wheatstone bridge with two matched lead wires placed in adjacent arms balances out lead resistance, assuming both wires are at identical temperatures. In a 4-wire setup, a precision constant current is passed through two outer leads while a high-impedance voltmeter measures voltage across the inner two leads (Kelvin sensing), drawing virtually zero current and eliminating lead-wire resistance error completely.\n\nQ3: Explain the operational differences between PLC, SCADA, and DCS.\nA: A PLC is a dedicated high-speed real-time hardware controller executing local sequential discrete and analog logic (scan times of 1-10 ms). SCADA is a software supervisory monitoring and telemetry system that aggregates data from multiple geographically dispersed PLCs and RTUs over wide-area networks (scan times seconds). A DCS (Distributed Control System) is an integrated, tightly coupled plant-wide control platform where controllers, I/O modules, engineering servers, and operator HMIs share a single unified global database and redundant network, designed specifically for continuous large-scale process industries where controller failure is intolerable.'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 2. EEE: ELECTRICAL & ELECTRONICS ENGINEERING
// -----------------------------------------------------------------------------
catalog['EEE'] = {
  branchCode: 'EEE',
  branchName: 'Electrical & Electronics Engineering',
  slug: 'eee',
  specializationTitle: 'Power Systems, Electric Machines & Power Electronics',
  specializationTagline: 'Grid stability, high-voltage transmission, synchronous machines, inverters, EV powertrains, and renewable energy integration',
  badge: 'ELECTRICAL POWER & ENERGY SYSTEMS',
  icon: 'bolt',
  accentColor: '#eab308',
  topicsCount: 25,
  overview: 'Electrical & Electronics Engineering (EEE) is the powerhouse of the electrified world, governing generation, transmission, conversion, and intelligent control of massive electrical energy. This specialization explores 3-phase AC power networks, electromagnetic machinery, semiconductor power switching (IGBTs, SiC, GaN), modern microgrids, electric vehicle drives, and smart grid automation.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Electric Circuits, Magnetics & 3-Phase Systems',
      badge: 'Circuit Theory & Magnetics',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'eee-3phase-systems',
          name: '3-Phase AC Circuits (Star vs. Delta & Power Calculation)',
          content: 'Polyphase AC circuits theory:\n• Star (Y) Connection: Line voltage V_L = √3 * V_ph (with 30° phase lead); Line current I_L = I_ph. Neutral wire provides return path and enables dual single-phase/3-phase supply.\n• Delta (Δ) Connection: Line voltage V_L = V_ph; Line current I_L = √3 * I_ph (with 30° phase lag).\n• 3-Phase Power Equations: Real Power P = √3 * V_L * I_L * cos(θ); Reactive Power Q = √3 * V_L * I_L * sin(θ); Apparent Power S = √3 * V_L * I_L.\n• Two-Wattmeter Method: W1 + W2 = Total 3-Phase Active Power; tan(θ) = √3 * (W1 - W2) / (W1 + W2).'
        },
        {
          id: 'eee-electromagnetics',
          name: 'Magnetic Circuits, Inductance & Core Losses',
          content: 'Electromagnetic principles governing electrical machines:\n• Magnetic Circuit Analogy: Magnetomotive Force (MMF = N*I, Ampere-turns) is analogous to EMF; Magnetic Flux (Φ, Webers) is analogous to current; Reluctance (ℜ = l / (μ*A)) is analogous to electrical resistance.\n• Hysteresis Loss: Energy dissipated per cycle proportional to area of B-H loop (Steinmetz formula: Ph = kh * f * Bmax^1.6).\n• Eddy Current Loss: Circulating currents induced within conductive magnetic cores (Pe = ke * f^2 * Bmax^2 * t^2). Minimized by laminating electrical steel sheets insulated with thin varnish.'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Electrical Machines (Transformers, Induction & Synchronous)',
      badge: 'Electrical Machinery',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'eee-transformers',
          name: 'Power Transformers (Equivalent Circuit, Regulation & Efficiency)',
          content: 'Electromagnetic static energy conversion:\n• Operating Principle: Faraday\'s Law of induction and Lenz\'s Law. Turns ratio N1/N2 = V1/V2 = I2/I1.\n• Exact Equivalent Circuit: Primary/secondary winding resistances (R1, R2), leakage reactances (X1, X2), magnetizing branch (core loss resistance Rc, magnetizing reactance Xm).\n• Testing: Open-Circuit (OC) test at rated voltage measures core losses (Rc, Xm); Short-Circuit (SC) test at rated current measures winding copper losses (Req, Xeq).\n• Voltage Regulation: VR = (V2_no_load - V2_full_load) / V2_full_load * 100%.'
        },
        {
          id: 'eee-induction-motors',
          name: '3-Phase Induction Motors (Rotor Dynamics & Torque-Slip Curve)',
          content: 'The workhorse of global industrial drive systems:\n• Rotating Magnetic Field (RMF): Three balanced 120° spatial windings excited by 3-phase currents create a constant magnitude magnetic field (1.5 * Bmax) rotating at synchronous speed Ns = 120 * f / P.\n• Slip (s): Difference between synchronous speed and actual rotor mechanical speed (s = (Ns - Nr) / Ns).\n• Torque Equation: T = (3 / ωs) * (V^2 * (R2\' / s)) / [ (R1 + R2\'/s)^2 + (X1 + X2\')^2 ]. Peak breakdown torque occurs when s = R2\' / √(R1^2 + (X1+X2\')^2).'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Power Electronics, Inverters & Motor Drives',
      badge: 'Power Electronics',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'eee-power-semiconductors',
          name: 'Power Semiconductor Switches (MOSFETs, IGBTs & Wide-Bandgap SiC/GaN)',
          content: 'Solid-state electrical power switching devices:\n• Silicon Power MOSFET: Majority carrier unipolar device with fast nanosecond switching, low switching losses, but high conduction on-state resistance (Rds_on) at high breakdown voltages (>600V).\n• IGBT (Insulated Gate Bipolar Transistor): Hybrid device combining voltage-controlled MOS gate with bipolar conductivity modulation. Standard choice for electric vehicles, industrial VFDs, and train traction (up to 6.5 kV, thousands of Amperes).\n• Wide-Bandgap (SiC & GaN): Silicon Carbide and Gallium Nitride offer 10x higher breakdown electric fields, lower on-resistance, and enable 100+ kHz switching frequencies at 200°C temperatures, revolutionizing EV inverter compactness.'
        },
        {
          id: 'eee-inverters-vfd',
          name: 'DC-AC Inverters, SPWM & Variable Frequency Drives (VFD)',
          content: 'Precision motor speed and power conversion control:\n• 3-Phase Voltage Source Inverter (VSI): 6-switch bridge topology converting high-voltage DC battery/link voltage into variable-frequency, variable-voltage 3-phase AC.\n• Sinusoidal Pulse Width Modulation (SPWM): Carrier triangular wave compared with sinusoidal reference modulating switch duty cycles.\n• V/f Control: Maintaining constant ratio of voltage to frequency (V/f = constant) below rated speed prevents magnetic core saturation and delivers constant maximum torque across varying RPM.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Power Systems Analysis, Smart Grid & Protection',
      badge: 'Power Systems',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'eee-transmission-lines',
          name: 'Transmission Lines, Load Flow & Power Grid Stability',
          content: 'Bulk energy transmission and stability analysis:\n• Line Parameters: Distributed series resistance, series inductance, shunt capacitance, and conductance modeled via ABCD parameters.\n• Load Flow Analysis: Newton-Raphson and Gauss-Seidel iterative methods solving non-linear power balance equations for bus voltages, phase angles, and line losses.\n• Grid Stability: Rotor angle stability, transient stability during short-circuit faults governed by the Swing Equation (M * d^2δ/dt^2 = Pm - Pe), and equal-area criterion.'
        },
        {
          id: 'eee-switchgear-protection',
          name: 'Switchgear, Protective Relays & Substation Automation',
          content: 'Power grid protection and automated clearing:\n• Circuit Breakers: Vacuum, SF6 (sulfur hexafluoride), and air blast breakers capable of safely interrupting 50 kA fault currents in under 3 cycles (60 ms).\n• Numerical Relays: Microprocessor-based relays executing overcurrent (ANSI 50/51), distance impedance protection (ANSI 21), and differential protection (ANSI 87).\n• IEC 61850 Substation Automation: GOOSE (Generic Object Oriented Substation Events) messaging over fiber-optic Ethernet for sub-millisecond inter-relay interlocking.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'eee-career-roles',
          name: 'Electrical Engineering Career Pathways',
          content: 'High-growth careers for EEE engineers:\n• Power Systems & Grid Planning Engineer: Designs high-voltage substations, load flow models, and renewable transmission interconnects.\n• EV Powertrain & Traction Inverter Engineer: Develops motor control firmware (FOC / vector control) and SiC inverters for automotive OEMs.\n• Renewable Energy & BESS Architect: Designs utility-scale solar PV plants, wind farm grid interfaces, and battery energy storage systems (BESS).\n• Substation Protection & Testing Engineer: Commissions numerical relays, CT/PT instrument transformers, and automated switchgear.'
        },
        {
          id: 'eee-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Simulation Tools: MATLAB / Simulink / Simscape Electrical, ETAP (load flow, short-circuit, arc flash), PSCAD, PSS/E.\n• Hardware Lab Skills: 3-Phase power analyzers, high-voltage insulation testers (Megger), oscilloscopes with differential high-voltage probes.\n• Control & Firmware: Field Oriented Control (FOC), Space Vector PWM (SVPWM), TI C2000 DSP microcontrollers, C/C++.\n• Codes & Standards: IEEE 1547 (Grid Interconnection), NEC / NFPA 70, IEC 60076 (Power Transformers), IEC 61850.'
        },
        {
          id: 'eee-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Mathematics (Linear Algebra, Calculus), Electromagnetic Field Theory, Basic Electrical Engineering, Engineering Graphics.\n• Year 2 (Semesters 3-4): Network Analysis, Electrical Machines I (DC & Transformers), Analog & Digital Electronics, Electrical Machines II (Induction & Synchronous).\n• Year 3 (Semesters 5-6): Power Systems I & II, Power Electronics, Control Systems, Microcontrollers & Embedded Systems, Renewable Energy Engineering.\n• Year 4 (Semesters 7-8): Power System Protection & Switchgear, Electric Drives & Traction, High Voltage Engineering, Smart Grid Technologies, Capstone Power Project.'
        },
        {
          id: 'eee-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Field-Oriented Control (FOC) Inverter for PMSM Motor: Designed a 48V SiC inverter using STM32/TI C2000 microcontrollers with Clark/Park coordinate transformations and space-vector PWM.\n2. Grid-Tied Solar Inverter with Maximum Power Point Tracking (MPPT): Simulated and built an H-bridge inverter using Perturb & Observe MPPT, LCL harmonic filter, and phase-locked loop (PLL) grid synchronization.\n3. Microgrid Load Flow & Fault Analysis in ETAP: Modeled an industrial manufacturing facility with solar PV, backup diesel generators, and battery storage under 3-phase symmetrical and unsymmetrical line-to-ground faults.\n4. Smart Energy Monitoring Node with IoT Cloud Telemetry: Built an active/reactive power metering circuit using ADE7758 IC, CT current clamps, and MQTT telemetry to AWS IoT Core.'
        },
        {
          id: 'eee-interview-questions',
          name: 'Top Electrical Engineering Technical Interview Questions',
          content: 'Q1: What happens if DC voltage is applied to the primary winding of a transformer?\nA: It will destroy the transformer! In steady-state DC, frequency f = 0, so the primary winding inductive reactance is zero (XL = 2πfL = 0). The only impedance opposing current flow is the tiny DC copper resistance of the primary winding (typically fractions of an ohm). Consequently, an enormous catastrophic current will flow according to Ohm\'s law (I = V/R), rapidly saturating the magnetic core, generating immense I^2*R heat, and vaporizing or burning out the winding insulation in seconds.\n\nQ2: What is the significance of the Power Factor, and why do utilities penalize low power factors?\nA: Power factor is the ratio of real power (kW) to apparent power (kVA): PF = cos(θ). A low lagging power factor (caused by inductive loads like induction motors and transformers) means the system draws excessive reactive current (kVAR) that does no mechanical work but circulates through cables and transformers. This causes higher I^2*R transmission losses, severe line voltage drops, and demands oversized generators, transformers, and switchgear. Utilities penalize industrial customers with PF < 0.9 to compel them to install power factor correction shunt capacitor banks.\n\nQ3: What is the difference between Symmetrical and Unsymmetrical Faults in power systems?\nA: Symmetrical faults (such as 3-phase short circuit L-L-L or L-L-L-G) affect all three phases equally; currents remain balanced with 120° phase displacements, and analysis can be conducted on a simple per-phase basis. Unsymmetrical faults (Single Line-to-Ground L-G, Line-to-Line L-L, Double Line-to-Ground L-L-G) create severe phase unbalance, requiring Symmetrical Component Analysis (Fortescue Theorem: resolving unbalanced 3-phase phasors into positive, negative, and zero sequence symmetrical components).'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 3. IT: INFORMATION TECHNOLOGY
// -----------------------------------------------------------------------------
catalog['IT'] = {
  branchCode: 'IT',
  branchName: 'Information Technology',
  slug: 'it',
  specializationTitle: 'Enterprise Cloud Architecture, Databases & Distributed Systems',
  specializationTagline: 'Full-stack engineering, microservices, cloud infrastructure, container orchestration, and network security',
  badge: 'ENTERPRISE SYSTEMS & CLOUD ARCHITECTURE',
  icon: 'lan',
  accentColor: '#3b82f6',
  topicsCount: 25,
  overview: 'Information Technology (IT) powers global enterprise digital infrastructures, distributed platforms, cloud-native deployments, and robust network systems. This specialization covers web application architecture, relational and NoSQL databases, scalable microservices, containerization with Docker and Kubernetes, CI/CD automation, and cloud cybersecurity.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Web Architecture, Protocols & Core Programming',
      badge: 'Web & Systems Foundations',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'it-web-protocols',
          name: 'HTTP/HTTPS, WebSockets & OSI Network Layering',
          content: 'Core networking and web communication protocols:\n• TCP/IP and OSI 7-Layer Model: Application, Presentation, Session, Transport, Network, Data Link, Physical.\n• HTTP/1.1 vs HTTP/2 vs HTTP/3: Multiplexing, binary framing, header compression (HPACK), and UDP-based QUIC protocol reducing head-of-line blocking.\n• Transport Layer Security (TLS 1.3): Asymmetric key exchange (ECDHE) followed by symmetric AES-GCM data encryption with zero-RTT handshakes.\n• WebSockets: Full-duplex persistent bidirectional communication protocol established via an HTTP Upgrade handshake for real-time collaborative applications.'
        },
        {
          id: 'it-data-structures',
          name: 'Core Data Structures for Enterprise Computing',
          content: 'High-performance in-memory representations:\n• Hash Tables: Hash functions, collision resolution via chaining and open addressing (linear probing), load factors, dynamic rehashing (O(1) average lookup).\n• Balanced Binary Search Trees (AVL & Red-Black Trees): Guaranteed O(log n) search, insertion, and deletion operations.\n• B-Trees & B+ Trees: High-fanout self-balancing search trees specifically optimized for disk page storage engines in relational database systems.'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Databases & Distributed Data Systems',
      badge: 'Database Engineering',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'it-relational-databases',
          name: 'Relational Database Engineering (ACID, Indexing & Normalization)',
          content: 'Robust transactional data storage:\n• ACID Guarantees: Atomicity (all-or-nothing), Consistency (integrity constraints), Isolation (read uncommitted, read committed, repeatable read, serializable), and Durability (write-ahead logging WAL).\n• Database Normalization: 1NF, 2NF, 3NF, and BCNF eliminating update, insertion, and deletion anomalies through foreign key relationships.\n• Storage Indexing: B+ Tree clustered and secondary indexes, composite indexes, query execution plans (EXPLAIN ANALYZE), index selectivity, and avoidance of full table scans.'
        },
        {
          id: 'it-nosql-distributed',
          name: 'NoSQL Databases & CAP Theorem',
          content: 'Modern non-relational and distributed data storage:\n• NoSQL Data Models: Document stores (MongoDB), Key-Value caches (Redis), Wide-column stores (Cassandra), and Graph databases (Neo4j).\n• CAP Theorem: A distributed data store can simultaneously provide at most two out of three guarantees: Consistency (every read receives most recent write), Availability (every request receives non-error response), and Partition Tolerance (system operates despite network dropped packets).\n• BASE Philosophy: Basically Available, Soft state, Eventual consistency.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Cloud Infrastructure, DevOps & Containerization',
      badge: 'Cloud & DevOps',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'it-docker-containers',
          name: 'Docker Containerization & Linux Namespaces',
          content: 'Process isolation and immutable artifact packaging:\n• Container Architecture vs Virtual Machines: Containers share the host OS kernel and use Linux cgroups (resource limits for CPU/memory) and namespaces (PID, NET, MNT, IPC isolation), eliminating heavy hypervisor overhead.\n• Dockerfile Engineering: Multi-stage builds, minimal base images (Alpine / Distroless), layer caching optimization, and non-root security principles.'
        },
        {
          id: 'it-kubernetes-orchestration',
          name: 'Kubernetes Cluster Architecture & Orchestration',
          content: 'Automated container scaling and resilient lifecycle management:\n• Control Plane Components: kube-apiserver, etcd (distributed consensus store), kube-scheduler, and kube-controller-manager.\n• Worker Node Architecture: kubelet, kube-proxy, container runtime (containerd).\n• Workload Primitives: Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets, Services (ClusterIP, NodePort, LoadBalancer), and Ingress Controllers.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Enterprise System Design & Information Security',
      badge: 'System Design & Security',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'it-microservices-arch',
          name: 'Microservices, API Gateways & Event-Driven Architecture',
          content: 'Decoupled scalable enterprise systems:\n• Monolith to Microservices: Domain-Driven Design (DDD) bounded contexts, service discovery, distributed tracing (OpenTelemetry), circuit breaker pattern (Resilience4j).\n• Asynchronous Event Streaming: Message brokers (RabbitMQ) and distributed commit logs (Apache Kafka) enabling decoupled pub/sub event-driven processing with at-least-once delivery semantics.'
        },
        {
          id: 'it-cybersecurity-identity',
          name: 'Identity & Access Management (OAuth 2.0, JWT & Zero Trust)',
          content: 'Enterprise security, authentication, and authorization:\n• OAuth 2.0 & OpenID Connect: Authorization code grant with PKCE (Proof Key for Code Exchange), scopes, claims, and access/refresh token rotation.\n• JSON Web Tokens (JWT): Cryptographically signed tamper-proof stateless identity tokens (HMAC SHA-256 or RSA-256 asymmetric signatures).\n• Zero Trust Architecture: \'Never trust, always verify\' security posture with mutual TLS (mTLS) service-to-service communication.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'it-career-roles',
          name: 'Information Technology Career Pathways',
          content: 'Leading career trajectories for IT professionals:\n• Cloud & DevOps Architect: Automates cloud infrastructure (AWS/GCP/Azure) with Terraform, CI/CD pipelines, and Kubernetes clusters.\n• Full-Stack Enterprise Engineer: Builds high-throughput web applications, REST/GraphQL APIs, and resilient database architectures.\n• Site Reliability Engineer (SRE): Defines SLI/SLO/SLA metrics, implements automated incident mitigation, and ensures 99.99% system availability.\n• Database Administrator & Data Architect: Optimizes relational databases, manages sharding, replication, backup disaster recovery, and data security.'
        },
        {
          id: 'it-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Programming: JavaScript/TypeScript, Python, Java, Go, Bash.\n• Cloud & Infra: AWS/Azure, Docker, Kubernetes, Terraform, Helm, GitHub Actions, Linux administration.\n• Databases: PostgreSQL, MySQL, Redis, MongoDB, Elasticsearch.\n• Networking: DNS, TCP/IP, Load balancing (NGINX, HAProxy), VPC, Subnets, Firewalls, SSL/TLS.'
        },
        {
          id: 'it-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Problem Solving & C Programming, Discrete Mathematics, Computer Organization, Web Foundations (HTML/CSS/JS).\n• Year 2 (Semesters 3-4): Data Structures & Algorithms, Object-Oriented Programming (Java/Python), Database Management Systems, Computer Networks.\n• Year 3 (Semesters 5-6): Operating Systems, Web Technologies & REST APIs, Cloud Computing, Software Engineering, Information Security.\n• Year 4 (Semesters 7-8): Distributed Systems, DevOps & Container Orchestration, Enterprise System Design, Major Capstone Industry Project.'
        },
        {
          id: 'it-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Multi-Region Resilient Kubernetes Microservices Cluster: Deployed using Terraform, Helm charts, Traefik ingress, Prometheus/Grafana monitoring, and automated canary deployments.\n2. Distributed Real-Time Financial Ledger with Event Sourcing: Built with Node.js/TypeScript, Apache Kafka event log, PostgreSQL read replicas, and Redis cache.\n3. Zero-Trust Cloud API Gateway: Implemented in Go with rate-limiting token bucket algorithm, JWT signature verification, and mTLS proxying.\n4. Automated CI/CD Deployment Pipeline with Security Scanning: Complete GitHub Actions workflow with unit testing, Docker container build, Trivy vulnerability scanning, and automated AWS ECS deployment.'
        },
        {
          id: 'it-interview-questions',
          name: 'Top Information Technology Technical Interview Questions',
          content: 'Q1: What happens under the hood when you type a URL into a browser and press Enter?\nA: 1. Browser checks local cache (browser, OS, router); 2. DNS Resolution: Queries local recursive resolver, root servers, TLD servers, and authoritative nameserver to resolve hostname to IP address; 3. TCP Handshake: 3-way handshake (SYN, SYN-ACK, ACK); 4. TLS Handshake: Certificate validation, asymmetric ECDHE key exchange, session key generation; 5. HTTP GET Request dispatched; 6. Server processes request through load balancer and web application, returning HTTP 200 response with HTML; 7. Browser parses DOM tree, CSSOM tree, executes JavaScript, and renders page through layout and painting.\n\nQ2: What is the difference between SQL and NoSQL databases, and how do you choose between them?\nA: SQL databases (e.g., PostgreSQL, MySQL) are relational, table-based, enforce strict schemas, and prioritize ACID transactions for mission-critical financial accuracy. They scale vertically well. NoSQL databases (e.g., MongoDB, DynamoDB, Cassandra) are non-relational, schema-flexible (documents, key-value, column families), and designed to scale horizontally across distributed clusters using eventual consistency. Choose SQL when data structure is uniform and transactional integrity is paramount; choose NoSQL for rapid unstructured data ingestion, massive horizontal scale, or real-time caching.\n\nQ3: What is the difference between a Process and a Thread, and how does OS scheduling handle them?\nA: A process is an independent executing program with its own dedicated virtual address space, memory segments (code, data, heap, stack), and file descriptors, isolated from other processes. A thread is a lightweight unit of execution within a process; all threads of a process share the same memory space, heap, and global variables, but possess their own private stack and program counter. Context switching between processes requires invalidating memory translation lookaside buffers (TLB) and swapping page tables, making it significantly more expensive than switching between threads within the same process.'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 4. AIML: ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
// -----------------------------------------------------------------------------
catalog['AIML'] = {
  branchCode: 'AIML',
  branchName: 'Artificial Intelligence & Machine Learning',
  slug: 'aiml',
  specializationTitle: 'Deep Learning, Neural Architectures & Foundation Models',
  specializationTagline: 'Mathematical foundations, transformer networks, computer vision, natural language processing, and MLOps',
  badge: 'ARTIFICIAL INTELLIGENCE & DEEP LEARNING',
  icon: 'psychology',
  accentColor: '#8b5cf6',
  topicsCount: 25,
  overview: 'Artificial Intelligence & Machine Learning (AI/ML) is the computational vanguard transforming science, automation, and software intelligence. This specialization guides students through vector calculus, probability, supervised and unsupervised learning algorithms, deep neural networks, CNNs, multi-head attention transformers, large language models (LLMs), and production MLOps deployment.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Mathematical Foundations & Classical Machine Learning',
      badge: 'Mathematics & ML Fundamentals',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'aiml-math-foundations',
          name: 'Linear Algebra, Calculus & Probability for AI',
          content: 'Mathematical prerequisites for machine learning:\n• Linear Algebra: Vectors, matrices, tensors, dot products, eigenvalues, eigenvectors, and Singular Value Decomposition (SVD).\n• Multivariate Calculus: Gradients, partial derivatives, Jacobian matrices, Hessian matrices, and the Chain Rule for backpropagation.\n• Probability & Statistics: Bayes\' Theorem (P(A|B) = P(B|A)*P(A)/P(B)), probability density functions, maximum likelihood estimation (MLE), expectation, variance, and covariance matrices.'
        },
        {
          id: 'aiml-supervised-learning',
          name: 'Supervised Learning Algorithms (Regression, Trees & SVM)',
          content: 'Core predictive algorithms:\n• Linear & Logistic Regression: Cost function minimization via Gradient Descent (Batch, Stochastic SGD, Mini-batch) and Adam optimizer.\n• Decision Trees & Ensemble Methods: Information Gain (Entropy), Gini Impurity, Random Forests (bagging), and Gradient Boosted Decision Trees (XGBoost, LightGBM).\n• Support Vector Machines (SVM): Hyperplane margin maximization, soft margins, and kernel trick (RBF, polynomial) mapping non-linear data into higher dimensional space.'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Deep Learning & Neural Network Architectures',
      badge: 'Neural Networks',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'aiml-neural-networks',
          name: 'Multi-Layer Perceptrons & Backpropagation',
          content: 'Deep learning core mechanics:\n• Perceptron Architecture: Weighted sum of inputs plus bias passed through non-linear activation functions (ReLU, Leaky ReLU, GELU, Sigmoid, Softmax).\n• Backpropagation: Error derivative propagation through computational graphs using reverse-mode automatic differentiation.\n• Regularization Techniques: Dropout, L1/L2 weight decay, Batch Normalization, and Layer Normalization preventing catastrophic overfitting.'
        },
        {
          id: 'aiml-cnn-architectures',
          name: 'Convolutional Neural Networks (CNN) for Computer Vision',
          content: 'Spatial pattern recognition in 2D/3D images:\n• Convolution Operation: Kernel filters sliding across input channels computing feature activation maps with padding and stride.\n• Landmark Architectures: ResNet (residual skip connections solving vanishing gradient problem), EfficientNet, and Vision Transformers (ViT).\n• Computer Vision Tasks: Object Detection (YOLO, Faster R-CNN), semantic segmentation (U-Net), and feature extraction.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Natural Language Processing & Transformers',
      badge: 'NLP & Transformers',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'aiml-attention-transformers',
          name: 'Self-Attention Mechanism & The Transformer Architecture',
          content: 'The architectural breakthrough powering modern generative AI:\n• Scaled Dot-Product Attention: Attention(Q, K, V) = softmax( (Q * K^T) / √dk ) * V.\n• Multi-Head Attention: Projects queries, keys, and values into multiple subspaces, allowing the model to jointly attend to information from different representation spaces.\n• Positional Encoding: Sinusoidal and Rotary Position Embeddings (RoPE) injecting sequence order awareness into permutation-invariant attention layers.\n• Encoder-Decoder vs Decoder-Only: BERT (bidirectional masked language modeling) vs GPT (autoregressive causal decoder).'
        },
        {
          id: 'aiml-llm-fine-tuning',
          name: 'Large Language Models (LLM), Fine-Tuning & Prompt Engineering',
          content: 'Training and adapting foundation models:\n• Pre-training: Self-supervised next-token prediction on internet-scale corpora.\n• Parameter-Efficient Fine-Tuning (PEFT): Low-Rank Adaptation (LoRA: freezing base weights and training low-rank decomposition matrices W = W0 + B*A) and QLoRA (4-bit quantization).\n• Alignment: Reinforcement Learning from Human Feedback (RLHF) and Direct Preference Optimization (DPO).\n• Retrieval-Augmented Generation (RAG): Vector databases (Chroma, Pinecone), cosine similarity semantic search, and prompt contextualization.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: MLOps, Model Deployment & AI Ethics',
      badge: 'Production MLOps',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'aiml-mlops-pipeline',
          name: 'MLOps: Model Serving, Quantization & Monitoring',
          content: 'Engineering operational production AI pipelines:\n• Model Serving: High-throughput low-latency inference engines (vLLM, TensorRT, Triton Inference Server, ONNX Runtime).\n• Model Compression: Post-training quantization (INT8, INT4, AWQ, GPTQ) and knowledge distillation.\n• Monitoring & Drift: Data drift, concept drift detection, and automated model retraining triggers in CI/CD pipelines.'
        },
        {
          id: 'aiml-responsible-ai',
          name: 'Responsible AI, Bias Mitigation & Interpretability',
          content: 'Ethics, safety, and model interpretability:\n• Model Explainability: SHAP (Shapley Additive exPlanations) and LIME attributing feature importance.\n• Bias Mitigation: Algorithmic fairness metrics across protected demographics.\n• Safety & Guardrails: Prompt injection defenses, output sanitization, and compliance with emerging AI regulations.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'aiml-career-roles',
          name: 'AI & Machine Learning Career Pathways',
          content: 'Leading career avenues for AI/ML graduates:\n• Machine Learning Engineer: Develops and productionizes predictive models and deep learning pipelines.\n• AI Research Scientist: Researches novel mathematical algorithms, architectures, and multimodal intelligence.\n• Computer Vision / NLP Engineer: Specializes in real-time visual recognition or natural language understanding.\n• MLOps Engineer: Builds model deployment platforms, feature stores, and automated training pipelines.'
        },
        {
          id: 'aiml-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Frameworks: PyTorch, TensorFlow, JAX, Hugging Face Transformers, LangChain, vLLM.\n• Data & Math: NumPy, Pandas, Scikit-learn, SciPy, Vector Math, PyTorch Lightning.\n• MLOps & Tools: Docker, Kubernetes, MLflow, Weights & Biases, DVC, Triton Inference Server.\n• Hardware: CUDA programming, GPU acceleration profiling (NVIDIA Nsight).'
        },
        {
          id: 'aiml-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Python Programming, Linear Algebra, Multivariable Calculus, Discrete Mathematics, Probability & Statistics.\n• Year 2 (Semesters 3-4): Data Structures & Algorithms, Database Systems, Classical Machine Learning, Deep Learning Foundations (MLP, Backprop).\n• Year 3 (Semesters 5-6): Computer Vision (CNNs), Natural Language Processing, Transformer Networks, Reinforcement Learning.\n• Year 4 (Semesters 7-8): Large Language Models & Generative AI, MLOps & Distributed Training, AI Ethics, Major Capstone AI Project.'
        },
        {
          id: 'aiml-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Multi-Document Enterprise RAG Assistant with Hybrid Search: Built using LangChain, ChromaDB, FastAPI, and quantized Llama 3 8B with reciprocal rank fusion.\n2. Real-Time Autonomous Object Tracking & Segmentation: Implemented on edge hardware using PyTorch, YOLOv9, DeepSORT, and TensorRT acceleration.\n3. Fine-Tuned Domain LLM with LoRA & DPO: Fine-tuned open-source 7B foundation model on medical/legal datasets using PyTorch, Hugging Face TRL, and PEFT.\n4. Distributed MLOps Automated Training & Serving Pipeline: End-to-end MLflow pipeline with automated drift detection, model validation, and Dockerized deployment to Kubernetes.'
        },
        {
          id: 'aiml-interview-questions',
          name: 'Top AI & Machine Learning Technical Interview Questions',
          content: 'Q1: What is the Vanishing and Exploding Gradient Problem, and how do modern architectures solve it?\nA: During backpropagation, gradients are computed via the chain rule by multiplying derivatives through each layer. If activation function derivatives are small (e.g., Sigmoid max derivative is 0.25), multiplying them through dozens of deep layers causes gradients to decay exponentially toward zero (vanishing gradient), preventing early layers from learning. Conversely, if weights are large, gradients grow exponentially (exploding gradient), causing numerical overflow. Solutions: 1. ReLU/GELU activations (constant derivative of 1 for positive values); 2. Residual skip connections (ResNet) allowing gradients to flow uninterrupted directly to earlier layers (d(x + F(x))/dx = 1 + F\'(x)); 3. Normalization layers (Batch Normalization, Layer Normalization); 4. Gradient clipping.\n\nQ2: Explain the difference between LoRA (Low-Rank Adaptation) and full fine-tuning.\nA: Full fine-tuning updates all billions of parameters in a pre-trained neural network, requiring massive GPU memory to store optimizer states (e.g., Adam stores 8 bytes per parameter) and risking catastrophic forgetting. LoRA freezes the original pre-trained weight matrix W0 (d × k) and decomposes the weight update into two low-rank matrices: ΔW = B × A, where B is d × r and A is r × k, with rank r << min(d, k) (e.g., r = 8 or 16). This slashes trainable parameters by over 99%, reduces GPU VRAM consumption by 70%, and produces lightweight adapter files that can be swapped dynamically at runtime without altering the base model weights.\n\nQ3: What is the Bias-Variance Tradeoff, and how do you diagnose underfitting vs. overfitting?\nA: Bias is error stemming from erroneous, overly simplistic model assumptions (underfitting; model fails to capture underlying patterns, showing high training error and high test error). Variance is error stemming from excessive sensitivity to small fluctuations/noise in training data (overfitting; model memorizes training samples, showing near-zero training error but high validation/test error). Diagnosis: Plot learning curves of training loss vs validation loss. If both losses remain high, the model underfits (remedy: increase model complexity, add features). If training loss is low but validation loss diverges upward, the model overfits (remedy: add regularization, dropout, data augmentation, or gather more training data).'
        }
      ]
    }
  ]
};

// Also copy to 'AI' key for universal alias support
catalog['AI'] = JSON.parse(JSON.stringify(catalog['AIML']));
catalog['AI'].branchCode = 'AI';
catalog['AI'].branchName = 'Artificial Intelligence';

// -----------------------------------------------------------------------------
// 5. CHEM: CHEMICAL ENGINEERING
// -----------------------------------------------------------------------------
catalog['CHEM'] = {
  branchCode: 'CHEM',
  branchName: 'Chemical Engineering',
  slug: 'chemical-engineering',
  specializationTitle: 'Chemical Process Engineering, Thermodynamics & Reaction Kinetics',
  specializationTagline: 'Mass transfer, continuous distillation, catalytic reactors, heat exchanger networks, and process safety',
  badge: 'CHEMICAL PROCESS ENGINEERING',
  icon: 'science',
  accentColor: '#10b981',
  topicsCount: 25,
  overview: 'Chemical Engineering translates molecular transformations into large-scale commercial manufacturing across petrochemicals, pharmaceuticals, energy, and advanced polymers. This specialization delivers foundational mastery of fluid mechanics, phase equilibria thermodynamics, heat and mass transfer, continuous reactor design, and industrial plant process dynamics.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Chemical Engineering Thermodynamics & Fluid Mechanics',
      badge: 'Thermodynamics & Transport',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'chem-phase-equilibria',
          name: 'Phase Equilibria & Equations of State (VLE, Raoult & Peng-Robinson)',
          content: 'Thermodynamic equilibrium in multi-component systems:\n• Vapor-Liquid Equilibrium (VLE): Raoult’s Law (Pi = xi * Pi_sat) for ideal mixtures. Non-ideal behavior modeled via activity coefficients (γi) and fugacity coefficients (φi).\n• Equations of State: Van der Waals, Redlich-Kwong-Soave (RKS), and Peng-Robinson (PR) cubic equations modeling non-ideal gases and high-pressure supercritical fluids.\n• Gibbs Phase Rule: Degrees of freedom F = C - P + 2 for multi-component (C) multi-phase (P) systems.'
        },
        {
          id: 'chem-fluid-flow',
          name: 'Fluid Flow in Chemical Plants (Navier-Stokes & Pumps)',
          content: 'Hydrodynamics of Newtonian and non-Newtonian process fluids:\n• Incompressible Flow: Continuity equation, Navier-Stokes momentum equations, and Bernoulli mechanical energy balance with frictional head losses (Darcy-Weisbach equation).\n• Flow Regimes: Reynolds number (Re = ρvd/μ) classifying laminar, transitional, and turbulent pipe flow.\n• Pumps & Cavitation: Centrifugal pump performance curves, system head curves, and Net Positive Suction Head (NPSH_available > NPSH_required to avoid impellor erosion).'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Heat & Mass Transfer Operations',
      badge: 'Unit Operations',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'chem-heat-transfer',
          name: 'Industrial Heat Transfer & Heat Exchanger Design (LMTD & NTU)',
          content: 'Thermal energy transport mechanisms:\n• Conduction, Convection & Radiation: Fourier’s law, Newton’s law of cooling, Stefan-Boltzmann law.\n• Shell-and-Tube Heat Exchangers: Overall heat transfer coefficient U (1/U = 1/hi + R_foul,i + t/k + R_foul,o + 1/ho).\n• Thermal Rating Methods: Log Mean Temperature Difference (LMTD) with F-factor correction and Effectiveness-NTU (Number of Transfer Units) method.'
        },
        {
          id: 'chem-mass-transfer',
          name: 'Mass Transfer & Continuous Distillation Column Design',
          content: 'Separation of chemical mixtures:\n• Fick’s Laws of Diffusion: Molecular and eddy diffusion in stagnant and equimolar counter-diffusion systems.\n• Fractional Distillation: McCabe-Thiele graphical method determining theoretical trays, minimum reflux ratio (Rmin), total reflux (Fenske equation), and feed stage location.\n• Absorption & Stripping: Two-film theory, Henry\'s Law, and packed tower height calculation (HTU and NTU).'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Chemical Reaction Engineering & Reactor Design',
      badge: 'Reaction Engineering',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'chem-reactor-design',
          name: 'Ideal Reactors (Batch, CSTR & PFR) & Kinetics',
          content: 'Reaction kinetics and industrial reactor design:\n• Reaction Rate Laws: Power-law kinetics, Arrhenius temperature dependence (k = A * e^(-Ea / RT)).\n• Ideal Reactor Mole Balances:\n  - Batch Reactor: t = N_A0 * ∫ (dX / (-rA * V)).\n  - Continuous Stirred-Tank Reactor (CSTR): V = F_A0 * X / (-rA_exit). Perfectly mixed, operates at lowest reactant concentration.\n  - Plug Flow Reactor (PFR): V = F_A0 * ∫ (dX / -rA). Highest conversion per unit volume for positive-order kinetics.\n• Reactors in Series and Parallel: Minimizing total reactor volume for complex series-parallel reaction pathways.'
        },
        {
          id: 'chem-heterogeneous-catalysis',
          name: 'Heterogeneous Catalysis & Transport Limitations',
          content: 'Catalytic gas-solid and liquid-solid reactors:\n• Adsorption Isotherms: Langmuir-Hinshelwood and Eley-Rideal catalytic mechanisms.\n• Internal & External Mass Transfer: Thiele Modulus (Φ) and internal effectiveness factor (η) determining whether reaction rate is limited by pore diffusion or intrinsic chemical kinetics.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Process Dynamics, Plant Safety & Simulation',
      badge: 'Process Control & Safety',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'chem-process-simulation',
          name: 'Process Flowsheeting & Simulation (Aspen Plus & HYSYS)',
          content: 'Computer-aided chemical plant design:\n• Flowsheet Synthesis: Mass and energy balance convergence over recycle loops using sequential modular and equation-oriented solvers.\n• Thermodynamic Model Selection: Choosing property methods (NRTL, UNIQUAC, Peng-Robinson) based on polarity, pressure, and electrolyte presence.'
        },
        {
          id: 'chem-process-safety',
          name: 'Process Safety, HAZOP Studies & Environmental Engineering',
          content: 'Inherently safer chemical manufacturing:\n• HAZOP (Hazard and Operability): Systematic guide-word analysis (More, Less, None, Reverse) identifying deviations in pressure, flow, and temperature.\n• Pressure Relief Systems: Rupture disks, pressure safety valves (PSVs), and flare system header sizing according to API 520/521 standards.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'chem-career-roles',
          name: 'Chemical Engineering Career Pathways',
          content: 'High-impact careers for chemical engineers:\n• Process Design Engineer: Develops PFDs, P&IDs, heat and material balances for EPC design consultancies.\n• Refinery / Plant Operations Engineer: Optimizes yield, throughput, and energy efficiency on operating chemical units.\n• Process Safety Specialist: Directs PHA/HAZOP evaluations, relief valve sizing, and environmental emissions compliance.\n• Scale-Up & Pilot Plant Lead: Bridges bench chemistry to multi-ton commercial production in pharmaceuticals and specialty polymers.'
        },
        {
          id: 'chem-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Simulation Software: Aspen Plus, Aspen HYSYS, PRO/II, COMSOL Multiphysics, DWSIM.\n• Core Competencies: Heat and material balances, P&ID drafting, distillation sizing, hydraulic calculation, pump sizing.\n• Standards: ASME Section VIII (Pressure Vessels), API standards, OSHA Process Safety Management (PSM).'
        },
        {
          id: 'chem-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Mathematics, Material & Energy Balances, Organic & Physical Chemistry, Engineering Mechanics.\n• Year 2 (Semesters 3-4): Fluid Mechanics, Chemical Engineering Thermodynamics I & II, Heat Transfer Operations, Mechanical Operations.\n• Year 3 (Semesters 5-6): Mass Transfer Operations I & II, Chemical Reaction Engineering I & II, Instrumentation & Process Control.\n• Year 4 (Semesters 7-8): Chemical Process Technology, Plant Design & Economics, Process Modeling & Simulation (Aspen), Major Plant Capstone.'
        },
        {
          id: 'chem-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Complete Aspen Plus Simulation of 100,000 MTPA Methanol Synthesis Plant: Full flowsheet featuring syngas conversion, multi-stage compression, recycling, and two-column distillation purification.\n2. Thermal & Hydraulic Design of Shell-and-Tube Heat Exchanger (TEMA E-Type): Sized tube bundle, baffle cut, and pressure drop according to Kern’s and Bell-Delaware methods.\n3. Dynamic Simulation of CSTR with Runaway Exothermic Reaction: Modeled cooling jacket heat removal, thermal runaway triggers, and fail-safe automated emergency dump systems.\n4. Design of Continuous Bioethanol Distillation Tower: Calculated minimum reflux, number of theoretical trays, and tray hydraulics using McCabe-Thiele method and DWSIM.'
        },
        {
          id: 'chem-interview-questions',
          name: 'Top Chemical Engineering Technical Interview Questions',
          content: 'Q1: What is the significance of the Reflux Ratio in a distillation column, and what happens at Minimum vs. Total Reflux?\nA: The Reflux Ratio (R = L/D, liquid returned divided by distillate product removed) determines column separation efficiency and operating cost. At Minimum Reflux (Rmin), an infinite number of trays is required to achieve the desired separation (creating a pinch point where operating lines touch the equilibrium curve), resulting in infinite capital cost. At Total Reflux (R = ∞, all vapor condensed is returned and zero distillate is withdrawn), the number of theoretical stages is at its absolute minimum (Fenske equation), but zero product is harvested. Optimal economic design balances operating cost (steam and cooling water) against capital cost (column height and diameter), typically selecting R = 1.1 to 1.3 times Rmin.\n\nQ2: What is Cavitation in a centrifugal pump, and how do you prevent it?\nA: Cavitation occurs when the local liquid pressure inside the pump (typically at the eye of the impeller) drops below the liquid\'s vapor pressure at the operating temperature. The liquid boils, forming microscopic vapor bubbles. When these bubbles move into higher pressure regions further along the impeller blades, they collapse violently, generating localized shockwaves (up to thousands of atmospheres) that pit, erode, and destroy the impeller metal while causing severe vibration and acoustic noise. It is prevented by ensuring that Net Positive Suction Head Available (NPSHA) exceeds Net Positive Suction Head Required (NPSHR) by at least 0.5 to 1.0 meters, achieved by elevating suction tanks, lowering pump elevation, increasing suction pipe diameter, or lowering fluid temperature.\n\nQ3: Why is a Plug Flow Reactor (PFR) generally smaller than a Continuous Stirred-Tank Reactor (CSTR) for the same conversion?\nA: For all positive-order reactions (where reaction rate increases with reactant concentration, -rA = k*CA^n with n > 0), the rate of reaction decreases as conversion proceeds. In a CSTR, the entire volume is perfectly mixed and operates continuously at the lowest exit concentration, meaning the reaction proceeds everywhere at the slowest possible rate. In a PFR, reactant concentration starts at its maximum at the inlet and decreases gradually along the tube length. Because the average reaction rate across a PFR is much higher than the exit rate in a CSTR, a significantly smaller volume is needed in a PFR to achieve the identical percentage conversion.'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 6. BIOTECH: BIOTECHNOLOGY
// -----------------------------------------------------------------------------
catalog['BIOTECH'] = {
  branchCode: 'BIOTECH',
  branchName: 'Biotechnology',
  slug: 'biotechnology',
  specializationTitle: 'Bioprocess Engineering, Recombinant DNA & Bioinformatics',
  specializationTagline: 'Fermentation, genetic engineering, molecular cloning, downstream bioseparations, and biopharmaceuticals',
  badge: 'BIOTECHNOLOGY & BIOPROCESS',
  icon: 'biotech',
  accentColor: '#14b8a6',
  topicsCount: 25,
  overview: 'Biotechnology harness living organisms and biological systems to manufacture pharmaceuticals, therapeutics, biofuels, and advanced biomaterials. This specialization covers recombinant DNA technology, microbial fermentation kinetics, bioreactor transport phenomena, downstream separation and purification, and genomic bioinformatics.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Molecular Biology & Genetic Engineering',
      badge: 'Molecular Genetics',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'biotech-recombinant-dna',
          name: 'Recombinant DNA Technology & Gene Cloning',
          content: 'Tools and methodologies of genetic engineering:\n• Restriction Enzymes: Type II restriction endonucleases recognizing palindromic DNA sequences, producing sticky or blunt ends.\n• Cloning Vectors: Plasmids (pBR322, pUC19), bacteriophages, and BACs containing multiple cloning sites (MCS), selectable markers (antibiotic resistance), and origin of replication (ori).\n• DNA Ligation & Transformation: T4 DNA ligase and bacterial transformation via heat shock or electroporation.'
        },
        {
          id: 'biotech-pcr-sequencing',
          name: 'PCR, Quantitative RT-PCR & Next-Generation Sequencing',
          content: 'DNA amplification and high-throughput sequencing:\n• Polymerase Chain Reaction (PCR): Thermal cycling (Denaturation at 95°C, Primer Annealing at 55-65°C, Extension at 72°C using thermostable Taq / Pfu DNA polymerase).\n• RT-qPCR: Real-time quantification using SYBR Green or TaqMan fluorogenic probes.\n• Next-Generation Sequencing (NGS): Illumina sequencing-by-synthesis, sequencing depth, and genomic variant detection.'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Bioprocess Engineering & Bioreactor Design',
      badge: 'Bioprocess Engineering',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'biotech-microbial-growth',
          name: 'Microbial Growth Kinetics & Monod Model',
          content: 'Mathematical modeling of cellular proliferation:\n• Microbial Growth Phases: Lag phase, exponential (log) growth phase, stationary phase, and death phase.\n• Monod Kinetic Equation: Specific growth rate μ = μmax * S / (Ks + S), where S is substrate concentration and Ks is affinity constant.\n• Continuous Culture (Chemostat): Dilution rate D = F/V. Under steady state, cell growth rate exactly balances dilution rate (μ = D).'
        },
        {
          id: 'biotech-bioreactor-design',
          name: 'Bioreactor Design, Aeration & Scale-Up Criteria',
          content: 'Industrial fermentation equipment and transport phenomena:\n• Bioreactor Architecture: Stirred-tank bioreactors (STR), airlift fermenters, bubble columns with spargers, baffles, and Rushton turbine impellers.\n• Oxygen Mass Transfer: Volumetric oxygen transfer coefficient (kL*a) and Oxygen Uptake Rate (OUR = OTR at steady state).\n• Bioreactor Scale-Up: Criteria based on constant volumetric power input (P/V), constant tip speed, or constant kL*a.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Downstream Processing & Bioseparations',
      badge: 'Bioseparations',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'biotech-cell-disruption',
          name: 'Cell Disruption & Primary Solid-Liquid Separation',
          content: 'Harvesting intra- and extracellular biological products:\n• Cell Lysis: High-pressure homogenization, bead milling, enzymatic lysis (lysozyme), and sonication.\n• Primary Clarification: Continuous disc-stack centrifuges, microfiltration membranes, and flocculation.'
        },
        {
          id: 'biotech-chromatography',
          name: 'Preparative Chromatography & Protein Purification',
          content: 'High-resolution therapeutic protein purification:\n• Chromatography Modalities: Affinity chromatography (Protein A for monoclonal antibodies), Ion Exchange (IEX: cationic/anionic), Hydrophobic Interaction (HIC), and Size Exclusion (SEC).\n• Final Formulation: Ultrafiltration/diafiltration (UF/DF) for buffer exchange, viral clearance filtration, and lyophilization (freeze-drying).'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Bioinformatics & Biopharmaceutical Analytics',
      badge: 'Bioinformatics',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'biotech-sequence-alignment',
          name: 'Sequence Alignment (BLAST) & Protein Structure Modeling',
          content: 'Computational biology and genomics algorithms:\n• Pairwise & Multiple Sequence Alignment: Needleman-Wunsch (global), Smith-Waterman (local), and BLAST heuristics.\n• Protein Structure Modeling: Homology modeling, molecular dynamics (GROMACS), and AlphaFold AI protein structure prediction.'
        },
        {
          id: 'biotech-regulatory-gmp',
          name: 'Biopharmaceutical Regulatory Standards (cGMP & FDA Compliance)',
          content: 'Quality and compliance in biomanufacturing:\n• Current Good Manufacturing Practice (cGMP): Cleanroom classifications (Grade A to D), sterilization validation (SIP/CIP), and FDA 21 CFR Part 11 electronic records.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'biotech-career-roles',
          name: 'Biotechnology Career Pathways',
          content: 'Exciting careers in biotech and life sciences:\n• Upstream Bioprocess Scientist: Optimizes cell culture media, fermenter operating parameters, and scale-up.\n• Downstream Purification Scientist: Develops chromatography methods and ultrafiltration processes for biologics.\n• Computational Biologist / Bioinformatician: Mines genomic datasets and designs in-silico therapeutic candidates.\n• Regulatory Affairs & QA Specialist: Ensures compliant filings (IND/BLA) for vaccines and biologics.'
        },
        {
          id: 'biotech-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Lab Techniques: Aseptic technique, bioreactor operation, SDS-PAGE, Western blot, ELISA, HPLC/FPLC, PCR.\n• Software & Tools: Python/Biopython, R for biostatistics, GROMACS, BLAST, PyMOL, Design of Experiments (DoE).'
        },
        {
          id: 'biotech-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Cell Biology, Biochemistry, Engineering Mathematics, Microbiology, Basic Chemistry.\n• Year 2 (Semesters 3-4): Molecular Biology, Genetics, Chemical Engineering Principles in Bio, Stoichiometry.\n• Year 3 (Semesters 5-6): Bioprocess Engineering, Recombinant DNA Technology, Immunology, Downstream Processing.\n• Year 4 (Semesters 7-8): Bioinformatics, Biopharmaceutical Technology, Stem Cell Engineering, Major Capstone Bio Project.'
        },
        {
          id: 'biotech-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Optimization of Recombinant Protein Production in E. coli: Managed fed-batch fermentation in a 5L stirred-tank bioreactor, optimizing IPTG induction timing and dissolved oxygen.\n2. Monoclonal Antibody Downstream Purification Workflow: Designed a 3-step purification train (Protein A affinity -> Anion exchange -> Ultrafiltration) achieving >98% purity.\n3. Genome-Wide Association Study (GWAS) & Variant Annotation Pipeline: Built in Python and R analyzing NGS sequence data for disease biomarker discovery.\n4. In-Silico Molecular Docking Study for Novel Enzyme Inhibitors: Utilized AutoDock Vina, PyMOL, and GROMACS molecular dynamics to evaluate ligand binding affinities.'
        },
        {
          id: 'biotech-interview-questions',
          name: 'Top Biotechnology Technical Interview Questions',
          content: 'Q1: What is the significance of the volumetric oxygen transfer coefficient (kL*a) in aerobic fermentation?\nA: Because oxygen has very low solubility in aqueous fermentation broths (~8 mg/L at 25°C), rapid microbial respiration can deplete dissolved oxygen in seconds, halting growth or shifting metabolism into undesirable anaerobic pathways. The parameter kL*a represents the rate at which oxygen transfers from gas bubbles to the liquid broth: OTR = kL*a * (C* - CL). Bioprocess engineers optimize kL*a by increasing agitation impeller speed (breaking bubbles into smaller diameters to increase interfacial area \'a\') and increasing aeration flow rate, using kL*a as a primary scale-up benchmark.\n\nQ2: What is the difference between Upstream and Downstream bioprocessing?\nA: Upstream processing covers everything involved in generating the biological product: host cell line development, genetic engineering, seed train expansion, inoculum preparation, and bioreactor fermentation. Downstream processing begins after the bioreactor broth is harvested and encompasses harvesting, cell disruption, solid-liquid separation, chromatography purification, viral inactivation, sterile filtration, and final pharmaceutical formulation.\n\nQ3: How does Protein A affinity chromatography achieve high selectivity for antibodies?\nA: Protein A is a surface protein originally derived from Staphylococcus aureus that binds with high affinity and exquisite specificity to the Fc (fragment crystallizable) region of IgG class antibodies at neutral physiological pH (pH 7.0-7.4). By packing Protein A immobilized on porous agarose beads into a column, antibodies bind tightly while hundreds of host cell proteins (HCP) and DNA impurities wash straight through. Lowering the buffer pH to acidic conditions (pH 3.0-3.5) alters ionic charges and dissociates the antibody from Protein A, eluting pure monoclonal antibody in a single operation.'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 7. BIOMED: BIOMEDICAL ENGINEERING
// -----------------------------------------------------------------------------
catalog['BIOMED'] = {
  branchCode: 'BIOMED',
  branchName: 'Biomedical Engineering',
  slug: 'biomedical-engineering',
  specializationTitle: 'Biomedical Instrumentation, Medical Imaging & Biosensors',
  specializationTagline: 'Bio-potential amplifiers (ECG/EEG), physiological sensors, MRI/CT imaging, medical device safety, and prosthetics',
  badge: 'BIOMEDICAL DEVICES & HEALTHCARE TECH',
  icon: 'monitor_heart',
  accentColor: '#f43f5e',
  topicsCount: 25,
  overview: 'Biomedical Engineering (BME) merges precision electronics, signal processing, and materials science with human anatomy and physiological systems. This specialization explores bio-potential electrode physics, ultra-low noise biomedical amplifiers, physiological monitoring (ECG, EEG, EMG, SpO2), diagnostic medical imaging (X-ray, CT, MRI, Ultrasound), and ISO 13485 / IEC 60601 medical device safety.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Bio-potentials, Electrodes & Bio-signal Amplification',
      badge: 'Bio-potentials & Circuits',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'biomed-electrodes-physics',
          name: 'Electrode-Electrolyte Interface & Bio-potentials',
          content: 'Generation of biological electrical potentials:\n• Cellular Membrane Potentials: Nernst equation and Goldman-Hodgkin-Katz (GHK) equation modeling resting potential (-70 mV) and action potentials driven by Na+/K+ ion channels.\n• Electrode-Skin Interface: Half-cell potential, polarization (polarizable vs. non-polarizable Ag/AgCl electrodes), and contact impedance.\n• Physiological Signals: Electrocardiogram (ECG: 1 mV, 0.05-150 Hz), Electroencephalogram (EEG: 10-100 μV, 0.5-50 Hz), and Electromyogram (EMG: 0.1-10 mV, 20-500 Hz).'
        },
        {
          id: 'biomed-analog-front-end',
          name: 'Medical Bio-potential Amplifiers & Right-Leg Drive (RLD)',
          content: 'Low-noise physiological instrumentation front-ends:\n• Common-Mode Interference: 50/60 Hz powerline capacitive coupling into the patient body.\n• Driven-Right-Leg (RLD) Circuit: Inverts and amplifies common-mode patient voltage, driving it back to the body to actively cancel powerline hum.\n• Isolation Amplifiers: Optical or transformer isolation guaranteeing patient isolation currents <10 μA under single fault conditions (IEC 60601-1).'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Physiological Monitoring & Diagnostic Sensors',
      badge: 'Physiological Sensors',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'biomed-pulse-oximetry',
          name: 'Pulse Oximetry (SpO2) & Photoplethysmography (PPG)',
          content: 'Non-invasive optical physiological telemetry:\n• Beer-Lambert Law: Light absorption through oxygenated vs. deoxygenated hemoglobin.\n• Dual-Wavelength PPG: Red (660 nm) and Infrared (940 nm) LEDs pulsed alternately. Oxygen saturation computed from the ratio of AC/DC pulsatile signals: R = (AC_red/DC_red) / (AC_ir/DC_ir).'
        },
        {
          id: 'biomed-bp-cardiac-output',
          name: 'Blood Pressure & Hemodynamic Monitoring',
          content: 'Invasive and non-invasive hemodynamic metrics:\n• Non-Invasive BP (NIBP): Oscillometric cuff method tracking amplitude envelope of arterial pressure oscillations.\n• Invasive Arterial Line: Fluid-filled catheter connected to disposable piezoresistive pressure strain gauge transducers for beat-to-beat pressure waveforms.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Medical Imaging Systems (X-Ray, CT, MRI & Ultrasound)',
      badge: 'Diagnostic Imaging',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'biomed-xray-ct',
          name: 'X-Ray & Computed Tomography (CT) Physics',
          content: 'Radiological imaging physics and reconstruction:\n• X-Ray Generation: Bremsstrahlung and characteristic radiation produced by bombarding tungsten rotating anodes with high-voltage electrons.\n• Computed Tomography (CT): Radon transform and Filtered Backprojection (FBP) reconstruction mathematical algorithms transforming 2D projection sinograms into cross-sectional axial image slices (Hounsfield Units).'
        },
        {
          id: 'biomed-mri-ultrasound',
          name: 'Magnetic Resonance Imaging (MRI) & Diagnostic Ultrasound',
          content: 'Non-ionizing advanced diagnostic imaging:\n• MRI Physics: Hydrogen proton nuclear magnetic resonance in strong static B0 fields (1.5T / 3T), Larmor precession frequency (ω = γ * B0), RF pulse excitation (B1), T1 (spin-lattice) and T2 (spin-spin) relaxation times, and spatial gradient coils for k-space trajectory encoding.\n• Ultrasound Imaging: Piezoelectric transducer arrays emitting high-frequency acoustic pulses (2-15 MHz). A-mode, B-mode, and Doppler color flow imaging.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Medical Device Standards, Biomaterials & Implants',
      badge: 'Device Standards & Implants',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'biomed-standards-safety',
          name: 'IEC 60601 Electrical Safety & FDA 510(k) Regulations',
          content: 'Healthcare technology compliance and safety verification:\n• IEC 60601-1: Patient leakage current thresholds (Type B, BF, CF defibrillator-proof applied parts).\n• FDA Regulatory Pathways: Class I (low risk), Class II (510(k) Premarket Notification demonstrating substantial equivalence), and Class III (PMA Premarket Approval with clinical trials).'
        },
        {
          id: 'biomed-biomaterials',
          name: 'Biocompatibility & Implantable Electronics (Pacemakers)',
          content: 'Materials and implantable therapeutic devices:\n• Biomaterials: Titanium alloys, Co-Cr alloys, UHMWPE polymers, and bioceramics tested for biocompatibility under ISO 10993.\n• Cardiac Pacemakers: Hermetically sealed titanium enclosures, lithium-iodine batteries, and demand pacing circuitry.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'biomed-career-roles',
          name: 'Biomedical Engineering Career Pathways',
          content: 'Rewarding careers in biomedical and healthcare technology:\n• Medical Device Hardware Designer: Develops low-noise physiological analog front-ends and wearable biosensors.\n• Medical Imaging Systems Specialist: Operates and calibrates MRI, CT, and Ultrasound diagnostic modalities.\n• Clinical Systems Engineer: Directs hospital technology management, patient safety compliance, and critical care equipment maintenance.\n• Regulatory Affairs Associate: Authors FDA 510(k) and CE Mark technical documentation dossiers for medical device clearance.'
        },
        {
          id: 'biomed-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Hardware & Testing: Bio-potential analog filter design, low-noise PCB layout, oscilloscope diagnostics, patient simulators (Fluke ProSim).\n• Software: MATLAB, Python for biosignal processing (NeuroKit, SciPy), DICOM image processing, LabVIEW.\n• Regulations: ISO 13485 (Medical Quality Management), IEC 60601-1, FDA 21 CFR 820.'
        },
        {
          id: 'biomed-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Human Anatomy & Physiology, Circuit Theory, Engineering Mathematics, C Programming.\n• Year 2 (Semesters 3-4): Analog Electronics, Bio-potentials & Electrodes, Sensors & Transducers in Healthcare, Digital Logic.\n• Year 3 (Semesters 5-6): Biomedical Instrumentation, Bio-signal Processing, Diagnostic Medical Imaging Systems, Microcontrollers in Medicine.\n• Year 4 (Semesters 7-8): Biomaterials & Artificial Organs, Medical Device Regulations & Safety, Major Biomedical Capstone.'
        },
        {
          id: 'biomed-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. 3-Lead Diagnostic ECG Monitor with Driven-Right-Leg Circuit: Designed an analog front-end using INA128 instrumentation amplifier, notch filter, and STM32 ADC telemetry streaming to a clinical dashboard.\n2. Wearable Dual-Wavelength Pulse Oximeter & Heart Rate Monitor: Built using MAX30102 optical sensor, Bluetooth Low Energy (BLE), and custom peak-detection algorithm.\n3. Automated MRI Brain Tumor Segmentation with Deep Learning: Implemented U-Net model on BraTS DICOM dataset achieving 91% Dice similarity score.\n4. Defibrillator Discharge Energy Analyzer & Safety Verification Rig: Built a calibration fixture measuring delivered joules across standard 50-ohm test loads according to IEC 60601-2-4.'
        },
        {
          id: 'biomed-interview-questions',
          name: 'Top Biomedical Engineering Technical Interview Questions',
          content: 'Q1: Why is a Driven-Right-Leg (RLD) circuit necessary in ECG acquisition systems?\nA: The human body acts as an antenna picking up massive 50/60 Hz displacement currents from ambient AC electrical power lines through stray capacitance. This common-mode voltage can easily exceed 100 mV—dwarfing the delicate 1 mV ECG signal. While an instrumentation amplifier possesses high CMRR, slight electrode impedance imbalances convert common-mode noise into differential noise. The RLD circuit samples the patient\'s common-mode voltage, inverts it through an inverting amplifier, and injects it back to the patient\'s right leg. This creates negative feedback that suppresses body common-mode noise by up to 40 dB without loading the differential heart signal.\n\nQ2: What is the difference between Type B, BF, and CF applied parts under IEC 60601-1?\nA: Applied parts are components of medical devices that come into physical contact with patients. Type B (Body) parts are generally non-conductive or grounded, suitable for external contact without cardiac connection (allowable patient leakage current under normal conditions is 100 μA). Type BF (Body Floating) parts have electrically floating applied parts (e.g., blood pressure cuffs, external ultrasound probes), allowing 100 μA leakage. Type CF (Cardiac Floating) parts are directly connected to the human heart (e.g., cardiac catheterization sensors, intracardiac ECG electrodes); because currents as low as 10-50 μA can trigger fatal ventricular fibrillation directly on the myocardium, Type CF limits allowable leakage current to an ultra-strict maximum of only 10 μA.\n\nQ3: How does T1-weighted imaging differ from T2-weighted imaging in MRI?\nA: Both reflect relaxation times of perturbed hydrogen protons returning to thermal equilibrium. T1 (spin-lattice or longitudinal) relaxation time measures the time taken for longitudinal magnetization to recover along the static B0 axis; tissues with high lipid/fat content recover rapidly and appear BRIGHT on T1-weighted images, while fluids (like CSF) recover slowly and appear DARK. T2 (spin-spin or transverse) relaxation time measures the decay of transverse magnetization due to dephasing from mutual magnetic interactions; fluids maintain phase coherence longer and appear BRIGHT on T2-weighted images, making T2 ideal for detecting edema, inflammation, and tumors.'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 8. AERO: AEROSPACE & AERONAUTICAL ENGINEERING
// -----------------------------------------------------------------------------
catalog['AERO'] = {
  branchCode: 'AERO',
  branchName: 'Aerospace Engineering',
  slug: 'aerospace-engineering',
  specializationTitle: 'Aerodynamics, Flight Mechanics & Propulsion Systems',
  specializationTagline: 'Airfoil theory, compressible supersonic flow, gas turbine engines, aircraft structures, and orbital mechanics',
  badge: 'AEROSPACE PROPULSION & AERODYNAMICS',
  icon: 'rocket_launch',
  accentColor: '#0284c7',
  topicsCount: 25,
  overview: 'Aerospace Engineering masters the physical forces of atmospheric flight and space exploration. This specialization encompasses subsonic and supersonic aerodynamics, compressible flow shockwaves, airframe stress analysis, gas turbine propulsion, rocket engine combustion, flight dynamics stability, and orbital astrodynamics.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Aerodynamics & Compressible Flow',
      badge: 'Fluid & Aerodynamics',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'aero-airfoil-theory',
          name: 'Airfoil Theory, Lift Generation & Drag Polars',
          content: 'Aerodynamic force generation:\n• Circulation & Kutta-Joukowski Theorem: Lift per unit span L\' = ρ * V_inf * Γ.\n• Kutta Condition: Flow leaves the sharp trailing edge smoothly without infinite velocity gradients.\n• Airfoil Nomenclature (NACA 4-Digit & 5-Digit series): Camber, chord, thickness ratio, angle of attack (AoA), stall angle, and lift-to-drag ratio (L/D).\n• Drag Breakdown: Induced drag (vortex drag: CDi = CL^2 / (π * AR * e)), parasite drag (form/pressure drag and skin friction drag), and wave drag in transonic flight.'
        },
        {
          id: 'aero-compressible-flow',
          name: 'Compressible Supersonic Flow & Shock Waves',
          content: 'High-speed gas dynamics:\n• Mach Number Regimes: Subsonic (M < 0.8), Transonic (0.8 < M < 1.2), Supersonic (1.2 < M < 5.0), and Hypersonic (M > 5.0).\n• Normal & Oblique Shock Waves: Discontinuous jumps in pressure, temperature, and density with total pressure loss governed by Rankine-Hugoniot equations.\n• Expansion Fans: Continuous isentropic Prandtl-Meyer expansion turns accelerating supersonic flow.\n• De Laval Nozzle: Convergent-divergent nozzle isentropically accelerating subsonic exhaust into supersonic velocity at the throat (M = 1).'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Aircraft Structures & Aerospace Materials',
      badge: 'Structures & Materials',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'aero-structures',
          name: 'Semi-Monocoque Airframe Structures & Thin-Walled Beams',
          content: 'Structural mechanics of lightweight flight vehicles:\n• Semi-Monocoque Construction: Skin carries shear stresses; internal longitudinal stringers and longerons resist bending moments; ribs and bulkheads maintain aerodynamic contour.\n• Shear Flow & Shear Center: Bredt-Batho theory for closed thin-walled multi-cell torque boxes in wings.\n• Aeroelasticity: Divergence and destructive high-speed flutter coupling aerodynamic lift forces with structural torsional stiffness.'
        },
        {
          id: 'aero-materials',
          name: 'Aerospace Alloys & Carbon Fiber Composites',
          content: 'High-strength, lightweight aerospace materials:\n• Aluminum-Lithium Alloys (e.g., Al 2024, Al 7075): High strength-to-density ratio for fuselage and wing skins.\n• Carbon Fiber Reinforced Polymers (CFRP): Pre-preg autoclaved composites offering high specific stiffness and fatigue resistance.\n• High-Temperature Superalloys: Nickel-chromium Inconel and monocrystalline single-crystal blades in turbine hot sections.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Aircraft Propulsion & Rocket Engines',
      badge: 'Propulsion Systems',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'aero-gas-turbines',
          name: 'Gas Turbine Engines (Turbojet, Turbofan & Turboprop)',
          content: 'Aviation powerplants and thermodynamic Brayton cycle:\n• Engine Configurations: High-bypass turbofans (commercial aviation high fuel efficiency), turbojets, turboprops, and afterburning low-bypass military engines.\n• Component Performance: Diffuser inlet, axial multi-stage compressor, annular combustion chamber, high-pressure/low-pressure turbines, and exhaust nozzle.\n• Key Metrics: Thrust Specific Fuel Consumption (TSFC), overall pressure ratio (OPR), and bypass ratio (BPR).'
        },
        {
          id: 'aero-rocket-propulsion',
          name: 'Rocket Propulsion & The Tsiolkovsky Rocket Equation',
          content: 'Chemical rocket engines and space launch vehicles:\n• Ideal Rocket Equation: Δv = ve * ln(m0 / mf) = g0 * Isp * ln(m0 / mf).\n• Liquid vs Solid Propellant Rockets: Liquid engines (turbopump-fed cryogenic LOX/LH2 or LOX/Methane) offer restartability and throttle control; solid boosters provide massive launch thrust.\n• Combustion Chamber & Nozzle Dynamics: Characteristic exhaust velocity (c*), thrust coefficient (Cf), and nozzle area expansion ratio (Ae/At).'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Flight Mechanics & Orbital Astrodynamics',
      badge: 'Flight Mechanics',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'aero-flight-dynamics',
          name: 'Aircraft Stability & Flight Control (Static vs. Dynamic)',
          content: 'Flight vehicle equilibrium and control:\n• Longitudinal Static Stability: Neutral point and static margin (neutral point ahead of center of gravity ensures pitch stiffness: dCm/dα < 0).\n• Dynamic Modes: Phugoid long-period mode and short-period pitch oscillation; lateral-directional modes (Dutch roll, spiral divergence, roll subsidence).\n• Flight Control Surfaces: Ailerons (roll), elevators (pitch), rudder (yaw), flaps, and spoilers.'
        },
        {
          id: 'aero-orbital-mechanics',
          name: 'Orbital Mechanics (Kepler’s Laws & Hohmann Transfers)',
          content: 'Spacecraft orbital trajectories:\n• Kepler’s Laws of Planetary Motion: Elliptical orbits with central body at one focus.\n• Orbital Elements: Semi-major axis (a), eccentricity (e), inclination (i), RAAN (Ω), argument of periapsis (ω), true anomaly (ν).\n• Orbital Maneuvers: Hohmann transfer orbit (tangential two-impulse transfer minimizing propellant consumption).'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'aero-career-roles',
          name: 'Aerospace Engineering Career Pathways',
          content: 'Premier aerospace and defense careers:\n• Aerodynamicist & CFD Engineer: Simulates high-speed external airflow, boundary layers, and transonic drag.\n• Propulsion Systems Engineer: Analyzes gas turbine thermodynamics and rocket engine combustion stability.\n• Structural Stress & FEA Analyst: Evaluates airframe load paths, fatigue life, and composite delamination.\n• Flight Dynamics & GNC Engineer: Designs Guidance, Navigation, and Control autopilot algorithms for UAVs and satellites.'
        },
        {
          id: 'aero-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Simulation Tools: ANSYS Fluent, OpenFOAM, NASA CBAERO / FUN3D, MATLAB / Simulink, NASTRAN / PATRAN.\n• CAD & Modeling: CATIA V5, Siemens NX, SolidWorks.\n• Regulations & Standards: FAA / EASA Part 25 airworthiness regulations, MIL-STD-810 environmental testing.'
        },
        {
          id: 'aero-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Mathematics, Fluid Mechanics, Engineering Mechanics, Engineering Thermodynamics.\n• Year 2 (Semesters 3-4): Incompressible Aerodynamics, Aircraft Structures I, Materials Science, Applied Compressible Flow.\n• Year 3 (Semesters 5-6): Compressible Aerodynamics, Propulsion I (Gas Turbines), Aircraft Stability & Control, Aircraft Structures II.\n• Year 4 (Semesters 7-8): Rocket Propulsion, Spaceflight Dynamics, Computational Fluid Dynamics (CFD), Capstone Aircraft/UAV Design.'
        },
        {
          id: 'aero-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Transonic Airfoil Shock-Induced Boundary Layer Separation Simulation in OpenFOAM: Modeled supercritical RAE 2822 airfoil at Mach 0.73 using Spalart-Allmaras turbulence model.\n2. Parametric Design of Commercial Turbofan Engine Cycle in MATLAB: Optimized bypass ratio, fan pressure ratio, and turbine inlet temperature for minimum TSFC.\n3. Autonomous Fixed-Wing UAV Flight Controller in Simulink: Designed full 6-DOF longitudinal and lateral autopilots with state-space feedback and hardware-in-the-loop (HIL) testing.\n4. Finite Element Stress & Buckling Analysis of Wing Spar Torque Box: Modeled carbon-composite I-beam spar in NASTRAN under 2.5g gust aerodynamic loading.'
        },
        {
          id: 'aero-interview-questions',
          name: 'Top Aerospace Engineering Technical Interview Questions',
          content: 'Q1: What causes Induced Drag on a finite-span aircraft wing, and how do winglets reduce it?\nA: Unlike an infinite 2D airfoil, a 3D finite wing has high-pressure air beneath the lower wing surface and low-pressure air above the upper surface. At the wingtips, high-pressure air curls outward and upward around the tip into the low-pressure region, creating powerful rotating wingtip vortices. These vortices induce a downward velocity component (downwash) across the wing, effectively tilting the local relative wind and lift vector backward, producing an aft-pointing drag component called Induced Drag: CDi = CL^2 / (π * AR * e). Winglets act as vertical aerodynamic barriers that disrupt and diffuse these tip vortices, effectively increasing the wing\'s effective Aspect Ratio (AR) without adding excessive root bending moment, cutting induced drag by 4-7%.\n\nQ2: What is the Area Rule in transonic and supersonic aircraft design?\nA: The Whitcomb Area Rule states that to minimize wave drag near the speed of sound (Mach 0.8 to 1.2), the total cross-sectional area distribution of the entire aircraft from nose to tail must vary as smoothly as possible, mimicking an ideal Sears-Haack body. When wings are attached to a cylindrical fuselage, the sudden jump in cross-sectional area causes intense sonic shockwaves and massive drag. By narrowing or \'pinching\' the fuselage inward at the wing location (the classic \'wasp-waist\' or \'Coke-bottle\' contour), the cross-sectional area remains smooth, dramatically reducing transonic wave drag and enabling supersonic flight without excessive thrust.\n\nQ3: Explain the difference between static and dynamic stability in aircraft flight mechanics.\nA: Static stability is the initial tendency of an aircraft to return toward its original trimmed equilibrium state immediately after being disturbed by an external gust without pilot intervention (e.g., if a pitch-up disturbance generates an immediate nose-down restoring aerodynamic moment, the aircraft is statically stable: dCm/dα < 0). Dynamic stability describes the time history and oscillatory behavior of that motion over time. A statically stable aircraft might oscillate with increasing amplitude (dynamically unstable), oscillate with constant amplitude (neutral), or damp out its oscillations smoothly over time (dynamically stable). An aircraft MUST be statically stable before it can be dynamically stable.'
        }
      ]
    }
  ]
};

// Copy to 'AERONAUT'
catalog['AERONAUT'] = JSON.parse(JSON.stringify(catalog['AERO']));
catalog['AERONAUT'].branchCode = 'AERONAUT';
catalog['AERONAUT'].branchName = 'Aeronautical Engineering';

// -----------------------------------------------------------------------------
// 9. MECHTRON: MECHATRONICS ENGINEERING
// -----------------------------------------------------------------------------
catalog['MECHTRON'] = {
  branchCode: 'MECHTRON',
  branchName: 'Mechatronics Engineering',
  slug: 'mechatronics',
  specializationTitle: 'Mechatronics, Electro-Mechanical Systems & Industrial Robotics',
  specializationTagline: 'Precision actuators, microcontrollers, ROS robotics, motion control, pneumatic circuits, and cyber-physical systems',
  badge: 'MECHATRONICS & CYBER-PHYSICAL SYSTEMS',
  icon: 'smart_toy',
  accentColor: '#ec4899',
  topicsCount: 25,
  overview: 'Mechatronics Engineering unifies mechanical kinematics, precision electronics, embedded computing, and control theory into smart autonomous machinery. This specialization covers electro-mechanical actuators (steppers, BLDC, servos), sensor interfacing, programmable logic controllers (PLC), Robot Operating System (ROS), and automated cyber-physical production lines.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Electro-Mechanical Actuators & Power Drives',
      badge: 'Actuators & Mechanics',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'mechtron-actuators',
          name: 'Precision Actuators (BLDC, Steppers, Servos & Solenoids)',
          content: 'Motion generation in mechatronic systems:\n• Stepper Motors: Variable reluctance, permanent magnet, and hybrid steppers. Microstepping driver control (A4988, TMC2209) providing smooth high-resolution angular positioning without position feedback.\n• BLDC & PMSM Motors: Electronically commutated 3-phase motors using Hall sensors or back-EMF zero-crossing detection for high power density and efficiency.\n• Industrial AC/DC Servomotors: Closed-loop motion systems integrating rotary optical/magnetic encoders, harmonic drive gearboxes, and multi-axis PID servo drives.'
        },
        {
          id: 'mechtron-fluid-power',
          name: 'Pneumatics & Electro-Hydraulic Motion Control',
          content: 'Fluid power automation systems:\n• Pneumatic Actuation: Double-acting cylinders, solenoid directional control valves (5/2, 3/2 valves), flow control restrictors, and pneumatic logic.\n• Electro-Hydraulics: Proportional valves and servo-valves providing massive force density for heavy industrial presses and earthmoving automation.'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Sensors & Embedded Controller Interfacing',
      badge: 'Sensors & Controllers',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'mechtron-sensors',
          name: 'Sensor Interfacing & Signal Acquisition (Encoders, IMU & ToF)',
          content: 'Perception in cyber-physical machines:\n• Inertial Measurement Units (IMU): 6-axis/9-axis MEMS gyroscopes and accelerometers filtered via Kalman and Complementary filters for orientation tracking.\n• Optical & Magnetic Encoders: Quadrature decoding (A/B channels with 90° phase shift) measuring velocity and direction.\n• Microcontroller Bus Interfacing: SPI (high-speed DAC/ADC communication), I2C, and CAN bus networking.'
        },
        {
          id: 'mechtron-embedded-rtos',
          name: 'Embedded Real-Time Control & FreeRTOS',
          content: 'Deterministic software execution on microcontrollers:\n• FreeRTOS Core: Preemptive priority-based scheduling, tasks, semaphores, mutexes, and message queues.\n• Hard Real-Time Constraints: Interrupt Service Routines (ISRs) controlling PWM motor drives with microsecond determinism.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Robotics & Motion Control Algorithms',
      badge: 'Robotics & Control',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'mechtron-robot-kinematics',
          name: 'Robot Kinematics (Forward, Inverse & Denavit-Hartenberg)',
          content: 'Mathematical modeling of robotic manipulators:\n• Spatial Transformations: Homogeneous transformation matrices (4×4) combining rotation and translation.\n• Denavit-Hartenberg (D-H) Convention: Systematic parameterization (link length a, twist α, offset d, joint angle θ).\n• Inverse Kinematics: Analytical and numerical (Jacobian pseudo-inverse) methods computing joint angles from target end-effector coordinates.'
        },
        {
          id: 'mechtron-ros',
          name: 'Robot Operating System (ROS / ROS 2) & Gazebo Simulation',
          content: 'Software middleware for robotics:\n• ROS Architecture: Nodes, topics, services, actions, parameters, and ROS 2 DDS (Data Distribution Service) real-time middleware.\n• Simulation & Visualization: Gazebo physics simulation engine and RViz 3D sensor visualizer.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Industrial Automation & Digital Factory',
      badge: 'Industrial Automation',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'mechtron-plc-automation',
          name: 'PLC Integration & Factory Automation Systems',
          content: 'Integrated assembly lines:\n• Industrial PLCs: Siemens S7-1500 / Allen-Bradley ControlLogix coordinating pneumatic conveyors, vision inspection cameras, and robotic arms.\n• Safety Standards: Safety relays, optical light curtains, and emergency stop interlocks complying with ISO 13849.'
        },
        {
          id: 'mechtron-digital-twin',
          name: 'Digital Twins, IIoT & Industry 4.0 Architecture',
          content: 'Smart manufacturing cyber-physical systems:\n• Digital Twin: Synchronizing physical machine telemetry with real-time 3D simulation models for predictive maintenance.\n• Industrial IoT Protocols: OPC UA and MQTT bridging field mechatronics to cloud data pipelines.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'mechtron-career-roles',
          name: 'Mechatronics Engineering Career Pathways',
          content: 'High-demand career tracks:\n• Mechatronics System Engineer: Designs integrated electro-mechanical machines, consumer electronics, and smart tools.\n• Robotics & Automation Specialist: Programs multi-axis industrial robots, cobots, and automated guided vehicles (AGVs).\n• Motion Control Firmware Developer: Develops real-time motor control algorithms on embedded ARM and DSP chips.\n• Industrial Automation Integrator: Commissions turnkey manufacturing cells and automated assembly lines.'
        },
        {
          id: 'mechtron-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Programming: C/C++ (Embedded), Python, ROS 2, Structured Text (PLC).\n• CAD & EDA: SolidWorks, Fusion 360, Altium Designer (PCB design), MATLAB/Simulink.\n• Hardware: Microcontrollers (STM32, ESP32), servo drives, stepper drivers, pneumatic circuits, CAN bus.'
        },
        {
          id: 'mechtron-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Mechanics, Circuit Analysis, C Programming, Engineering Graphics (CAD).\n• Year 2 (Semesters 3-4): Analog & Digital Electronics, Sensors & Instrumentation, Mechanisms & Machine Theory, Microcontrollers.\n• Year 3 (Semesters 5-6): Control Systems Theory, Electro-Pneumatics & Hydraulics, Robotics & Kinematics, PLC Programming.\n• Year 4 (Semesters 7-8): Embedded RTOS, Industrial Robotics & Vision, Digital Twin Modeling, Capstone Mechatronics Project.'
        },
        {
          id: 'mechtron-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. 4-DOF Articulated Robotic Arm with Computer Vision: Designed custom 3D-printed cycloidal gearboxes, stepper motor drives, and OpenCV color-based pick-and-place tracking in ROS 2.\n2. Inverted Pendulum Self-Balancing Robot: Implemented on STM32 with MPU-6050 IMU, encoder velocity feedback, and full state-space LQR (Linear Quadratic Regulator) control.\n3. Automated Pneumatic Sorting Assembly Cell with PLC: Controlled via Siemens S7-1200 with inductive/capacitive proximity sensors, pneumatic diverters, and HMI display.\n4. Custom Brushless DC (BLDC) Motor Driver PCB: Designed in Altium Designer with discrete gate drivers, MOSFET half-bridges, current sense amplifiers, and sinusoidal FOC firmware.'
        },
        {
          id: 'mechtron-interview-questions',
          name: 'Top Mechatronics Technical Interview Questions',
          content: 'Q1: What is the difference between a Stepper Motor and a Servo Motor, and when do you choose each?\nA: A stepper motor moves in discrete angular steps (typically 1.8° per full step, 200 steps/rev) commanded by pulses in open loop without position feedback. Steppers offer high holding torque at low speeds and low system cost, but can lose steps under unexpected heavy loads and suffer from resonance and high power consumption at idle. A servo motor consists of a motor (DC, brushless, or AC) coupled with a closed-loop position encoder and feedback amplifier; it delivers smooth high-speed torque, draws current proportional to load, and corrects position errors dynamically. Choose steppers for budget-constrained precise positioning (3D printers, scanners); choose servos for high-speed dynamic robotics, machine tools, and heavy payloads.\n\nQ2: What is the purpose of the Denavit-Hartenberg (D-H) convention in robotics?\nA: The D-H convention provides a standardized, mathematically minimal framework to establish coordinate reference frames on each link of a serial robot manipulator. By constraining the x-axis to be perpendicular to the z-axis of the preceding frame and intersecting it, any spatial relationship between consecutive links can be fully defined using exactly four parameters: link length (a), link twist (α), link offset (d), and joint angle (θ). This simplifies the computation of the global forward kinematics matrix (multiplying consecutive 4×4 homogeneous transformation matrices) to locate the robot\'s end-effector in Cartesian space.\n\nQ3: Explain the role of a Flyback Diode across an inductive solenoid or relay coil.\nA: An inductive coil stores energy in its magnetic field: E = 0.5 * L * I^2. When the transistor or switch driving the coil is abruptly turned off, the current attempts to drop to zero instantaneously. According to Faraday’s law of induction (V = -L * di/dt), the collapsing magnetic field induces a massive reverse voltage spike (often hundreds of volts) across the switch contacts or semiconductor transistor, easily destroying it. A flyback diode (placed in reverse-parallel across the coil) provides a safe, closed conduction path for the stored inductive current to recirculate and dissipate harmlessly as heat in the coil\'s winding resistance.'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 10. ROBOTICS: ROBOTICS ENGINEERING
// -----------------------------------------------------------------------------
catalog['ROBOTICS'] = {
  branchCode: 'ROBOTICS',
  branchName: 'Robotics Engineering',
  slug: 'robotics',
  specializationTitle: 'Autonomous Robotics, Kinematics & Computer Vision',
  specializationTagline: 'Robot dynamics, trajectory planning, ROS 2, SLAM navigation, robotic manipulators, and deep reinforcement learning',
  badge: 'AUTONOMOUS ROBOTICS & KINEMATICS',
  icon: 'precision_manufacturing',
  accentColor: '#f97316',
  topicsCount: 25,
  overview: 'Robotics Engineering creates intelligent physical agents capable of interacting dynamically with the physical world. This specialization investigates multi-body spatial kinematics, Lagrangian dynamics, path planning, Simultaneous Localization and Mapping (SLAM), autonomous navigation, computer vision perception, and ROS 2 middleware.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Spatial Kinematics & Manipulator Dynamics',
      badge: 'Kinematics & Dynamics',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'robo-kinematics',
          name: 'Forward & Inverse Kinematics, Jacobian & Singularities',
          content: 'Kinematic representations of robotic arms:\n• Homogeneous Transformations: SO(3) rotation matrices and SE(3) rigid body motions.\n• Jacobian Matrix: Maps joint velocity vector to Cartesian linear and angular end-effector velocities (v = J(q) * q_dot).\n• Singularities: Configurations where det(J) = 0, causing the robot to lose one or more degrees of freedom and requiring infinite joint velocities to move in certain Cartesian directions.'
        },
        {
          id: 'robo-dynamics',
          name: 'Rigid Body Dynamics (Euler-Lagrange & Newton-Euler)',
          content: 'Torque and force equations governing robot motion:\n• Euler-Lagrange Formulation: Kinetic energy T and potential energy V yielding Lagrangian L = T - V. Dynamic equation: M(q)*q_ddot + C(q, q_dot)*q_dot + G(q) = τ.\n• Mass Matrix M(q), Coriolis and Centrifugal Matrix C(q, q_dot), and Gravity Vector G(q).'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Perception, Computer Vision & SLAM',
      badge: 'Perception & SLAM',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'robo-vision-perception',
          name: 'Robot Vision & Depth Sensing (RGB-D, LiDAR & Point Clouds)',
          content: 'Spatial perception in unstructured environments:\n• Spatial Sensors: 2D/3D LiDAR (Light Detection and Ranging), stereo vision cameras, and structured-light RGB-D cameras (Intel RealSense).\n• Point Cloud Processing: Point Cloud Library (PCL), voxel grid filtering, RANSAC plane segmentation, and ICP (Iterative Closest Point) point cloud registration.'
        },
        {
          id: 'robo-slam-algorithms',
          name: 'Simultaneous Localization & Mapping (SLAM)',
          content: 'Autonomous mapping and self-localization:\n• The SLAM Problem: Concurrently constructing a map of an unknown environment while keeping track of the robot\'s location within it.\n• Modern SLAM Algorithms: Graph-based SLAM (Cartographer), EKF-SLAM, and visual SLAM (ORB-SLAM3) optimizing pose graphs and loop closure constraints.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Motion Planning & Autonomous Navigation',
      badge: 'Navigation & Planning',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'robo-path-planning',
          name: 'Path Planning Algorithms (A*, RRT* & Dijkstra)',
          content: 'Finding collision-free paths through configuration space:\n• Configuration Space (C-Space): Transforming physical robot geometry and obstacles into point-robot representation.\n• Graph-Search Algorithms: A* search with Euclidean and Manhattan heuristics, Dijkstra’s algorithm.\n• Sampling-Based Planners: Rapidly-exploring Random Trees (RRT and asymptotically optimal RRT*) and Probabilistic Roadmaps (PRM) for high-dimensional manipulator planning.'
        },
        {
          id: 'robo-trajectory-control',
          name: 'Trajectory Generation & Trajectory Tracking (PID & MPC)',
          content: 'Smooth physical motion profiles:\n• Trajectory Generation: Cubic and quintic polynomial trajectories guaranteeing continuous position, velocity, and jerk profiles.\n• Model Predictive Control (MPC): Optimizing control inputs over a finite receding horizon while respecting physical motor torque and velocity limits.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: ROS 2 Architecture & Industrial Robotics',
      badge: 'ROS 2 & Automation',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'robo-ros2-nav2',
          name: 'ROS 2 Navigation Stack (Nav2) & Behavior Trees',
          content: 'Autonomous mobile robot (AMR) control stack:\n• Nav2 Architecture: Costmaps (global and local costmaps with inflation layers), path planners, controllers (DWB, MPPI), recovery behaviors, and Behavior Trees orchestrating complex missions.'
        },
        {
          id: 'robo-cobots-safety',
          name: 'Collaborative Robots (Cobots) & Safety Standards',
          content: 'Human-robot collaboration on assembly floors:\n• Cobot Safety: Power and force limiting (PFL) sensors, compliant series elastic actuators, and ISO/TS 15066 safety standards for fenceless shared workspaces.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'robo-career-roles',
          name: 'Robotics Engineering Career Pathways',
          content: 'Leading career trajectories for roboticists:\n• Robotics Software Engineer: Develops core autonomy, navigation, and state estimation software in C++ and ROS 2.\n• Perception & Computer Vision Engineer: Designs real-time 3D object detection and SLAM mapping pipelines.\n• Motion Planning & Controls Engineer: Solves trajectory optimization and dynamic motor control for arms and mobile robots.\n• Field Robotics & Systems Engineer: Deploys and tunes autonomous mobile robots in warehouses and agricultural fields.'
        },
        {
          id: 'robo-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Software: Modern C++ (C++17/20), Python, ROS 2, Gazebo, OpenCV, PCL, MoveIt 2, Nav2.\n• Mathematics: Lie Groups, Quaternions, Linear Algebra, Kalman Filtering, Non-linear Optimization.'
        },
        {
          id: 'robo-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Mechanics, Linear Algebra, Calculus, Python & C++ Programming.\n• Year 2 (Semesters 3-4): Classical Mechanics, Electronics & Actuators, Data Structures & Algorithms, Robot Kinematics.\n• Year 3 (Semesters 5-6): Robot Dynamics, Computer Vision & Perception, ROS 2 & Middleware, Feedback Control Systems.\n• Year 4 (Semesters 7-8): SLAM & Autonomous Navigation (Nav2), Deep Reinforcement Learning in Robotics, Capstone Autonomous Robot Project.'
        },
        {
          id: 'robo-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Autonomous Warehouse Mobile Robot (AMR) with 2D LiDAR & Nav2: Designed differential drive robot simulation in Gazebo with cartographer SLAM, costmaps, and obstacle avoidance.\n2. 6-DOF Industrial Arm MoveIt 2 Trajectory Planner: Implemented RRT* kinematic path planning, collision checking, and inverse kinematics solving for custom manipulator.\n3. Visual Inertial Odometry (VIO) Pipeline: Implemented extended Kalman filter fusing stereo camera optical flow with IMU sensor telemetry at 100 Hz.\n4. Quadruped Robot Trotting Controller in PyBullet: Implemented Bezier curve foot trajectory generation and inverse kinematics for 12-motor four-legged robot.'
        },
        {
          id: 'robo-interview-questions',
          name: 'Top Robotics Engineering Technical Interview Questions',
          content: 'Q1: What is a kinematic singularity in a robot manipulator, and why is it dangerous?\nA: A kinematic singularity occurs when the manipulator is in a geometric configuration where the Jacobian matrix loses full column or row rank (det(J) = 0). At this point: 1. The robot loses one or more degrees of freedom and physically cannot move in certain Cartesian directions; 2. Small Cartesian velocity commands in the singular direction map through the inverse Jacobian (J^-1) into infinite joint velocity demands, causing motor drive saturation, violent jerking, loss of control, and mechanical damage. In practice, damped least-squares (Levenberg-Marquardt) inverse kinematics are used near singularities to sacrifice path accuracy in exchange for bounded joint speeds.\n\nQ2: How does the Extended Kalman Filter (EKF) solve the sensor fusion problem?\nA: The Kalman filter is an optimal linear quadratic estimator. For non-linear robotic systems (e.g., non-linear kinematics and sensor measurement models), the Extended Kalman Filter linearizes non-linear functions around the current state estimate using first-order Taylor series expansions (computing Jacobian matrices F and H). The EKF operates in two cyclic phases: 1. Predict (projects state forward using the system kinematic motion model and increases uncertainty covariance P); 2. Update (computes Kalman Gain K based on relative measurement noise R vs predicted state covariance, weighting the difference between actual sensor readings and expected readings to correct the state estimate).\n\nQ3: What is the difference between Dijkstra, A*, and RRT* path planning algorithms?\nA: Dijkstra explores outward uniformly in all directions, guaranteeing the shortest path but evaluating an enormous number of nodes. A* dramatically improves search efficiency by adding a heuristic function h(n) estimating the cost from current node to goal (f(n) = g(n) + h(n)), focusing the search directly toward the target. Both Dijkstra and A* require discretizing the environment into grids or graphs, which suffers from the curse of dimensionality in high-DOF robots (like 6-DOF arms). RRT (Rapidly-exploring Random Tree) is a sampling-based algorithm that scales efficiently in high-dimensional continuous configuration spaces by randomly sampling points and growing a tree; RRT* adds an asymptotic rewiring step that guarantees the found trajectory converges to the mathematically optimal shortest path as the number of samples approaches infinity.'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 11. MFG: MANUFACTURING ENGINEERING
// -----------------------------------------------------------------------------
catalog['MFG'] = {
  branchCode: 'MFG',
  branchName: 'Manufacturing Engineering',
  slug: 'manufacturing-engineering',
  specializationTitle: 'Advanced Manufacturing, CNC, Additive Tech & Smart Factory',
  specializationTagline: 'Precision machining, CAD/CAM, metal 3D printing, GD&T metrology, Lean Six Sigma, and Industry 4.0',
  badge: 'ADVANCED MANUFACTURING & PRODUCTION',
  icon: 'factory',
  accentColor: '#f59e0b',
  topicsCount: 25,
  overview: 'Manufacturing Engineering translates product designs into high-precision, economical, and defect-free physical products at scale. This specialization covers subtractive machining, 5-axis CNC programming, additive manufacturing (metal and polymer 3D printing), casting and forming metallurgy, Geometric Dimensioning & Tolerancing (GD&T), and Lean Six Sigma quality control.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Machining Theory, Tooling & 5-Axis CNC Programming',
      badge: 'Subtractive Machining',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'mfg-machining-physics',
          name: 'Metal Cutting Physics & Merchant’s Circle Diagram',
          content: 'Mechanics of metal cutting operations:\n• Orthogonal Cutting: Primary shear zone, secondary shear zone (chip-tool interface), and tertiary clearance zone.\n• Merchant\'s Force Circle: Resolves cutting force (Fc), thrust force (Ft), shear force (Fs), and frictional force (F) on the tool rake face.\n• Tool Wear & Taylor\'s Tool Life Equation: V * T^n = C, where V is cutting speed, T is tool life, and n is tool material exponent (carbides, ceramics, CBN).'
        },
        {
          id: 'mfg-cnc-programming',
          name: 'Multi-Axis CNC Programming (G-Code & CAM Post-Processing)',
          content: 'Computer numerical control manufacturing:\n• G-Code Programming: Preparatory functions (G00 rapid traverse, G01 linear interpolation, G02/G03 circular interpolation, G41/G42 tool radius compensation, canned drilling cycles G81-G84).\n• 5-Axis Simultaneous Machining: Tool axis orientation vectors (I, J, K), tool center point management (TCPM), and CAM toolpath strategies.'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Additive Manufacturing & Modern Forming',
      badge: 'Additive & Advanced Tech',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'mfg-metal-additive',
          name: 'Metal Additive Manufacturing (DMLS, SLM & EBM)',
          content: 'Powder-bed fusion and direct energy deposition:\n• Powder Bed Fusion (SLM/DMLS): High-power fiber lasers selectively melting micron-scale metal powders layer-by-layer under inert argon atmosphere.\n• Thermal Stresses & Supports: Heat dissipation, residual stress relief, and post-process Hot Isostatic Pressing (HIP) eliminating internal micro-porosity.'
        },
        {
          id: 'mfg-metal-forming',
          name: 'Metal Forming & Casting Metallurgy',
          content: 'Bulk deformation and casting engineering:\n• Metal Forming: Rolling, forging, deep drawing, and extrusion governed by Von Mises and Tresca yield criteria.\n• Precision Casting: Investment casting (lost-wax process) and high-pressure die casting with gating and riser design optimizing solidification fronts.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: GD&T, Metrology & Quality Engineering',
      badge: 'Quality & Metrology',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'mfg-gdt-standards',
          name: 'Geometric Dimensioning & Tolerancing (GD&T ASME Y14.5)',
          content: 'Precision engineering drawings and tolerance control:\n• Datum Reference Frames: Primary, secondary, and tertiary datums establishing 6-DOF part constraint.\n• Geometric Characteristics: Form (flatness, roundness), Orientation (perpendicularity, parallelism, angularity), and Location (true position with Maximum Material Condition MMC modifiers).'
        },
        {
          id: 'mfg-cmm-metrology',
          name: 'Coordinate Measuring Machines (CMM) & Surface Metrology',
          content: 'High-precision inspection techniques:\n• CMM Inspection: Touch-trigger and optical scanning probes measuring spatial point clouds against CAD nominal geometry.\n• Surface Roughness: Stylus profilometry and optical interferometry measuring Ra, Rz, and Abbott-Firestone bearing area curves.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Lean Manufacturing, Six Sigma & Industry 4.0',
      badge: 'Lean & Smart Factory',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'mfg-lean-six-sigma',
          name: 'Lean Production & Six Sigma (DMAIC & Statistical Process Control)',
          content: 'Operational excellence methodologies:\n• Lean Principles: Eliminating 8 Wastes (Muda: Overproduction, Waiting, Transport, Overprocessing, Inventory, Motion, Defects, Underutilized Talent); Value Stream Mapping (VSM), 5S, Kanban pull systems.\n• Statistical Process Control (SPC): X-bar and R control charts, process capability indices (Cp, Cpk ≥ 1.33), and DMAIC methodology.'
        },
        {
          id: 'mfg-smart-factory',
          name: 'Smart Factory, MES & OEE Optimization',
          content: 'Data-driven modern production floors:\n• Overall Equipment Effectiveness (OEE): OEE = Availability × Performance × Quality.\n• Manufacturing Execution Systems (MES): Bridging ERP business orders to real-time machine telemetry for automated dispatching and traceability.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'mfg-career-roles',
          name: 'Manufacturing Engineering Career Pathways',
          content: 'High-impact careers in modern manufacturing:\n• Manufacturing Process Engineer: Develops tooling, fixture designs, and CNC machining processes.\n• Quality & Metrology Engineer: Manages GD&T inspections, CMM programming, and Six Sigma defect reduction.\n• Additive Manufacturing Specialist: Directs metal 3D printing parameters, build orientation, and post-processing.\n• Plant Operations & Lean Manager: Directs continuous improvement, factory capacity planning, and shop floor automation.'
        },
        {
          id: 'mfg-skills-required',
          name: 'Core Technical Skills Required',
          content: '• CAM Software: Mastercam, Siemens NX CAM, Autodesk Fusion 360 CAM, PowerMill.\n• Quality & Metrology: GD&T (ASME Y14.5), PC-DMIS (CMM programming), Minitab for statistical analysis.\n• Standards: ISO 9001, AS9100 (Aerospace Quality), IATF 16949 (Automotive Quality).'
        },
        {
          id: 'mfg-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Graphics, Materials Science, Engineering Mathematics, Workshop Practice.\n• Year 2 (Semesters 3-4): Manufacturing Technology (Machining & Forming), Mechanics of Solids, Metrology & Inspection.\n• Year 3 (Semesters 5-6): CNC Technology & CAM, Additive Manufacturing, Tool & Die Design, Statistical Quality Control.\n• Year 4 (Semesters 7-8): Lean Manufacturing & Six Sigma, Smart Factory Automation & Robotics, Capstone Production Project.'
        },
        {
          id: 'mfg-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. 5-Axis CNC Machining & Toolpath Optimization of Aerospace Impeller: Programmed in Siemens NX CAM with collision avoidance, trochoidal milling, and surface finish verification.\n2. Topology Optimization & Metal 3D Printing of Lightweight Automotive Bracket: Redesigned in Altair Inspire reducing weight by 45% while preserving structural stiffness in Ti-6Al-4V.\n3. Complete CMM Automated Inspection Routine for Precision Turbine Disk: Programmed in PC-DMIS with automated true position, runout, and flatness evaluations.\n4. Six Sigma DMAIC Defect Reduction Project on Stamping Line: Applied Pareto analysis and Gage R&R, boosting Cpk from 0.89 to 1.42 and cutting scrap rate by 60%.'
        },
        {
          id: 'mfg-interview-questions',
          name: 'Top Manufacturing Engineering Technical Interview Questions',
          content: 'Q1: What is the difference between Cp and Cpk in Statistical Process Control (SPC)?\nA: Process capability index Cp measures the potential capability of a process if it were perfectly centered between specification limits: Cp = (USL - LSL) / (6 * σ). It evaluates process spread (precision) only, ignoring whether the process mean is off-center. Cpk measures actual process performance by accounting for both process spread and centering: Cpk = min[(USL - μ) / (3σ), (μ - LSL) / (3σ)]. A process can have a high Cp (>1.5) but an unacceptable Cpk (<1.0) if the mean has drifted toward one specification limit, causing defects. A world-class Six Sigma process targets Cpk ≥ 1.33 to 1.67.\n\nQ2: What is the Maximum Material Condition (MMC) modifier in GD&T, and how does it provide bonus tolerance?\nA: Maximum Material Condition (symbol Ⓜ) denotes the state of a part feature where it contains the maximum amount of material within its stated dimensional tolerance (e.g., the smallest hole diameter or the largest pin diameter). When a geometric tolerance (such as position) is specified at MMC, the stated tolerance applies only when the feature is at its worst-case maximum material boundary. If the manufactured feature departs from MMC toward Least Material Condition (e.g., the hole is machined larger), the difference between actual size and MMC size is added directly to the allowed positional tolerance as a \'bonus tolerance\', reducing rejected parts without compromising mechanical assembly fit.\n\nQ3: What causes residual stresses in Selective Laser Melting (SLM) metal 3D printing, and how are they relieved?\nA: During SLM, a high-power laser locally melts metal powder into small molten melt pools that cool and solidify at extreme rates (10^5 to 10^6 K/s). As the top layer cools and contracts, the underlying solid layers resist this contraction, creating immense tensile residual stresses in the top layers and compressive stresses below. If unmanaged, these stresses cause part warping, delamination from the build plate, and micro-cracking during printing. Mitigations: 1. Preheating the build plate (up to 200-500°C) to reduce thermal gradients; 2. Using island/checkerboard scan strategies to distribute heat; 3. Post-build stress-relief heat treatment in a vacuum furnace while the part remains clamped to the build plate, followed by Hot Isostatic Pressing (HIP).'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 12. IND: INDUSTRIAL & PRODUCTION ENGINEERING
// -----------------------------------------------------------------------------
catalog['IND'] = {
  branchCode: 'IND',
  branchName: 'Industrial & Production Engineering',
  slug: 'industrial-engineering',
  specializationTitle: 'Operations Research, Supply Chain & Systems Optimization',
  specializationTagline: 'Linear programming, inventory theory, simulation modeling, ergonomics, quality control, and facilities planning',
  badge: 'OPERATIONS RESEARCH & SYSTEMS OPTIMIZATION',
  icon: 'conveyor_belt',
  accentColor: '#64748b',
  topicsCount: 25,
  overview: 'Industrial & Production Engineering optimizes complex integrated systems of people, capital, materials, information, and energy. This specialization explores operations research optimization, stochastic queuing models, global supply chain network design, dynamic facility layout, ergonomics, and production scheduling.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Operations Research & Linear Programming',
      badge: 'Optimization',
      semesterRecommendation: [1, 2],
      topics: [
        {
          id: 'ind-linear-programming',
          name: 'Linear Programming & Simplex Algorithm',
          content: 'Mathematical optimization of constrained resources:\n• Mathematical Formulation: Objective function (maximize profit / minimize cost) subject to linear inequality constraints.\n• Simplex Method: Slack and surplus variables, pivot operations, dual problem formulation, and shadow prices indicating marginal value of constrained resources.\n• Integer & Dynamic Programming: Branch-and-bound algorithms for discrete decision problems (knapsack, traveling salesman).'
        },
        {
          id: 'ind-queuing-theory',
          name: 'Queuing Theory & Stochastic Process Modeling',
          content: 'Waiting line dynamics in industrial systems:\n• Kendall\'s Notation: M/M/1, M/M/c, M/G/1 queuing systems.\n• Little’s Law: Average number of customers in a stable system equals average arrival rate multiplied by average waiting time (L = λ * W).'
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Module 2: Supply Chain Engineering & Inventory Control',
      badge: 'Supply Chain & Inventory',
      semesterRecommendation: [3, 4],
      topics: [
        {
          id: 'ind-inventory-models',
          name: 'Deterministic & Stochastic Inventory Models (EOQ & Safety Stock)',
          content: 'Balancing inventory holding costs against order setup costs:\n• Economic Order Quantity (EOQ): Optimal batch size Q* = √( (2 * D * S) / H ).\n• Safety Stock: Continuous review (s, S) and periodic review models determining buffer inventory under demand uncertainty (Safety Stock = Z * σ_demand * √LeadTime).'
        },
        {
          id: 'ind-supply-chain-network',
          name: 'Supply Chain Network Optimization & Bullwhip Effect',
          content: 'Global logistics and distribution planning:\n• Bullwhip Effect: Demand distortion amplifying upstream through supply chains due to order batching, lead-time delays, and price fluctuations; mitigated by vendor-managed inventory (VMI).\n• Transportation Modeling: Transshipment problems, vehicle routing problems (VRP), and warehouse location optimization.'
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Module 3: Production Planning, Scheduling & Facilities Layout',
      badge: 'Production Systems',
      semesterRecommendation: [5, 6],
      topics: [
        {
          id: 'ind-production-planning',
          name: 'Aggregate Planning, MRP & Master Production Scheduling',
          content: 'Manufacturing resource orchestration:\n• Sales and Operations Planning (S&OP): Level vs. chase production strategies.\n• Materials Requirement Planning (MRP I & II): Bill of Materials (BOM) explosion, inventory netting, and lead-time offsetting determining gross and net requirements.'
        },
        {
          id: 'ind-facility-layout',
          name: 'Facility Layout Design & Line Balancing',
          content: 'Factory floor optimization and assembly lines:\n• Plant Layout Types: Product (line) layout, process (functional) layout, and cellular manufacturing using Rank Order Clustering (ROC).\n• Assembly Line Balancing: Cycle time calculation (C = Operating Time / Demand), minimum theoretical workstations, and line efficiency optimization.'
        }
      ]
    },
    {
      id: 'module-4',
      title: 'Module 4: Work Study, Ergonomics & Systems Simulation',
      badge: 'Work Study & Simulation',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'ind-work-study',
          name: 'Method Study, Time Measurement & Human Ergonomics',
          content: 'Human-machine productivity optimization:\n• Method Study: Process charts, two-handed operation charts, therblig analysis eliminating redundant motions.\n• Time Study: Normal time and standard time calculation factoring in relaxation and fatigue allowances.\n• Ergonomics: Biomechanical limits, NIOSH lifting equation, and workstation anthropometric design.'
        },
        {
          id: 'ind-discrete-simulation',
          name: 'Discrete-Event Systems Simulation (Simio & Arena)',
          content: 'Dynamic stochastic process simulation:\n• Simulation Methodology: Generating random variates, Monte Carlo simulation, statistical validation, and sensitivity analysis of manufacturing bottlenecks.'
        }
      ]
    },
    {
      id: 'module-5',
      title: 'Module 5: Industry Roles, Skills, Projects & Technical Interview Bank',
      badge: 'Career Acceleration',
      semesterRecommendation: [7, 8],
      topics: [
        {
          id: 'ind-career-roles',
          name: 'Industrial Engineering Career Pathways',
          content: 'High-growth careers in industrial optimization:\n• Supply Chain & Operations Analyst: Optimizes global distribution networks, inventory levels, and logistics.\n• Continuous Improvement / Lean Engineer: Leads Kaizen events, value stream mapping, and factory floor throughput gains.\n• Production Planning & Control Manager: Manages MRP runs, scheduling dispatching, and bottleneck resolution.\n• Systems Simulation Specialist: Models complex airport terminals, healthcare hospitals, and gigafactory lines in Simio/Arena.'
        },
        {
          id: 'ind-skills-required',
          name: 'Core Technical Skills Required',
          content: '• Optimization & Math: Python (PuLP, SciPy, Gurobi), R, Linear Programming, Arena, Simio, AnyLogic.\n• Enterprise Systems: SAP S/4HANA (PP/MM modules), Tableau/PowerBI, SQL, Excel advanced modeling.'
        },
        {
          id: 'ind-learning-roadmap',
          name: 'Semester-by-Semester Learning Roadmap',
          content: '• Year 1 (Semesters 1-2): Engineering Mathematics, Probability & Statistics, Engineering Mechanics, Programming in Python.\n• Year 2 (Semesters 3-4): Work Study & Ergonomics, Operations Research I (Linear Optimization), Manufacturing Processes, Engineering Economics.\n• Year 3 (Semesters 5-6): Operations Research II (Queuing & Stochastic), Supply Chain Management, Statistical Quality Control, Production Planning (MRP).\n• Year 4 (Semesters 7-8): Facilities Planning & Layout, Discrete Event Simulation, Total Quality Management (TQM), Capstone Industrial Project.'
        },
        {
          id: 'ind-projects-portfolio',
          name: 'High-Impact Portfolio Projects',
          content: '1. Global Multi-Echelon Supply Chain Network Optimization in Python (PuLP): Modeled warehouse network minimizing freight costs and stockouts across 20 distribution hubs.\n2. Discrete Event Simulation of High-Speed Bottling Facility in Arena: Identified packaging machine bottlenecks and increased throughput by 22%.\n3. Assembly Line Balancing & Cellular Layout Re-engineering: Rebalanced manual workstation tasks, cutting cycle time by 18% and balancing efficiency from 68% to 91%.\n4. Dynamic Safety Stock Optimization Model under Lead-Time Variability: Built automated Monte Carlo inventory simulator reducing excess holding inventory by $1.2M.'
        },
        {
          id: 'ind-interview-questions',
          name: 'Top Industrial Engineering Technical Interview Questions',
          content: 'Q1: What is the Economic Order Quantity (EOQ) model, and what assumptions underlie it?\nA: EOQ is the mathematically optimal order quantity that minimizes the total annual cost of inventory management (the sum of annual order setup costs and annual inventory holding costs): Q* = √(2DS/H), where D is annual demand, S is fixed order cost, and H is annual holding cost per unit. Key assumptions: 1. Demand rate is constant and deterministic; 2. Lead time is fixed and known; 3. Entire order arrives in a single batch (instantaneous replenishment); 4. Unit purchase price is constant (no quantity discounts); 5. No shortages/stockouts are permitted. When inventory hits the Reorder Point (ROP = Demand rate × Lead time), a new order of size Q* is placed.\n\nQ2: What is Little’s Law, and how is it applied to factory line operations?\nA: Little’s Law is a fundamental theorem in queuing theory stating that in any stable system, the long-term average number of items in the system (L, Work-In-Progress WIP) equals the long-term average arrival rate (λ, Throughput rate) multiplied by the average time an item spends in the system (W, Cycle Time / Lead Time): L = λ * W. In a factory setting, if you want to reduce manufacturing lead time (W) without reducing output throughput (λ), you MUST strictly reduce the Work-In-Progress inventory (L) on the shop floor. This mathematical relationship is the fundamental bedrock of Lean manufacturing and Just-In-Time (JIT) production.\n\nQ3: Explain the Bullwhip Effect in supply chains and how it can be mitigated.\nA: The Bullwhip Effect describes the phenomenon where small fluctuations in consumer retail demand trigger progressively larger and more volatile swings in demand forecasts as orders move upstream through wholesalers, distributors, and raw material manufacturers. It is caused by: 1. Demand forecast updating based on customer orders rather than actual sales data; 2. Order batching (accumulating orders to achieve volume shipping discounts); 3. Price fluctuations and promotional discounts prompting artificial hoarding; 4. Rationing and shortage gaming. Mitigations include: sharing real-time point-of-sale (POS) data across all supply chain tiers, implementing Vendor-Managed Inventory (VMI), adopting smaller and more frequent batch deliveries, and establishing everyday low pricing (EDLP) to prevent erratic buying spikes.'
        }
      ]
    }
  ]
};

// Write updated catalog to file
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Successfully wrote catalog with', Object.keys(catalog).length, 'branches:');
console.log(Object.keys(catalog));
