const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: '3.37.158.157',
    user: 'jknadan',
    port: '3306',
    password: 'wnsrl159@',
    database: 'jknadandb'
});

module.exports = {
    pool: pool
};