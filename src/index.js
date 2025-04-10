const mysql = require("mysql");
const { Session, Property } = require("./tools");

var EssenciaAzul = ( function() {
    const BaseDataTypes = {
        Acolhido: class Acolhido {
            nome;
            idade;
            email;
            telefone;
            nome_responsaveis;
            ref_familia;
            nivel_suporte;
            escola;
            identificacao;
            interesses;
            hiperfoco;
            como_acalma;
            atividades_nao_gosta;
            restricoes_alimentares;
            comida_favorita;
            convenio;
            terapias;

            observacoes;
        },
        Residente: class Residente {
            nome;
            tipo;
            ref_familia;
        },
        Familia: class Familia {
            sobrenome;
            endereco;

            observacoes;
        }
    }

    const privateDBConstructorKey = Symbol("Database.PrivateConstructorKey");

    const _PrivateHiddenData = class PrivateHiddenData extends null {}

    function PrivateHiddenData() {
        if (new.target) return PrivateHiddenData();
        return Object.create(_PrivateHiddenData);
    }

    class DatabaseInfo {
        constructor(key) {
            if (key !== privateDBConstructorKey) throw new Error("Construtor privado");
        }

        fields;
    }

    class DatabaseDocument extends DatabaseInfo {
        id;
        references = {};
    }

    class DatabaseAnalytics extends DatabaseInfo {
        aggregator;
    }

    const privateDocTypes = new WeakMap();
    const privateAnalyiticTypes = new WeakMap();

    // MYSQL
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

    // FIRESTORE
    async function validateKey(key) {
        // valida se a chave está correta e existe no banco de dados.
    }


    async function create(key, type, fields) {}

    async function read(key, type, search) {}

    async function analytics(key, type, search) {}

    async function update(key, type, id, fields, options) {}

    async function remove(key, type, id) {}


    const availableDatabases = [ "firestore", "mysql" ];

    const createdByKey = new WeakMap();

    function createDatabaseDocumentType(basetype, collection, {
        references = {},
        privateFields = [],
        database = "firestore"
    } = {}) {
        if (!availableDatabases.includes(database)) throw new Error("Banco de dados não suportado");
        let doctype;
        let analytictype;

        const allowedfields = Object.keys(new basetype);
        privateFields = Object.freeze([...privateFields]);
        const referencesEntriesDescriptors = Object.entries(Object.getOwnPropertyDescriptors(references));

        switch (database) {
            case "firestore":
                doctype = class extends DatabaseDocument {
                    constructor(creationKey, id, fields = {}, localKey) {
                        super(localKey);
                        validateKey(creationKey);
                        this.id = id;
                        this.fields = new basetype();
                        createdByKey.set(this, creationKey);

                        for (const [key, value] of Object.entries(fields)) {
                            if (allowedfields.includes(key)) {
                                if (privateFields.includes(key)) {
                                    this.fields[key] = PrivateHiddenData();
                                } else {
                                    this.fields[key] = value;
                                }
                            }
                        }

                        for (const [ key, descriptor ] of referencesEntriesDescriptors) {
                            if (descriptor.get) Property.assign(this.references, key, "get", descriptor.get.bind(this))
                        }
                    }
                    static name = `${basetype.name}Document`;
                }

                analytictype = class extends DatabaseAnalytics {}
                analytictype.name = `${basetype.name}Analytics`;
                break;


            case "mysql":
                doctype = class extends DatabaseDocument {}
                doctype.name = `${basetype.name}Document`;
                break;


            default:
                break;
        }

        doctype.prototype.collection = collection;
        doctype.prototype._dbtype = database;
        Property.set(doctype.prototype, "collection", "freeze", "lock");
        Property.set(doctype.prototype, "_dbtype", "freeze", "lock");
        if (analytictype) {
            Property.set(analytictype.prototype, "_dbtype", "freeze", "lock");
            analytictype.prototype._dbtype = database;
        }

        doctype._analyticType = analytictype;

        return doctype;
    }

    const Types = {
        Acolhido: undefined,
        Residente: undefined,
        Familia: undefined,

    };

    Types.Acolhido = createDatabaseDocumentType(BaseDataTypes.Acolhido, "acolhidos", {
        references: {
            get familia() { return new Types.Familia(createdByKey.get(this), 1, {  }, privateDBConstructorKey) }
        },
        privateFields: ["email"]
    });

    Types.Residente = createDatabaseDocumentType(BaseDataTypes.Residente, "residentes")

    Types.Familia = createDatabaseDocumentType(BaseDataTypes.Familia, "familias", {
        references: {
            get acolhidos() {  },
            get residentes() {  }
        }
    });

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


    return {
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