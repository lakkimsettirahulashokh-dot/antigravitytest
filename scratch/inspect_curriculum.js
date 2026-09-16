const db = require('../curriculum_database.js');
console.log('CURRICULUM_CATALOG Branches:');
if (db.CURRICULUM_CATALOG) {
    console.log(Object.keys(db.CURRICULUM_CATALOG));
} else {
    console.log('No CURRICULUM_CATALOG exported');
}
