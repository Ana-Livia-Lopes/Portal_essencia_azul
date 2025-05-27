const { Session, NotFoundError, PermissionError, ServiceError, ImplementationError } = require("./server/")
const { Property } = require("./util");
const { db } = require("../firebase.js");
const { addDoc, collection, Timestamp, getDoc, where, query, orderBy, limit, startAfter, getDocs, updateDoc, doc, setDoc, deleteDoc, onSnapshot, DocumentReference, FieldValue } = require("firebase/firestore");
const crypto = require("crypto");
const { ClientError, ServerError } = require("./server/errors.js");
const supabase = require( "../supabase.js" );

var EssenciaAzul = ( function() {
    const BaseDataTypes = {}
    BaseDataTypes.Acolhido = class Acolhido {
        nome;
        data_nascimento;
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
        urL_imagem;

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
        url_logo;
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
        url_arquivo;
    }
    BaseDataTypes.Imagem = class Imagem {
        titulo;
        descricao;
        grupos;
        url_conteudo;
    }
    BaseDataTypes.Evento = class Evento {
        titulo;
        descricao;
        data;
        url_imagem;
    }
    BaseDataTypes.Produto = class Produto {
        nome;
        descricao;
        preco;
        url_imagem;
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
    BaseDataTypes.Comentario = class Comentario {
        nome;
        email;
        mensagem;
    }
    BaseDataTypes.Admin = class Admin {
        nome;
        email;
        senha;
        nivel;
        chave;
        urL_imagem;
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

    /**
     * @type {WeakMap<Login, string>}
     */
    const privateKeys = new WeakMap();

    const privateDBConstructorKey = Symbol("Database.PrivateConstructorKey");

    const _PrivateHiddenData = class PrivateHiddenData extends null {
        toString() { return `[Conteúdo Privado]` }
        valueOf() { return null }
    }

    function PrivateHiddenData() {
        if (new.target) return PrivateHiddenData();
        return Object.create(_PrivateHiddenData);
    }

    async function saveInStorage(bucket, collection, blob, response) {
        if (!(blob instanceof Blob)) throw new ClientError(response, "Blob não é do tipo Blob");
        const path = `${collection}/${crypto.randomBytes(8).toString("hex")}`;
        const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.contentType });
        if (error) throw ServiceError(response, error.message);
        return path;
    }

    async function readInStorage(bucket, url, response) {
        return supabase.storage.from(bucket).getPublicUrl(url).data.publicUrl;
    }

    async function updateInStorage(bucket, url, blob, response, collection) {
        if (!url) return await saveInStorage(bucket, collection, blob, response);
        if (!(blob instanceof Blob)) throw new ClientError(response, "Blob não é do tipo Blob");
        const { error } = await supabase.storage.from(bucket).update(url, blob, { contentType: blob.contentType });
        if (error) throw ServiceError(response, error.message);
    }

    async function removeInStorage(bucket, url, response) {
        const { error } = await supabase.storage.from(bucket).remove([ url ]);
        if (error) throw ServiceError(response, error.message);
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

    const privateDocTypes = new WeakMap();

    const instanceRealFields = new WeakMap();
    const createdByKey = new WeakMap();

    const emitEventSymbol = Symbol("Type.EventEmitterKey");

    class PublicDocs extends Map {
        constructor(collection, type) {
            super();
            this.collection = collection;
            this.type = type;
            this.init();
            PublicDocs.instances.add(this);
        }

        static instances = new Set();

        collection;
        type;
        _init = false;
        _unsubscribe;

        async init() {
            if (this._init) return;
            this._init = true;
            const collRef = collection(db, this.collection);
            const docs = (await getDocs(collRef));
            for (const doc of docs.docs) {
                const fields = mapForTimestampToDate({ ...doc.data() });
                delete fields.id;
                this.set(doc.id, new this.type(Symbol.for("PublicTypesRead"), doc.id, fields, privateDBConstructorKey));
            }
            this.createConnection();
        }

        createConnection() {
            const collRef = collection(db, this.collection);
            this._unsubscribe = onSnapshot(collRef, snapshot => {
                snapshot.docChanges().forEach(change => {
                    const doc = change.doc;
                    const fields = mapForTimestampToDate({ ...doc.data() });
                    delete fields.id;
                    if (change.type === "added" || change.type === "modified") {
                        this.set(doc.id, new this.type(Symbol.for("PublicTypesRead"), doc.id, fields, privateDBConstructorKey));
                    } else if (change.type === "removed") {
                        this.delete(doc.id);
                    }
                });
            });
        }
    }

    function createDatabaseDocumentType(basetype, collection, {
        references = {},
        methods = {},
        privateFields = [],
        bucket,
        /** callbacks ({ action, fields, key, type }) => fields */
        fieldsFilters = [],
        actionsMinKeyLevel = {
            ["create"]: 1,
            ["read"]: 1,
            ["update"]: 1,
            ["remove"]: 1
        },
        events = {}, // [action]: function | function[]
        allowOverSet = true,
        public = false
    } = {}) {
        let doctype;

        privateFields = Object.freeze([...privateFields]);
        const referencesEntriesDescriptors = Object.entries(Object.getOwnPropertyDescriptors(references));
        const methodsEntriesDescriptors = Object.entries(Object.getOwnPropertyDescriptors(methods));
        const typeEvents = { ...events };

        async function emitEvent(eventName, doc, oldDoc = null, adminKey, response, privateKey) {
            if (privateKey !== emitEventSymbol) throw new TypeError("Função privada");
            const event = typeEvents[eventName]
            if (event) {
                if (typeof event === "function") await event(doc, oldDoc, adminKey, response);
                if (event instanceof Array) for (const listener of event) await listener(doc, oldDoc, adminKey, response);
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
                    if (typeof descriptor.value === "function") Property.assign(this.references, key, "value", descriptor.value.bind(this));
                }
                Object.seal(this);
            }
            static name = `${basetype.name}Document`;
        }

        fieldsFilters = Object.freeze([ ...fieldsFilters ]);
        // id não é passado em create.
        async function callFieldsFilters({ action, type, key, fields, id } = {}) {
            for (const filter of fieldsFilters) {
                fields = await filter({ action, type, key, fields, id });
            }
            return fields;
        }

        doctype._basetype = basetype;
        doctype.collection = collection;
        doctype._eventEmitter = emitEvent;
        doctype._callFieldsFilter = callFieldsFilters;
        if (bucket) {
            doctype._bucket = bucket;
            Property.set(doctype, "_bucket", "freeze", "hide", "lock");
        }
        doctype._allowOverSet = allowOverSet;
        if (public) {
            doctype._public = new PublicDocs(collection, doctype);
            Property.set(doctype, "_public", "freeze", "hide", "lock");
        }
        Property.set(doctype, "_basetype", "freeze", "hide", "lock");
        Property.set(doctype, "collection", "freeze", "hide", "lock");
        Property.set(doctype, "_eventEmitter", "freeze", "hide", "lock");
        Property.set(doctype, "_callFieldsFilter", "freeze", "hide", "lock");
        Property.set(doctype, "_allowOverSet", "freeze", "hide", "lock");

        doctype.prototype.collection = collection;
        Property.set(doctype.prototype, "collection", "freeze", "hide", "lock");

        doctype["create.minKeyLevel"] = actionsMinKeyLevel.create ?? 1;
        doctype["read.minKeyLevel"] = actionsMinKeyLevel.read ?? 1;
        doctype["update.minKeyLevel"] = actionsMinKeyLevel.update ?? 1;
        doctype["remove.minKeyLevel"] = actionsMinKeyLevel.remove ?? 1;

        Property.set(doctype, "create.minKeyLevel", "freeze", "hide", "lock");
        Property.set(doctype, "read.minKeyLevel", "freeze", "hide", "lock");
        Property.set(doctype, "update.minKeyLevel", "freeze", "hide", "lock");
        Property.set(doctype, "remove.minKeyLevel", "freeze", "hide", "lock");

        privateDocTypes.set(basetype, doctype);

        return doctype;
    }

    const Types = {};

    // type = nome no objeto Types
    function createRegisterCallback(type, action) {
        return async (doc, oldDoc, key) => await registerAction(key, Types[type], doc.id, action, oldDoc, doc);
    }

    Types.Acolhido = createDatabaseDocumentType(BaseDataTypes.Acolhido, "acolhidos", {
        references: {
            async get_familia() {
                const ref = instanceRealFields.get(this).ref_familia;
                if (ref instanceof DocumentReference) {
                    const doc = await getDoc(ref);
                    if (doc.exists()) {
                        return new Types.Familia(Symbol.for("PublicTypesRead"), doc.id, mapForTimestampToDate({ ...doc.data() }), privateDBConstructorKey);
                    }
                } else {
                    throw new NotFoundError("Família não encontrada");
                }
            },
            async get_documentos() {
                const docs = [];
                for (const ref of instanceRealFields.get(this).ref_documentos) {
                    if (ref instanceof DocumentReference) {
                        const doc = await getDoc(ref);
                        if (doc.exists()) {
                            docs.push(new Types.Documento(Symbol.for("PublicTypesRead"), doc.id, mapForTimestampToDate({ ...doc.data() }), privateDBConstructorKey));
                        }
                    }
                }
                return docs;
            },
            async get_imagem() {
                const url = instanceRealFields.get(this).url_imagem;
                if (!url) return null;
                return await readInStorage(Acolhido._bucket, url);
            }
        },
        // privateFields: [ "ref_familia", "ref_documentos" ],
        events: {
            create: createRegisterCallback("Acolhido", "adicionar"),
            remove: createRegisterCallback("Acolhido", "remover"),
            update: createRegisterCallback("Acolhido", "editar"),
        },
        bucket: "profile-pictures",
        fieldsFilters: [
            async ({ fields, action, response, id }) => {
                switch (action) {
                    case "create":
                        delete fields.url_imagem;
                        if (!fields.blob) return fields; else {
                            fields.url_imagem = await saveInStorage(Acolhido._bucket, Acolhido.collection, fields.blob, response);
                            delete fields.blob;
                        }
                        return fields;
                    case "update":
                        if (!fields.blob) return fields; else {
                            delete fields.url_imagem;
                            fields.url_imagem = await updateInStorage(Acolhido._bucket, fields.url_imagem, fields.blob, response, Acolhido.collection);
                            delete fields.blob;
                        }
                        return fields;
                    case "remove":
                        await removeInStorage(Acolhido._bucket, fields.url_imagem, response);
                        return fields;
                    default:
                        return fields;
                }
            }
        ]
    });

    Types.Familia = createDatabaseDocumentType(BaseDataTypes.Familia, "familias", {
        references: {
            async get_acolhidos() { return createdByKey.get(this) },
        },
        methods: {
            count() {
                return {}
            }
        },
        events: {
            create: createRegisterCallback("Familia", "adicionar"),
            remove: createRegisterCallback("Familia", "remover"),
            update: createRegisterCallback("Familia", "editar"),
        },
        bucket: "profile-pictures",
        fieldsFilters: [

        ]
    });

    Types.Apoiador = createDatabaseDocumentType(BaseDataTypes.Apoiador, "apoiadores", {
        references: {
            async get_logo() { return await readInStorage(Apoiador._bucket, instanceRealFields.get(this).url_logo) }
        },
        fieldsFilters: [
            async ({ fields, type, action, response } = {}) => {
                switch (action) {
                    case "create":
                        delete fields.url_logo;
                        if (!fields.blob) throw new ClientError(response, "Missing upload blob property.");
                        fields.url_logo = await saveInStorage(type._bucket, type.collection, fields.blob);
                        delete fields.blob;
                        return fields;
                    case "update":
                        if (!fields.blob) return fields; else {
                            fields.url_logo = await updateInStorage(type._bucket, fields.url_logo, fields.blob, response, type.collection);
                        }
                        return fields;
                    case "remove":
                        await removeInStorage(type._bucket, fields.url_logo);
                        return fields;
                    default:
                        return fields;
                }
            }
        ],
        privateFields: [ "url_logo" ],
        bucket: "public-images",
        public: true,
        allowOverSet: false,
        events: {
            create: createRegisterCallback("Apoiador", "adicionar"),
            remove: createRegisterCallback("Apoiador", "remover"),
            update: createRegisterCallback("Apoiador", "editar"),
        }
    });
    Types.Voluntario = createDatabaseDocumentType(BaseDataTypes.Voluntario, "voluntarios", {
        events: {
            create: createRegisterCallback("Voluntario", "adicionar"),
            remove: createRegisterCallback("Voluntario", "remover"),
            update: createRegisterCallback("Voluntario", "editar"),
        }
    });

    Types.Documento = createDatabaseDocumentType(BaseDataTypes.Documento, "documentos", {
        references: {
            async get_arquivo() { return await readInStorage(Documento._bucket, instanceRealFields.get(this).url_arquivo) }
        },
        fieldsFilters: [
            async ({ fields, type, action, response } = {}) => {
                switch (action) {
                    case "create":
                        delete fields.url_arquivo;
                        if (!fields.blob) throw new ClientError(response, "Missing upload blob property.");
                        fields.url_arquivo = await saveInStorage(type._bucket, type.collection, fields.blob);
                        delete fields.blob;
                        return fields;
                    case "update":
                        if (!fields.blob) return fields; else {
                            delete fields.url_arquivo;
                            fields.url_arquivo = await updateInStorage(type._bucket, fields.url_arquivo, fields.blob, response, type.collection);
                        }
                        delete fields.blob;
                        return fields;
                    case "remove":
                        await removeInStorage(type._bucket, fields.url_arquivo);
                        return fields;
                    default:
                        return fields;
                }
            }
        ],
        privateFields: [ "url_arquivo" ],
        bucket: "documents",
        allowOverSet: false,
        events: {
            create: createRegisterCallback("Documento", "adicionar"),
            remove: createRegisterCallback("Documento", "remover"),
            update: createRegisterCallback("Documento", "editar"),
        }
    });
    Types.Imagem = createDatabaseDocumentType(BaseDataTypes.Imagem, "imagens", {
        references: {
            async get_conteudo() { return await readInStorage(Imagem._bucket, instanceRealFields.get(this).url_conteudo) }
        },
        fieldsFilters: [
            async ({ fields, type, action, response }) => {
                switch (action) {
                    case "create":
                        delete fields.url_conteudo;
                        if (!fields.blob) throw new ClientError(response, "Missing upload blob property.");
                        fields.url_conteudo = await saveInStorage(type._bucket, type.collection, fields.blob);
                        delete fields.blob;
                        return fields;
                    case "update":
                        if (!fields.blob) return fields; else {
                            delete fields.url_conteudo;
                            fields.url_conteudo = await updateInStorage(type._bucket, fields.url_conteudo, fields.blob, response, type.collection);
                        }
                        delete fields.blob;
                        return fields;
                    case "remove":
                        await removeInStorage(type._bucket, fields.url_conteudo);
                        return fields;
                    default:
                        return fields;
                }
            }
        ],
        privateFields: [ "url_conteudo" ],
        bucket: "public-images",
        allowOverSet: false,
        public: true,
        events: {
            create: createRegisterCallback("Imagem", "adicionar"),
            remove: createRegisterCallback("Imagem", "remover"),
            update: createRegisterCallback("Imagem", "editar"),
        }
    });
    Types.Evento = createDatabaseDocumentType(BaseDataTypes.Evento, "eventos", {
        references: {
            async get_imagem() { return await readInStorage(Evento._bucket, instanceRealFields.get(this).url_imagem) }
        },
        fieldsFilters: [
            async ({ fields, type, action, response }) => {
                switch (action) {
                    case "create":
                        delete fields.url_imagem;
                        if (!fields.blob) throw new ClientError(response, "Missing upload blob property.");
                        fields.url_imagem = await saveInStorage(type._bucket, type.collection, fields.blob);
                        delete fields.blob;
                        return fields;
                    case "update":
                        if (fields.blob) {
                            delete fields.url_imagem;
                            fields.url_imagem = await updateInStorage(type._bucket, fields.url_imagem, fields.blob, response, type.collection);
                        }
                        delete fields.blob;
                        return fields;
                    case "remove":
                        await removeInStorage(type._bucket, fields.url_imagem);
                        return fields;
                    default:
                        return fields;
                }
            }
        ],
        privateFields: [ "url_imagem" ],
        bucket: "public-images",
        allowOverSet: false,
        public: true,
        events: {
            create: createRegisterCallback("Evento", "adicionar"),
            remove: createRegisterCallback("Evento", "remover"),
            update: createRegisterCallback("Evento", "editar"),
        }
    });
    Types.Produto = createDatabaseDocumentType(BaseDataTypes.Produto, "produtos", {
        references: {
            async get_imagem() { return await readInStorage(Produto._bucket, instanceRealFields.get(this).url_imagem) }
        },
        fieldsFilters: [
            async ({ fields, type, action, response }) => {
                switch (action) {
                    case "create":
                        delete fields.url_imagem;
                        if (!fields.blob) throw new ClientError(response, "Missing upload blob property.");
                        fields.url_imagem = await saveInStorage(type._bucket, type.collection, fields.blob);
                        delete fields.blob;
                        if (fields.opcoes instanceof Array) {
                            for (const opcao of fields.opcoes) {
                                delete opcao.url_imagem;
                                if (opcao.blob) {
                                    opcao.url_imagem = await saveInStorage(type._bucket, type.collection, opcao.blob);
                                    delete opcao.blob;
                                }
                            }
                        }
                        return fields;
                    case "update":
                        if (fields.blob)  {
                            delete fields.url_imagem;
                            fields.url_imagem = await updateInStorage(type._bucket, fields.url_imagem, fields.blob, response, type.collection);
                        }
                        delete fields.blob;
                        console.log(fields)
                        if (fields.opcoes instanceof Array) {
                            for (const opcao of fields.opcoes) {
                                if (!opcao.blob) continue;
                                delete opcao.url_imagem;
                                opcao.url_imagem = await updateInStorage(type._bucket, opcao.url_imagem, opcao.blob, response, type.collection);
                                delete opcao.blob;
                            }
                        }
                        return fields;
                    case "remove":
                        await removeInStorage(type._bucket, fields.url_imagem);
                        return fields;
                    default:
                        return fields;
                }
            }
        ],
        // privateFields: [ "url_imagem" ],
        bucket: "public-images",
        allowOverSet: false,
        public: true,
        events: {
            create: createRegisterCallback("Produto", "adicionar"),
            remove: createRegisterCallback("Produto", "remover"),
            update: createRegisterCallback("Produto", "editar"),
        }
    });

    Types.SolicitacaoAcolhido = createDatabaseDocumentType(BaseDataTypes.SolicitacaoAcolhido, "solicitacoes_acolhido", {
        events: {
            // create: createRegisterCallback("SolicitacaoAcolhido", "adicionar"),
            // remove: createRegisterCallback("SolicitacaoAcolhido", "remover"),
            // update: createRegisterCallback("SolicitacaoAcolhido", "editar"),
        }
    });
    Types.SolicitacaoVoluntario = createDatabaseDocumentType(BaseDataTypes.SolicitacaoVoluntario, "solicitacoes_voluntario", {
        events: {
            // create: createRegisterCallback("SolicitacaoVoluntario", "adicionar"),
            // remove: createRegisterCallback("SolicitacaoVoluntario", "remover"),
            // update: createRegisterCallback("SolicitacaoVoluntario", "editar"),
        }
    });
    Types.Comentario = createDatabaseDocumentType(BaseDataTypes.Comentario, "comentarios", {

    });

    Types.Admin = createDatabaseDocumentType(BaseDataTypes.Admin, "admins", {
        privateFields: [ "senha", "chave" ],
        events: {
            create(doc) {},
            remove(doc) {},
            update(doc) {}
        },
        references: {
            async get_alteracoes() { }
        },
        fieldsFilters: [
            async ({ fields, action, id, response } = {}) => {
                delete fields.chave;
                switch (action) {
                    case "create":
                        if (!fields.email) throw new ClientError(response, "Nome não informado");
                        if (!fields.nivel) throw new ClientError(response, "Nível não informado");
                        if (!fields.senha) throw new ClientError(response, "Senha não informada");
                        if (![ "simples", "direcao", "dev" ].includes(fields.nivel)) throw new ClientError(response, "Nível inválido, use simples, direcao ou dev");
                        const emailExists = (await getDocs(query(collection(db, "admins"), where("email", "==", fields.email)))).docs.length > 0;
                        if (emailExists) throw new ClientError(response, "Email já cadastrado");
                        fields.chave = crypto.randomBytes(8).toString("hex");
                        fields.senha = crypto.createHash("sha256").update(fields.senha).digest("hex");
                        break;
                    case "update":
                        if (fields.senha) {
                            fields.senha = crypto.createHash("sha256").update(fields.senha).digest("hex");
                        }
                        if (fields.nivel && ![ "simples", "direcao", "dev" ].includes(fields.nivel)) throw new ClientError(response, "Nível inválido, use simples, direcao ou dev");
                        if (fields.email) {
                            const docSnap = await getDoc(doc(db, "admins", id));
                            if (docSnap.exists() && docSnap.data().email !== fields.email) {
                                const emailExists = (await getDocs(query(collection(db, "admins"), where("email", "==", fields.email)))).docs.length > 0;
                                if (emailExists) throw new ClientError(response, "Email já cadastrado");
                            }
                        }
                        break;
                    default:
                        // fields.chave = (await getDoc(doc(db, "admins", id))).data().chave;
                        break;
                }
                return fields;
            }
        ],
        bucket: "profile-pictures",
        allowOverSet: false,
    });

    Types.Alteracao = createDatabaseDocumentType(BaseDataTypes.Alteracao, "alteracoes", {
        references: {
            async get_admin() { }
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

    async function validateKey(key) {
        // valida se a chave está correta e existe no banco de dados.
        // simples => 1, direcao => 2, dev => 3

        if (typeof key === "object") key = privateKeys.get(key);

        if (!key) throw new Error("Chave não encontrada");

        const doc = (await getDocs(query(collection(db, "admins"), where("chave", "==", key)))).docs[0];

        if (!doc) return 0;
        const docData = doc.data();
        const nivel = docData.nivel;
        
        switch (nivel) {
            case "simples": return 1;
            case "direcao": return 2;
            case "dev": return 3;
            default: return 0;
        }
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
            } else if (typeof Blob !== "undefined" && value instanceof Blob) {
                // NÃO processa Blob, apenas mantém
                outputObject[key] = value;
            } else if (value && value.constructor && value.constructor.name === "File") {
                // Para arquivos do formidable (Node.js)
                outputObject[key] = value;
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
        return outputObject;
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

    function clearUndefined(object) {
        for (const key in object) {
            if (object[key] === undefined) {
                delete object[key];
            } else if (typeof object[key] === "function" || object[key] instanceof Function) {
                delete object[key];
            } else if (typeof object[key] === "object" && object[key] !== null) {
                clearUndefined(object[key]);
            }
        }
        return object;
    }

    async function create(key, type, fields, response) {
        let keylevel = await validateKey(key);
        if (keylevel <= 0) throw new PermissionError("Permissão insuficiente para qualquer operação de administrador");

        await type._callFieldsFilter({ action: "create", type, key, fields, response });

        if (keylevel < type["create.minKeyLevel"]) throw new PermissionError(response, `Permissão insuficiente para criar documento de ${type._basetype.name}`);

        let doc;

        const collRef = collection(db, type.collection);

        const sendingFields = mapForDateToTimestamp(fields);
        const docRef = await addDoc(collRef, clearUndefined(sendingFields));
        doc = new type(createdByKey.get(this), docRef.id, (await getDoc(docRef)).data(), privateDBConstructorKey);

        await type._eventEmitter("create", doc, null, key, response, emitEventSymbol);

        return doc;
    }

    const validLowerOrderDirections = [ "asc", "desc" ];

    async function read(key, type, search) {
        let keylevel = await validateKey(key);
        if (!type._public) {
            if (keylevel <= 0) throw new PermissionError(response, "Permissão insuficiente para qualquer operação de administrador");
    
            if (keylevel < type["read.minKeyLevel"]) throw new PermissionError(response, `Permissão insuficiente para ler documentos de ${type._basetype.name}`);
        }

        let docs = [];

        const collRef = collection(db, type.collection);

        if (search?.id) {
            const docRef = doc(collRef, search.id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) throw new NotFoundError(response, "Documento não encontrado");
            const fields = await type._callFieldsFilter({ action: "read", type, key, fields: { ...docSnap.data() }, id: docSnap.id, response });
            delete fields.id;
            docs.push(new type(createdByKey.get(this), docSnap.id, fields, privateDBConstructorKey));
            return docs;
        }

        const constraints = [];

        if (search?.conditions) {
            for (const condition of search?.conditions) {
                let field = condition.field;
                let relation = condition.relation.toLowerCase();
                let value = condition.value;

                if (relation === "not in") constraints.push(where(field, "not-in", value));
                constraints.push(where(field, relation, value));
            }
        }
        if (search?.orderBy) {
            let orderDirection = search.orderDirection?.toLowerCase() ?? "asc";
            if (!validLowerOrderDirections.includes(orderDirection)) throw new ClientError(response, "Direção de ordenação inválida, use ASC ou DESC");
            constraints.push(orderBy(search.orderBy, orderDirection));
        }
        if (search?.limit) {
            constraints.push(limit(search.limit));
        }
        if (search?.limitOffset) {
            constraints.push(startAfter(search.limitOffset));
        }

        for (const doc of (await getDocs(query(collRef, ...constraints))).docs) {
            const fields = await type._callFieldsFilter({ fields: mapForTimestampToDate({ ...doc.data() }), action: "read", type, key, id: doc.id, response });
            delete fields.id;
            docs.push(new type(createdByKey.get(this), doc.id, fields, privateDBConstructorKey));
        }

        await type._eventEmitter("read", docs, null, key, response, emitEventSymbol);

        return docs;
    }

    async function updateAdminKeyRelevel(key, id) {
        // faz um read no id e verifica se o id do admin é menor que o da chave atual.
    }

    async function update(key, type, id, fields, options, response) {
        let keylevel = await validateKey(key);
        if (keylevel === 0) throw new PermissionError(response, "Permissão insuficiente para qualquer operação de administrador");
        // verificação especial se o tipo for admin, já que admin1 pode apenas SE editar.
        if (type === Admin) keylevel = await updateAdminKeyRelevel(key, id);

        if (keylevel < type["update.minKeyLevel"]) throw new PermissionError(response, `Permissão insuficiente para atualizar documentos de ${type._basetype.name}`);

        const collRef = collection(db, type.collection);

        const docRef = doc(collRef, id);
        const docSnap = await getDoc(docRef);
        const oldDocData = docSnap.data();
        const oldDoc = new type(createdByKey.get(this), id, mapForTimestampToDate(oldDocData), privateDBConstructorKey);
        if (!docSnap.exists()) throw new NotFoundError(response, "Documento não encontrado");

        switch (options?.editType) {
            case "set":
                if (!type._allowOverSet) throw new ClientError(response, `Documentos ${type._basetype.name} não permite sobre-escrita.`);
                const newDoc = mapForDateToTimestamp(fields);
                const filteredSetData = await type._callFieldsFilter({ action: "update", type, key, fields: newDoc, id, response });
                delete filteredSetData.id;
                await setDoc(docRef, clearUndefined(filteredSetData));
                break;
            default:
            case "update":
                const docData = docSnap.data();
                const updatedFields = mapForDateToTimestamp(fields);
                const updatedDoc = { ...docData, ...updatedFields };
                const filteredPatchData = await type._callFieldsFilter({ action: "update", type, key, fields: updatedDoc, id, response });
                delete filteredPatchData.id;
                await updateDoc(docRef, clearUndefined(filteredPatchData));
                break;
        }

        const newDocSnap = await getDoc(docRef);
        const newDocData = newDocSnap.data();
        const newDoc = new type(createdByKey.get(this), id, mapForTimestampToDate(newDocData), privateDBConstructorKey);
        await type._eventEmitter("update", newDoc, oldDoc, key, response, emitEventSymbol);
        return newDoc;
    }

    async function remove(key, type, id, response) {
        let keylevel = await validateKey(key);
        if (keylevel === 0) throw new PermissionError(response, "Permissão insuficiente para qualquer operação de administrador");

        if (keylevel < type["remove.minKeyLevel"]) throw new PermissionError(response, `Permissão insuficiente para remover documentos de ${type._basetype.name}`);

        const collRef = collection(db, type.collection);
        const docRef = doc(collRef, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new NotFoundError(response, "Documento não encontrado");
        const docData = docSnap.data();
        const filteredRemoveData = await type._callFieldsFilter({ action: "remove", type, key, fields: docData, id, response });
        delete filteredRemoveData.id;
        const deletedDoc = new type(createdByKey.get(this), id, mapForTimestampToDate(filteredRemoveData), privateDBConstructorKey);
        await deleteDoc(docRef);
        await type._eventEmitter("remove", deletedDoc, null, key, response, emitEventSymbol);
        return deletedDoc;
    }

    async function getPublics(type, response) {
        await type._public.init();
        if (!type._public) throw new ServerError(response, "Tipo não é público");
        return type._public;
    }

    const privateLoginConstructorIndicator = Symbol("Login.PrivateConstructorIndicator");

    class Login {
        constructor(session, name, email, nivel, key, constructorKey) {
            if (constructorKey !== privateLoginConstructorIndicator) throw new Error("Private constructor");
            session.set("login", this);

            privateKeys.set(this, key);

            this.session = session;
            this.email = email;
            this.name = name;
            this.nivel = nivel;

            Property.set(this, "session", "freeze", "lock");
            Property.set(this, "email", "freeze", "lock");
            Property.set(this, "name", "freeze", "lock");
            Property.set(this, "nivel", "freeze", "lock");
        }

        session;
        email;
        name;

        create(type, fields) {
            return create(privateKeys.get(this), type, fields);
        }

        read(type, search) {
            return read(privateKeys.get(this), type, search);
        }

        update(type, id, fields, options) {
            return update(privateKeys.get(this), type, id, fields, options);
        }

        remove(type, id) {
            return remove(privateKeys.get(this), type, id);
        }
    }

    async function registerAction(key, type, id, change, oldDoc, doc) {
        if(typeof key == "symbol") return;
        if(key instanceof Login) key = privateKeys.get(key);
        const admin = (await getDocs(query(collection(db, "admins"), where("chave", "==", key)))).docs[0];
        if (!admin) return console.error("Admin não encontrado para chave " + key);
        const registro = {
            admin: admin.ref,
            colecao: type.collection,
            id_doc: doc.id,
            data: Timestamp.fromDate(new Date()),
            acao: change,
        };
        if (oldDoc) {
            registro.documento_novo = clearUndefined(instanceRealFields.get(doc));
            registro.documento_antigo = clearUndefined(instanceRealFields.get(oldDoc));
        } else {
            registro.documento = clearUndefined(instanceRealFields.get(doc));
        }
        const collRef = collection(db, "alteracoes");
        await addDoc(collRef, registro);
    }

    async function login(session, email, password, response) {
        if (!(session instanceof Session.Constructor)) throw new ClientError(response, "É necessário uma sessão no navegador para realizar login");
        let hasLogin = session.get("login");
        if (hasLogin && hasLogin instanceof Login) return hasLogin;

        const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
        const adminDoc = (await getDocs(query(collection(db, "admins"), where("email", "==", email), where("senha", "==", passwordHash)))).docs[0];

        if (!adminDoc) throw new ClientError(response, "Credenciais incorretas");
        
        const adminDocData = adminDoc.data();
        const key = adminDocData.chave;

        let login = new Login(session, adminDocData.nome, email, adminDocData.nivel, key, privateLoginConstructorIndicator);
        return login;
    }

    function isLogged(session) {
        if (!(session instanceof Session.Constructor)) throw new ClientError(undefined, "É necessário uma sessão no navegador para procurar por login");
        if (session.get("login") instanceof Login) return true; else return false;
    }
    
    function logout(session) {
        if (!(session instanceof Session.Constructor)) throw new ClientError(undefined, "É necessário uma sessão no navegador para realizar logout");
        let hasLogin = session.get("login");
        if (hasLogin && hasLogin instanceof Login) {
            session.delete("login");
            return true;
        } else {
            return false;
        }
    }

    const validLevelNamesAndNumbers = Object.freeze({
        simples: 1,
        direcao: 2,
        dev: 3   
    });
    
    const validLevelNames = Object.freeze(Object.keys(validLevelNamesAndNumbers));
    const validLevelNumbers = Object.freeze(Object.values(validLevelNamesAndNumbers));

    async function register(session, email, password, name, level, imageBlob, response) {
        if (!(session instanceof Session.Constructor)) throw new ClientError(response, "É necessário uma sessão para registrar um administrador");
        if (level && !validLevelNames.includes(level) && !validLevelNumbers.includes(level)) throw new ClientError(response, "Nível inválido, use comum, direcao ou dev");
        if (level && typeof level === "number") {
            level = validLevelNames[validLevelNumbers.indexOf(level)];
        }
        if (!level) level = "simples";

        if (imageBlob) await saveInStorage(Admin._bucket, Admin.collection, imageBlob);

        let hasLogin = session.get("login");
        if (hasLogin && hasLogin instanceof Login) {
            if ((validLevelNamesAndNumbers[level] ?? 0) >= (validLevelNamesAndNumbers[hasLogin.nivel] ?? 0)) throw new PermissionError(response, "Permissão insuficiente para registrar um administrador com nível maior ou igual ao seu");

            const newAdmin = await create(hasLogin, Admin, { email, senha: password, nome: name, nivel: level });
            const newAdminData = await getDoc(doc(db, "admins", newAdmin.id));
            const newAdminDoc = newAdminData.data();
            const newAdminKey = newAdminDoc.chave;
            return new Login(session, newAdminDoc.nome, email, newAdminDoc.nivel, newAdminKey, privateLoginConstructorIndicator);
        } else {
            throw new ClientError(response, "É necessário estar em uma sessão autorizada para registrar um administrador");
        }
    }

    async function unregister(session, admin) {}


    return {
        login,
        logout,
        isLogged,
        register,
        validateKey,
        create,
        read,
        update,
        remove,
        getPublics,
        BaseDataTypes,
        PublicDocs,
        ...Types
    };
} )();

module.exports = EssenciaAzul;