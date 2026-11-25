// การเชื่อมต่อ PostgreSQL แบบ pool (ใช้การเชื่อมต่อซ้ำได้ ไม่ต้องเปิดใหม่ทุกครั้ง)
const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({ connectionString: config.databaseUrl });

module.exports = pool;
