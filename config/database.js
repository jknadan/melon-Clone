const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: '13.125.151.205',
    user: 'jknadan',
    port: '3306',
    password: '0000',
    database: 'study_db'
});

module.exports = {
    pool: pool
};
