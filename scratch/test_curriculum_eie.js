const db = require('../curriculum_database.js');
const eieSubjects = db.CurriculumDatabase.getSubjects({ branch: 'EIE', semester: 4 });
console.log('EIE Subjects (Sem 4):');
eieSubjects.forEach(s => console.log(' -', s.title));
