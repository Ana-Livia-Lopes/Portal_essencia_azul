const mysql = require("mysql");
const config = require("./config.json").mysql;

const storage = mysql.createConnection({
    database: config.database,
    user: config.username,
    password: config.password,
    host: config.hostname
});

module.exports = storage;