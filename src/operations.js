const mysql = require("mysql");

var Operations = ( function() {
    function connect() {
        delete require.cache[require.resolve("../config.json")];
        const config = require("../config.json").database;

        return mysql.createConnection({
            user: config.username,
            password: config.password,
            host: config.hostname,
            database: config.database
        });
    }

    function login(session, username, password) {}

    function isLogged(session) {}

    return {
        connect,
        login
    };
} )();

require("./tools/namespace.js")(Operations, "Operations");

module.exports = Operations;