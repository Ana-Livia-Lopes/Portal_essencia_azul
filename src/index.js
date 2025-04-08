const mysql = require("mysql");
const { Session, Property } = require("./tools");

var EssenciaAzul = ( function() {
    const BaseDataTypes = {
        Acolhido: class Acolhido {}
    }

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

    /**
     * @type {WeakMap<Login, string>}
     */
    const privateKeys = new WeakMap();

    const privateLoginConstructorIndicator = Symbol("Login.PrivateConstructorIndicator");

    class Login {
        constructor(session, email, password, constructorKey) {
            if (constructorKey !== privateLoginConstructorIndicator) throw new Error("Construtor privado");

            let key;// obtém o login no banco de dados.

            privateKeys.set(this, key);

            Property.set(this, "session", "freeze", "lock");
            Property.set(this, "email", "freeze", "lock");
            Property.set(this, "password", "freeze", "lock");
        }

        session;
        email;
        password;

        create(type, fields) {
            return create(privateKeys.get(this), type, fields);
        }

        read(type, search) {
            return read(privateKeys.get(this), type, search);
        }

        analytics(type, search) {
            return analytics(privateKeys.get(this), type, search);
        }

        update(type, id, fields, options) {
            return update(privateKeys.get(this), type, id, fields, options);
        }

        remove(type, id) {
            return remove(privateKeys.get(this), type, id);
        }
    }

    async function login(session, email, password) {
        if (!(session instanceof Session)) throw new Error("É necessário uma sessão no navegador para realizar login");
        let hasLogin = session.get("login");
        if (hasLogin && hasLogin instanceof Login) return hasLogin;

        /**
         * @todo testar no banco de dados.
         */
        let login = new Login(session, email, password, privateLoginConstructorIndicator);
        return login;
    }

    function isLogged(session) {
        if (!(session instanceof Session)) throw new Error("É necessário uma sessão no navegador para procurar por login");
        if (session.get("login") instanceof Session) return true; else return false;
    }
    
    function logout(session) {
        if (!(session instanceof Session)) throw new Error("É necessário uma sessão no navegador para realizar logout");
        let hasLogin = session.get("login");
        if (hasLogin && hasLogin instanceof Login) {
            session.delete("login");
            return true;
        } else {
            return false;
        }
    }

    async function validateKey(key) {
        // valida se a chave está correta e existe no banco de dados.
    }


    async function create(key, type, fields) {}

    async function read(key, type, search) {}

    async function analytics(key, type, search) {}

    async function update(key, type, id, fields, options) {}

    async function remove(key, type, id) {}


    return {
        connect,
        login,
        logout,
        isLogged,
        validateKey,
        create,
        read,
        analytics,
        update,
        remove,
        BaseDataTypes
    };
} )();

require("./tools/namespace.js")(EssenciaAzul, "EssenciaAzul");

module.exports = EssenciaAzul;