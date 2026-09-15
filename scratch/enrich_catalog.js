const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'data', 'branch_learning_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Add MECH
catalog.MECH = {
    branchCode: "MECH",
    branchName: "Mechanical Engineering",
    specializationTitle: "Mechanical Systems, Thermodynamics & Advanced Manufacturing",
    specializationTagline: "Thermodynamic cycles, fluid mechanics, finite element analysis (FEA), robotics, and precision manufacturing.",
    badge: "MECHANICAL SPECIALIZATION",
    icon: "precision_manufacturing",
    accentColor: "#E11D48",
    topicsCount: 20,
    overview: "Mechanical Engineering encompasses the physics, design, thermal dynamics, and manufacturing of mechanical and electromechanical machinery. From fluid power and aerospace turbines to robotics and additive fabrication, this curriculum builds core engineering competence.",
    modules: [
        {
            id: "mech-mod-1",
            title: "Module 1: Engineering Thermodynamics & Heat Transfer",
            badge: "Thermal Physics",
            topics: [
                {
                    id: "laws-of-thermodynamics",
                    name: "Laws of Thermodynamics & Enthalpy Balances",
                    content: "The Zeroth, First, Second, and Third laws govern all energy transformations. The First Law establishes energy conservation (dQ = dU + dW), while the Second Law introduces entropy (dS >= dQ/T), defining limits on heat engine efficiency via the Carnot theorem."
                },
                {
                    id: "steam-rankine-cycle",
                    name: "Steam Power & Modified Rankine Cycles",
                    content: "Steam power plants utilize the ideal Rankine cycle involving constant-pressure boiling, isentropic expansion in steam turbines, isobaric condensation, and isentropic pumping. Modern efficiency is boosted via reheating and regenerative feed heating."
                },
                {
                    id: "air-standard-cycles",
                    name: "Air Standard Cycles: Otto, Diesel & Dual",
                    content: "Internal combustion engines are thermodynamically modeled through air-standard approximations. The Otto cycle features isochoric heat addition, the Diesel cycle uses isobaric heat addition, and the Dual cycle combines both."
                },
                {
                    id: "heat-transfer-modes",
                    name: "Conduction, Convection & Radiation Mechanisms",
                    content: "Heat transfer analysis applies Fourier's Law for conduction (q = -k A dT/dx), Newton's Law of Cooling for convection (q = h A (Ts - Tinf)), and the Stefan-Boltzmann Law for blackbody radiation (E = sigma T^4)."
                }
            ]
        },
        {
            id: "mech-mod-2",
            title: "Module 2: Fluid Mechanics & Hydraulic Machinery",
            badge: "Fluid Dynamics",
            topics: [
                {
                    id: "fluid-statics-bernoulli",
                    name: "Fluid Statics & Bernoulli Energy Conservation",
                    content: "Fluid statics calculates hydrostatic pressures (p = rho g h) and buoyancy via Archimedes principle. For inviscid, incompressible streamline flow, the Bernoulli equation preserves mechanical energy: P + 0.5 rho v^2 + rho g z = Constant."
                },
                {
                    id: "viscous-pipe-flow",
                    name: "Laminar vs Turbulent Pipe Flow & Head Loss",
                    content: "Flow classification uses the Reynolds number (Re = rho v D / mu). Laminar flow (Re < 2000) follows the Hagen-Poiseuille parabolic profile. Turbulent flow (Re > 4000) produces chaotic mixing and is modeled with the Darcy-Weisbach friction factor."
                },
                {
                    id: "turbomachinery-pumps",
                    name: "Centrifugal Pumps & Pelton/Francis Turbines",
                    content: "Centrifugal pumps convert shaft torque into static fluid head via impeller centrifugal acceleration. In hydraulic power, impulse Pelton wheels utilize high-velocity water jets, while Francis reaction turbines convert pressure and kinetic head into shaft power."
                },
                {
                    id: "boundary-layer-aerodynamics",
                    name: "Boundary Layer Theory & Aerodynamic Drag",
                    content: "Prandtl boundary layer theory analyzes viscous wall shear stress. Fluid decelerates from free-stream velocity to zero at the solid boundary. Adverse pressure gradients trigger boundary layer separation, generating form drag and stall."
                }
            ]
        },
        {
            id: "mech-mod-3",
            title: "Module 3: Mechanics of Materials & Machine Design",
            badge: "Solid Mechanics",
            topics: [
                {
                    id: "stress-strain-mohr",
                    name: "Stress-Strain Tensors & Mohr's Circle",
                    content: "Multiaxial stress fields decompose into normal and shear components. Mohr's circle provides graphical transformation for principal stresses (sigma1, sigma2) and maximum shear stress (tau_max). Essential for identifying failure planes."
                },
                {
                    id: "failure-theories-fatigue",
                    name: "Failure Theories: Von Mises, Tresca & S-N Curves",
                    content: "Ductile metals yield when distortion energy reaches threshold (Von Mises criterion). Under cyclic dynamic loading, fatigue failure occurs below yield strength, governed by the Wöhler S-N curve and Goodman endurance limits."
                },
                {
                    id: "machine-element-shafts-gears",
                    name: "Design of Shafts, Spur Gears & Bearing Selection",
                    content: "Shaft design balances torsional shear (T*r/J) and bending moments (M*y/I) under ASME fatigue design codes. Involute spur gears are dimensioned based on Lewis bending equations and surface compressive pitting resistance."
                },
                {
                    id: "vibration-damping-systems",
                    name: "Mechanical Vibrations & Dynamic Resonance",
                    content: "Single-degree-of-freedom oscillators are modeled by m*x'' + c*x' + k*x = F(t). The undamped natural frequency is omega_n = sqrt(k/m). When excitation matches natural frequency, resonance produces dangerous displacement amplitudes without damping."
                }
            ]
        },
        {
            id: "mech-mod-4",
            title: "Module 4: Advanced Manufacturing & CAD/CAM",
            badge: "Manufacturing Systems",
            topics: [
                {
                    id: "cnc-machining-gcode",
                    name: "CNC Machining, Toolpath Generation & G-Codes",
                    content: "Subtractive manufacturing utilizes computer numerical control (CNC) mills and lathes. Toolpaths execute standardized ISO G-codes (G00 rapid move, G01 linear interpolation, G02/G03 circular arc) and M-codes for spindle and coolant activation."
                },
                {
                    id: "additive-manufacturing",
                    name: "Additive Manufacturing (3D Printing) & Slicing",
                    content: "Fused deposition modeling (FDM), stereolithography (SLA), and selective laser sintering (SLS) build parts layer-by-layer from 3D CAD meshes. Toolpaths are parameterized by infill density, layer height, and thermal laser energy density."
                },
                {
                    id: "metrology-gd-and-t",
                    name: "Geometric Dimensioning & Tolerancing (GD&T)",
                    content: "ASME Y14.5 defines geometric controls including flatness, cylindricity, perpendicularity, parallelism, and true position. Coordinate measuring machines (CMM) verify manufactured deviations within specified datum reference frames."
                },
                {
                    id: "fea-solid-modeling",
                    name: "Finite Element Analysis (FEA) & Mesh Convergence",
                    content: "FEA discretizes continuous structures into finite tetrahedral or hexahedral elements. Stiffness equations [K]{u} = {F} are solved numerically to determine nodal displacements, strains, and stress concentrations (stress hotspots)."
                }
            ]
        },
        {
            id: "mech-mod-5",
            title: "Module 5: Mechanical Capstones & Career Roadmap",
            badge: "Projects & Career",
            topics: [
                {
                    id: "mech-capstone-projects",
                    name: "Industry Grade Mechanical Capstone Projects",
                    content: "1. Automated 4-DOF Robotic Manipulator: Kinematic design, harmonic gearboxes, stepper control, and ROS integration.\n2. Regenerative Shell-and-Tube Heat Exchanger: CFD thermo-hydraulic analysis in ANSYS Fluent to maximize heat transfer coefficient.\n3. Electric Two-Wheeler Chassis FEA: Lightweight tubular trellis frame optimization for torsional stiffness and crash absorption.\n4. Automated Solar Tracking Mechanism: Dual-axis sun tracking servo drive yielding 32% efficiency improvement over static panels."
                },
                {
                    id: "mech-target-roles",
                    name: "Target High-Growth Mechanical Engineering Roles",
                    content: "1. CAD/CAM Product Design Engineer: Automotive OEMs, aerospace assemblies, and consumer robotics ($75k-$120k).\n2. Thermal Systems & CFD Specialist: Battery thermal management, data center cooling, and gas turbine blades ($85k-$135k).\n3. Finite Element Analysis (FEA) Stress Analyst: Structural integrity certification, dynamic impact simulation, and fatigue testing ($80k-$130k).\n4. Robotics & Automation Systems Engineer: Industrial assembly lines, automated guided vehicles, and PLC automation ($85k-$140k)."
                },
                {
                    id: "mech-core-skills",
                    name: "Essential Technical Skills & Tool Mastery",
                    content: "Core CAD/CAE Software: SolidWorks, CATIA V5, Autodesk Inventor, Siemens NX.\nSimulation & Analysis: ANSYS Mechanical, ANSYS Fluent, Abaqus, MATLAB / Simulink.\nManufacturing: Mastercam, G-code manual programming, 3D printing slicing (Cura), GD&T compliance.\nInstrumentation: Strain gauges, thermocouples, load cells, LabVIEW data acquisition."
                },
                {
                    id: "mech-technical-interviews",
                    name: "Top Mechanical Engineering Technical Interview Bank",
                    content: "Q1: Explain the difference between engineering stress and true stress in tensile testing.\nAns: Engineering stress divides applied load by original cross-sectional area (A0), whereas true stress divides instantaneous load by the actual instantaneous cross-sectional area (A) as the specimen necks.\n\nQ2: How does the Von Mises yield criterion determine failure under multiaxial load?\nAns: It states that yielding begins when the second invariant of the deviatoric stress tensor reaches a critical value—equivalent to the distortion strain energy in the material reaching the distortion energy at yield in simple tension.\n\nQ3: What causes cavitation in centrifugal pumps and how do you prevent it?\nAns: Cavitation occurs when static pressure inside the pump impeller drops below the liquid's vapor pressure, forming vapor bubbles that violently collapse against the impeller blade, causing pitting. Prevent by ensuring Net Positive Suction Head Available (NPSHA) exceeds NPSH Required (NPSHR).\n\nQ4: What is the significance of the endurance limit on an S-N curve?\nAns: The endurance limit is the stress amplitude below which a ferrous material can withstand an infinite number of cyclic stress reversals without suffering fatigue failure."
                }
            ]
        }
    ]
};

// Add CIVIL
catalog.CIVIL = {
    branchCode: "CIVIL",
    branchName: "Civil Engineering",
    specializationTitle: "Structural Mechanics, Smart Infrastructure & Geotechnical Design",
    specializationTagline: "Finite element structural analysis, reinforced concrete (RCC), geotechnical foundations, and transportation hydraulics.",
    badge: "CIVIL SPECIALIZATION",
    icon: "architecture",
    accentColor: "#059669",
    topicsCount: 20,
    overview: "Civil Engineering shapes the modern built environment. From high-rise structural mechanics and earthquake-resilient concrete design to soil mechanics and smart transportation systems, this curriculum provides core engineering rigor.",
    modules: [
        {
            id: "civ-mod-1",
            title: "Module 1: Structural Analysis & Mechanics of Solids",
            badge: "Structural Mechanics",
            topics: [
                {
                    id: "determinate-indeterminate-structures",
                    name: "Determinate vs Indeterminate Trusses & Frames",
                    content: "Determinate structures satisfy static equilibrium equations alone (Sigma Fx = 0, Fy = 0, M = 0). Indeterminate structures require compatibility conditions of deformation. Degree of static and kinematic indeterminacy dictates analysis approach."
                },
                {
                    id: "moment-distribution-method",
                    name: "Moment Distribution & Slope Deflection Methods",
                    content: "Hardy Cross moment distribution method iteratively balances fixed-end moments at continuous beam joints based on rotational stiffness factors (4EI/L or 3EI/L) and carry-over factors (0.5). Enables rapid multi-span beam analysis."
                },
                {
                    id: "matrix-stiffness-method",
                    name: "Direct Stiffness Matrix Method for Structures",
                    content: "Modern structural software (STAAD.Pro, ETABS) employs matrix displacement methods. Element stiffness matrices [k] assemble into global structure stiffness [K]. The equilibrium system [K]{Delta} = {P} is solved for joint displacements."
                },
                {
                    id: "influence-line-diagrams",
                    name: "Influence Line Diagrams (ILD) for Moving Loads",
                    content: "ILDs track bending moment, shear force, or axial reaction at a specific cross-section as a unit concentrated load traverses a bridge deck. Müller-Breslau principle enables qualitative ILD construction."
                }
            ]
        },
        {
            id: "civ-mod-2",
            title: "Module 2: Concrete Technology & RCC Design",
            badge: "Concrete Design",
            topics: [
                {
                    id: "cement-hydration-mix-design",
                    name: "Cement Chemistry, Hydration & IS 10262 Mix Design",
                    content: "Portland cement hydration forms calcium silicate hydrate (C-S-H) gel, providing compressive strength. Mix proportioning according to IS 10262 specifies target mean strength, water-cement ratio, aggregate grading, and superplasticizer dosage."
                },
                {
                    id: "limit-state-design-rcc",
                    name: "Limit State Method: Flexure, Shear & Torsion",
                    content: "Limit state design balances Limit State of Collapse (ultimate load capacity) and Limit State of Serviceability (deflection and crack width). In flexure, parabolic-rectangular concrete stress block is balanced by yield steel tension."
                },
                {
                    id: "rcc-columns-footings",
                    name: "Design of Columns, Slender Walls & Isolated Footings",
                    content: "Compression members carry axial load and bending moments. Slenderness ratio (Leff/r) triggers lateral buckling considerations. Shallow spread footings are sized for allowable soil bearing capacity and checked for two-way punching shear."
                },
                {
                    id: "prestressed-concrete-basics",
                    name: "Prestressed Concrete: Pre-tensioning & Post-tensioning",
                    content: "Prestressed concrete introduces compressive pre-stress into tensile concrete zones using high-tensile steel tendons before service loads occur. Mitigates tensile cracks and enables long-span bridge girders."
                }
            ]
        },
        {
            id: "civ-mod-3",
            title: "Module 3: Geotechnical Engineering & Soil Mechanics",
            badge: "Soil Mechanics",
            topics: [
                {
                    id: "soil-classification-phase",
                    name: "Soil Phase Relations & Unified Soil Classification (USCS)",
                    content: "Three-phase soil systems relate solid grains, pore water, and pore air. Key metrics include void ratio (e), porosity (n), degree of saturation (S), and water content (w). USCS classifies soils based on liquid limit, plastic limit, and sieve grading."
                },
                {
                    id: "darcy-permeability-seepage",
                    name: "Permeability, Seepage Velocity & Flow Nets",
                    content: "Darcy's Law models fluid seepage through porous media: v = k * i. Laplace equations govern 2D steady seepage beneath dams. Orthogonal flow nets (equipotential lines and flow channels) calculate seepage discharge and uplift pressures."
                },
                {
                    id: "mohr-coulomb-shear-strength",
                    name: "Mohr-Coulomb Shear Strength & Triaxial Testing",
                    content: "Soil shear strength is defined by tau = c + sigma_n * tan(phi), where c is cohesion and phi is angle of internal friction. Consolidated-undrained (CU) and consolidated-drained (CD) triaxial tests determine effective stress parameters."
                },
                {
                    id: "terzaghi-bearing-capacity",
                    name: "Terzaghi Bearing Capacity & Settlement Analysis",
                    content: "Ultimate bearing capacity of shallow foundations follows Terzaghi: q_ult = c*Nc + q*Nq + 0.5*gamma*B*Ngamma. Immediate elastic settlement and primary consolidation settlement under clay layers dictate allowable limits."
                }
            ]
        },
        {
            id: "civ-mod-4",
            title: "Module 4: Transportation & Water Resources Engineering",
            badge: "Infrastructure",
            topics: [
                {
                    id: "highway-geometric-design",
                    name: "Highway Geometric Design, Superelevation & Sight Distance",
                    content: "Road alignments specify stopping sight distance (SSD) and overtaking sight distance (OSD). Horizontal curves incorporate superelevation (e = v^2 / 225R) to counteract centrifugal force, integrated with transition spiral curves."
                },
                {
                    id: "pavement-design-cbr",
                    name: "Flexible vs Rigid Pavement Design (IRC 37 & CBR)",
                    content: "Flexible pavements distribute traffic wheel loads across granular base and subbase layers down to subgrade soil, parameterized by California Bearing Ratio (CBR) values. Rigid pavements rely on concrete slab flexural beam action."
                },
                {
                    id: "open-channel-hydraulics",
                    name: "Open Channel Flow: Manning's Equation & Hydraulic Jump",
                    content: "Gravity flow in open canals follows Manning's uniform equation: V = (1/n) * R^(2/3) * S^(1/2). Froude number (Fr = v / sqrt(g*y)) distinguishes subcritical (Fr < 1) and supercritical (Fr > 1) flow. Hydraulic jumps dissipate destructive kinetic energy."
                },
                {
                    id: "hydrology-flood-routing",
                    name: "Hydrograph Analysis, Unit Hydrographs & Flood Routing",
                    content: "Rainfall-runoff modeling applies unit hydrograph theory to convert net precipitation into stream discharge. Muskingum flood routing tracks wave translation and channel storage attenuation downstream."
                }
            ]
        },
        {
            id: "civ-mod-5",
            title: "Module 5: Civil Engineering Capstones & Career Roadmap",
            badge: "Projects & Career",
            topics: [
                {
                    id: "civil-capstone-projects",
                    name: "High-Impact Civil Engineering Capstone Projects",
                    content: "1. Seismic Vulnerability Assessment of Multi-Story Framed Building: Non-linear pushover analysis in ETABS according to IS 1893 seismic codes.\n2. Smart Urban Stormwater Drainage Network: Modeling 50-year storm flood volumes using EPA SWMM software.\n3. Prestressed I-Girder Highway Overpass Bridge: Complete flexural prestressing design, cable profile layout, and tendon loss calculation.\n4. Deep Foundation Pile Group Design: Settlement and lateral pile capacity analysis in liquefiable seismic soils."
                },
                {
                    id: "civil-target-roles",
                    name: "Target Civil & Structural Engineering Roles",
                    content: "1. Structural Design Engineer: EPC consultancies, bridge design, and high-rise commercial framing ($70k-$115k).\n2. Geotechnical & Foundation Engineer: Subsurface investigations, slope stability, and dam embankments ($75k-$120k).\n3. Transportation & Highway Engineer: Expressway geometric planning, traffic simulation, and mass transit ($70k-$110k).\n4. BIM & Construction Project Manager: 4D BIM modeling, Primavera scheduling, and cost engineering ($80k-$130k)."
                },
                {
                    id: "civil-core-skills",
                    name: "Essential Civil Engineering Software & Field Standards",
                    content: "Structural Modeling: ETABS, STAAD.Pro, SAP2000, SAFE, Tekla Structures.\nGeotechnical: GeoStudio, PLAXIS, Rocscience.\nDrafting & BIM: AutoCAD Civil 3D, Revit Structure, Navisworks.\nCodes & Standards: IS 456 (RCC), IS 800 (Steel), IS 1893 (Earthquake), IRC 37 (Highways)."
                },
                {
                    id: "civil-technical-interviews",
                    name: "Top Civil Engineering Technical Interview Bank",
                    content: "Q1: What is the purpose of providing shear reinforcement in RCC beams?\nAns: Concrete has low tensile strength and fails diagonally under shear due to principal diagonal tension. Vertical stirrups or bent-up bars resist this diagonal tension and prevent sudden brittle shear failure.\n\nQ2: What is the difference between shallow and deep foundations?\nAns: Terzaghi defines shallow foundations as those where depth of embedment (Df) is less than or equal to width (B). Deep foundations (piles, caissons) have Df >> B and transfer loads to deep competent rock or soil strata via skin friction and end bearing.\n\nQ3: Explain the concept of balanced, under-reinforced, and over-reinforced RCC sections.\nAns: In a balanced section, steel yields at the exact moment concrete reaches its ultimate compressive strain (0.0035). Under-reinforced sections have less steel than balanced; steel yields first, giving ample warning before failure (ductile). Over-reinforced sections fail suddenly in concrete compression without warning (brittle and prohibited in design codes).\n\nQ4: What is superelevation and why is it necessary on horizontal curves?\nAns: Superelevation is the transverse inward tilting of the outer edge of a road above the inner edge. It counteracts centrifugal force acting outwards on turning vehicles, preventing skidding and overturning."
                }
            ]
        }
    ]
};

// Write back updated catalog
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('✅ Updated branch_learning_catalog.json with MECH and CIVIL!');
console.log('Available catalog keys:', Object.keys(catalog));
