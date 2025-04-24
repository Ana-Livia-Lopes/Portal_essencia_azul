const mysql = require("mysql");
const { Session, Property } = require("./tools");
const { db } = require("../firebase.js");
const { addDoc, collection, Timestamp, getDoc, where, query, orderBy, limit, startAfter, getDocs } = require("firebase/firestore");

var EssenciaAzul = ( function() {
    const BaseDataTypes = {}
    BaseDataTypes.Acolhido = class Acolhido {
        nome;
        idade;
        responsaveis;
        ref_familia;
        nivel_suporte;
        escola;
        identificacoes;
        interesses;
        hiperfoco;
        como_acalma;
        atividades_nao_gosta;
        restricoes_alimentares;
        comida_favorita;
        convenio;
        terapias;
        ref_documentos;

        observacoes;
    }
    BaseDataTypes.Familia = class Familia {
        sobrenome;
        endereco;
        residentes;

        observacoes;
    }
    BaseDataTypes.Apoiador = class Apoiador {
        nome;
        id_logo;
        link;
    }
    BaseDataTypes.Voluntario = class Voluntario {
        nome;
        cpf;
        email;
        telefone;
        como_ajudar;
        por_que_ser_voluntario;
    }
    BaseDataTypes.Documento = class Documento {
        nome;
        descricao;
        id_arquivo;
    }
    BaseDataTypes.Imagem = class Imagem {
        titulo;
        descricao;
        grupos;
        id_conteudo;
    }
    BaseDataTypes.Evento = class Evento {
        titulo;
        descricao;
        data;
        id_imagem;
    }
    BaseDataTypes.Produto = class Produto {
        nome;
        descricao;
        preco;
        id_imagem;
        opcoes;
    }
    const Solicitacao = class Solicitacao {
        remetente;
    }
    BaseDataTypes.SolicitacaoAcolhido = class SolicitacaoAcolhido extends Solicitacao {
        acolhido;
    }
    BaseDataTypes.SolicitacaoVoluntario = class SolicitacaoVoluntario extends Solicitacao {
        voluntario;
    }
    BaseDataTypes.Admin = class Admin {
        nome;
        email;
        senha;
        nivel;
        chave;
    }
    BaseDataTypes.Alteracao = class Alteracao {
        ref_admin;
        acao;
        colecao;
        ref_documento;
        documento;
        documento_novo;
        documento_antigo;
    }

    const privateDBConstructorKey = Symbol("Database.PrivateConstructorKey");

    const _PrivateHiddenData = class PrivateHiddenData extends null {
        toString() { return `[Conteúdo Privado]` }
        valueOf() { return null }
    }

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
        methods = {};
    }

    class DatabaseAnalytics extends DatabaseInfo {
        aggregator;
    }

    const privateDocTypes = new WeakMap();
    const privateAnalyiticTypes = new WeakMap();

    const availableDatabases = [ "firestore", "mysql" ];

    const instanceRealFields = new WeakMap();
    const createdByKey = new WeakMap();

    const emitEventSymbol = Symbol("Type.EventEmitterKey");

    function createDatabaseDocumentType(basetype, collection, {
        references = {},
        methods = {},
        privateFields = [],
        database = "firestore",
        /** callbacks ({ action, fields, key, type }) => fields */
        fieldsFilters = [],
        actionsMinKeyLevel = {
            ["create"]: 1,
            ["read"]: 1,
            ["update"]: 1,
            ["remove"]: 1
        },
        events = {} // [action]: function | function[]
    } = {}) {
        if (!availableDatabases.includes(database)) throw new Error("Banco de dados não suportado");
        let doctype;
        let analytictype;

        privateFields = Object.freeze([...privateFields]);
        const referencesEntriesDescriptors = Object.entries(Object.getOwnPropertyDescriptors(references));
        const methodsEntriesDescriptors = Object.entries(Object.getOwnPropertyDescriptors(methods));
        const typeEvents = { ...events };

        function emitEvent(eventName, doc, key) {
            if (key !== emitEventSymbol) throw new TypeError("Função privada");
            const event = typeEvents[eventName]
            if (event) {
                if (typeof event === "function") event(doc);
                if (event instanceof Array) for (const listener of event) listener();
            }
        }

        doctype = class extends DatabaseDocument {
            constructor(creationKey, id, fields = {}, localKey) {
                super(localKey);
                this.id = id;
                this.fields = new basetype();
                createdByKey.set(this, creationKey);
                instanceRealFields.set(this, Object.freeze({ ...fields }));

                for (const [ key, value ] of Object.entries(fields)) {
                    if (privateFields.includes(key)) {
                        this.fields[key] = PrivateHiddenData();
                    } else {
                        this.fields[key] = value;
                    }
                }

                for (const [ key, descriptor ] of methodsEntriesDescriptors) {
                    if (typeof descriptor.value === "function") Property.assign(this.methods, key, "value", descriptor.value.bind(this));
                }

                for (const [ key, descriptor ] of referencesEntriesDescriptors) {
                    if (descriptor.get) Property.assign(this.references, key, "get", descriptor.get.bind(this));
                }
                Object.seal(this);
            }
            static name = `${basetype.name}Document`;
        }

        analytictype = class extends DatabaseAnalytics {
            static name = `${basetype.name}Analytics`;
        }

        fieldsFilters = Object.freeze([ ...fieldsFilters ]);
        function callFieldsFilters({ action, type, key, fields }) {
            for (const filter of fieldsFilters) {
                fields = filter({ action, type, key, fields });
            }
            return fields;
        }

        doctype._basetype = basetype;
        doctype.collection = collection;
        doctype._dbtype = database;
        doctype._eventEmitter = emitEvent;
        doctype._callFieldsFilter = callFieldsFilters;
        Property.set(doctype, "_basetype", "freeze", "hide", "lock");
        Property.set(doctype, "collection", "freeze", "hide", "lock");
        Property.set(doctype, "_dbtype", "freeze", "hide", "lock");
        Property.set(doctype, "_eventEmitter", "freeze", "hide", "lock");
        Property.set(doctype, "_callFieldsFilter", "freeze", "hide", "lock");

        doctype.prototype.collection = collection;
        Property.set(doctype.prototype, "collection", "freeze", "hide", "lock");

        doctype._analytictype = analytictype;
        Property.set(doctype, "_analytictype", "freeze", "hide", "lock");

        doctype["create.minKeyLevel"] = actionsMinKeyLevel.create ?? 1;
        doctype["read.minKeyLevel"] = actionsMinKeyLevel.read ?? 1;
        doctype["update.minKeyLevel"] = actionsMinKeyLevel.update ?? 1;
        doctype["remove.minKeyLevel"] = actionsMinKeyLevel.remove ?? 1;

        Property.set(doctype, "create.minKeyLevel", "freeze", "hide", "lock");
        Property.set(doctype, "read.minKeyLevel", "freeze", "hide", "lock");
        Property.set(doctype, "update.minKeyLevel", "freeze", "hide", "lock");
        Property.set(doctype, "remove.minKeyLevel", "freeze", "hide", "lock");

        privateDocTypes.set(basetype, doctype);
        privateAnalyiticTypes.set(basetype, analytictype);

        return doctype;
    }
    // tem que verificar na inicialização e ser alterado conforme admins são alterados.
    // validateKey() procura aqui, se n achar, busca no banco.
    // remove() vai tirar a chave dessa lista.
    // Map { key => level }
    /** @type {Map<string, number>} */
    const validKeysCache = new Map();

    const Types = {};

    Types.Acolhido = createDatabaseDocumentType(BaseDataTypes.Acolhido, "acolhidos", {
        references: {
            get familia() { },
            get documentos() { }
        },
        privateFields: [ "ref_familia", "ref_documentos" ],
        events: {
            // create: (doc) => console.log(doc),
            // read: (doc) => console.log(doc)
        },
        fieldsFilters: [
            ({ fields }) => { fields.manipulated = true; return fields; }
        ]
    });

    Types.Familia = createDatabaseDocumentType(BaseDataTypes.Familia, "familias", {
        references: {
            get acolhidos() { return createdByKey.get(this) },
        },
        methods: {
            count() {
                return {}
            }
        }
    });

    Types.Apoiador = createDatabaseDocumentType(BaseDataTypes.Apoiador, "apoiadores", {
        references: {
            get logo() {  }
        },
        privateFields: [ "id_logo" ]
    });
    Types.Voluntario = createDatabaseDocumentType(BaseDataTypes.Voluntario, "voluntarios");

    const MySQLTypes = {};
    const MySQLBaseStructure = class MySQLBaseStructure {
        id;
        conteudo;
    }
    const MySQLPrivateFields = [ "id" ];
    
    MySQLTypes.Documento = createDatabaseDocumentType(MySQLBaseStructure, "documentos", {
        database: "mysql",
        privateFields: MySQLPrivateFields
    });
    MySQLTypes.Imagem = createDatabaseDocumentType(MySQLBaseStructure, "imagens", {
        database: "mysql",
        privateFields: MySQLPrivateFields
    });

    Types.Documento = createDatabaseDocumentType(BaseDataTypes.Documento, "documentos", {
        references: {
            get arquivo() { }
        },
        privateFields: [ "id_arquivo" ]
    });
    Types.Imagem = createDatabaseDocumentType(BaseDataTypes.Imagem, "imagens", {
        references: {
            get conteudo() { }
        },
        privateFields: [ "id_conteudo" ]
    });
    Types.Evento = createDatabaseDocumentType(BaseDataTypes.Evento, "eventos", {
        references: {
            get imagem() { }
        },
        privateFields: [ "id_imagem" ]
    });
    Types.Produto = createDatabaseDocumentType(BaseDataTypes.Produto, "produtos", {
        references: {
            get imagem() { }
        },
        privateFields: [ "id_imagem" ]
    });

    Types.SolicitacaoAcolhido = createDatabaseDocumentType(BaseDataTypes.SolicitacaoAcolhido, "solicitacoes_acolhido");
    Types.SolicitacaoVoluntario = createDatabaseDocumentType(BaseDataTypes.SolicitacaoVoluntario, "solicitacoes_voluntario");

    Types.Admin = createDatabaseDocumentType(BaseDataTypes.Admin, "admins", {
        privateFields: [ "senha", "chave" ],
        events: {
            create(doc) {},
            remove(doc) {},
            update(doc) {}
        },
        references: {
            get alteracoes() { }
        },
        fieldsFilters: [
            ({ fields, key, action }) => {
                // filtrar a criação de valores de chave antes de update
                
                // nao pode definir nivel para nivel igual ao seu, somente menor, PermissionError.
                // nao pode definir chave, PermissionError.

                // setar chave randomica em create
            }
        ]
    });

    Types.Alteracao = createDatabaseDocumentType(BaseDataTypes.Alteracao, "alteracoes", {
        references: {
            get admin() { }
        },
        privateFields: [ "ref_admin" ]
    });

    const {
        Acolhido, Familia,
        Apoiador, Voluntario,
        Documento, Imagem, Evento, Produto,
        SolicitacaoAcolhido, SolicitacaoVoluntario,
        Admin, Alteracao
    } = Types;

    function registerAction() {}

    function storageConnect() {
        const config = require("../config.json").mysql;

        return mysql.createConnection({
            user: config.username,
            password: config.password,
            host: config.hostname,
            database: config.database
        });
    }

    async function validateKey(key) {
        // valida se a chave está correta e existe no banco de dados.
        if (validKeysCache.has(key)) return validKeysCache.get(key);
        return 3;
    }

    function arrayMapForDateToTimestamp(item) {
        if (item instanceof Date) {
            return Timestamp.fromDate(item);
        } else if (typeof item === "object" && item !== null) {
            if (item instanceof Array) return arrayMapForDateToTimestamp(item);
            return mapForDateToTimestamp(item);
        }
        return item;
    }
    function mapForDateToTimestamp(fields) {
        const outputObject = {};
        for (const [ key, value ] of Object.entries(fields)) {
            if (value instanceof Date) {
                outputObject[key] = Timestamp.fromDate(value);
            } else {
                if (typeof value === "object" && value !== null) {
                    if (Array.isArray(value)) {
                        outputObject[key] = value.map(arrayMapForDateToTimestamp);
                    } else {
                        outputObject[key] = mapForDateToTimestamp(value);
                    }
                } else {
                    outputObject[key] = value;
                }
            }
        }
    }

    function arrayMapForTimestampToDate(item) {
        if (item instanceof Timestamp) {
            return item.toDate();
        } else if (typeof item === "object" && item !== null) {
            if (item instanceof Array) return item.map(arrayMapForTimestampToDate);
            return mapForDateToTimestamp(item);
        }
        return item;
    }
    function mapForTimestampToDate(fields) {
        const outputObject = {};
        for (const [ key, value ] of Object.entries(fields)) {
            if (value instanceof Timestamp) {
                outputObject[key] = value.toDate();
            } else {
                if (typeof value === "object" && value !== null) {
                    if (Array.isArray(value)) {
                        outputObject[key] = value.map(arrayMapForTimestampToDate);
                    } else {
                        outputObject[key] = mapForTimestampToDate(value);
                    }
                } else {
                    outputObject[key] = value;
                }
            }
        }
        return outputObject;
    }

    async function create(key, type, fields) {
        let keylevel = await validateKey(key);
        if (keylevel <= 0) throw new Error("Permissão insuficiente para qualquer operação de administrador");

        type._callFieldsFilter({ action: "create", type, key, fields });

        if (keylevel < type["create.minKeyLevel"]) throw new Error(`Permissão insuficiente para criar documento de ${type._basetype.name}`);
        const dbtype = type._dbtype;

        let doc;

        switch (dbtype) {
            case "mysql":
                const storage = storageConnect();
                const sql = `INSERT INTO ${type.collection} (${Object.keys(fields).join(", ")}) VALUES (${Object.values(fields).map(() => "?").join(", ")})`;
                let values = { ...fields };
                delete values.id;
                values = Object.values(values).map(value => {
                    if (value instanceof Date) {
                        return value.toISOString().slice(0, 19).replace("T", " ");
                    } else {
                        return value;
                    }
                });
                const insertId = await new Promise((resolve, reject) => {
                    storage.query(sql, values, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });
                const docSnap = await new Promise((resolve, reject) => {
                    storage.query(`SELECT * FROM ${type.collection} WHERE id = ?`, [ insertId ], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results[0]);
                        }
                    });
                });
                storage.end();
                delete docSnap.id;
                doc = new type(createdByKey.get(this), insertId, docSnap, privateDBConstructorKey);

                break;
            case "firestore":
                const collRef = collection(db, type.collection);
        
                const sendingFields = mapForDateToTimestamp(fields);
                const docRef = await addDoc(collRef, sendingFields);
                doc = new type(createdByKey.get(this), docRef.id, (await getDoc(docRef)).data(), privateDBConstructorKey);
                break;
        }

        type._eventEmitter("create", doc, emitEventSymbol);

        return doc;
    }

    const validOrderDirections = [ "ASC", "DESC" ];



    async function read(key, type, search) {
        let keylevel = await validateKey(key);
        if (keylevel <= 0) throw new Error("Permissão insuficiente para qualquer operação de administrador");

        if (keylevel < type["read.minKeyLevel"]) throw new Error(`Permissão insuficiente para ler documentos de ${type._basetype.name}`);

        const dbtype = type._dbtype;
        let docs = [];

        switch (dbtype) {
            case "mysql":
                const storage = storageConnect();
                let sql = `SELECT${search?.distinct ? " DISTINCT" : ""} * FROM ${type.collection}`;
                const queryParameters = [];
                if (search?.conditions) {
                    const conditions = [];
                    for (const condition of search?.conditions) {
                        let field = condition.field;
                        let relation = condition.relation.toUpperCase();
                        let value = condition.value;
                        conditions.push(
                            `${field} ${relation} ${value instanceof Array ? "(?)" : "?"}`
                        );
                        queryParameters.push(value);
                    }
                    sql += ` WHERE ${conditions.join(" AND ")}`;
                }
                if (search?.orderBy) {
                    let orderDirection = search.orderDirection?.toUpperCase() ?? "ASC";
                    if (!validOrderDirections.includes(orderDirection)) throw new TypeError("Direção de ordenação inválida, use ASC ou DESC");
                    sql += ` ORDER BY ? ${orderDirection}`;
                    queryParameters.push(search.orderBy);
                }
                if (search?.limit) {
                    if (typeof search?.limit !== "number") throw new TypeError("O limite deve ser um número");
                    if (search?.limitOffset) {
                        if (typeof search?.limitOffset !== "number") throw new TypeError("O limite de offset deve ser um número");
                        sql += ` LIMIT ${search.limitOffset}, ${search.limit}`;
                    } else {
                        sql += ` LIMIT ${search.limit}`;
                    }
                }

                const rows = await new Promise((resolve, reject) => {
                    storage.query(sql, queryParameters, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });

                for (const row of rows) {
                    const fields = type._callFieldsFilter({ action: "read", type, key, fields: { ...row } });
                    delete fields.id;
                    let doc = new type(createdByKey.get(this), row.id, fields, privateDBConstructorKey);
                    docs.push(doc);
                }

                storage.end();

                break;
            case "firestore":
                const collRef = collection(db, type.collection);

                const constraints = [];

                if (search?.conditions) {
                    console.log("conditions");
                    for (const condition of search?.conditions) {
                        let field = condition.field;
                        let relation = condition.relation.toLowerCase();
                        let value = condition.value;

                        if (relation === "not in") constraints.push(where(field, "not-in", value));
                        constraints.push(where(field, relation, value));
                    }
                }
                if (search?.orderBy) {
                    console.log("orderBy");
                    let orderDirection = search.orderDirection?.toLowerCase() ?? "asc";
                    if (!validOrderDirections.includes(orderDirection)) throw new TypeError("Direção de ordenação inválida, use ASC ou DESC");
                    constraints.push(orderBy(search.orderBy, orderDirection));
                }
                if (search?.limit) {
                    constraints.push(limit(search.limit));
                    console.log("limit");
                }
                if (search?.limitOffset) {
                    console.log("offset");
                    constraints.push(startAfter(search.limitOffset));
                }

                (await getDocs(query(collRef, ...constraints))).forEach(doc => {
                    const fields = type._callFieldsFilter({ fields: mapForTimestampToDate({ ...doc.data() }), action: "read", type, key });
                    delete fields.id;
                    docs.push(new type(createdByKey.get(this), doc.id, fields, privateDBConstructorKey));
                });

                break;
        }

        type._eventEmitter("read", docs, emitEventSymbol);

        return docs;
    }

    async function analytics(key, type, search) {}

    async function updateAdminKeyValidation(key, id) {
        // faz um read no id e verifica se o id do admin é menor que o da chave atual.
    }

    async function update(key, type, id, fields, options) {
        let keylevel = await validateKey(key);
        if (keylevel === 0) throw new Error("Permissão insuficiente para qualquer operação de administrador");
        // verificação especial se o tipo for admin, já que admin1 pode apenas SE editar.
        if (type === Admin) keylevel = await updateAdminKeyValidation(key, id);

        if (keylevel < type["update.minKeyLevel"]) throw new Error(`Permissão insuficiente para atualizar documentos de ${type._basetype.name}`);

        switch (type._dbtype) {
            case "mysql":
                
                break;
            
            case "firestore":
                const collRef = collection(db, type.collection);

                
                break;
        }
    }

    async function remove(key, type, id) {}

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
        BaseDataTypes,
        ...Types
    };
} )();

require("./tools/namespace.js")(EssenciaAzul, "EssenciaAzul");

module.exports = EssenciaAzul;