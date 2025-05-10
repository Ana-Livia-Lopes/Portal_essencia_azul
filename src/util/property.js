/**
 * Controlador e analisador de propriedades de objetos.
 */
class Property {
    /**
     * Obtém informações sobre uma propriedade de um objeto.
     * @param {Object} object Qualquer objeto que não seja `null` ou `undefined`.
     * @param {string|symbol} property Chave da propriedade a ser procurada.
     * @param  {..."freeze"|"unfreeze"|"hide"|"show"|"lock"} manipulators Manipula a propriedade antes de a obtê-la.
     */
    constructor(object, property, ...manipulators) {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (typeof object !== "object" && typeof object !== "function") throw new TypeError("impossível manipular fora de objeto");

        Property.set(object, property, ...manipulators);

        this.object = object;
        this.property = property;

        const properties = Object.getOwnPropertyDescriptor(object, property);
        if (typeof properties !== "undefined") {
            this.get = properties.get;
            this.set = properties.set;
            this.value = properties.value;
            this.writable = properties.writable;
            this.enumerable = properties.enumerable;
            this.configurable = properties.configurable;
        }
    }

    /** Objeto de busca. @type {Object} */
    object;
    /** Propriedade buscada. @type {string|symbol} */
    property;

    /** Método getter da propriedade. @type {Function|undefined} */
    get;
    /** Método setter da propriedade. @type {Function|undefined} */
    set;
    /** Valor bruto da propriedade. @type {any} */
    value;
    /** Permissão de escrita da propriedade. @type {boolean} */
    writable;
    /** Enumeração da propriedade. @type {boolean} */
    enumerable;
    /** Permissão de reconfiguração da propriedade. @type {boolean} */
    configurable;

    static validateObjProperty(object, property) {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (typeof object !== "object" && typeof object !== "function") throw new TypeError("impossível manipular fora de objeto");
    }

    /**
     * Congela a escrita da propriedade.
     * 
     * Define `writable` como `false`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static freeze(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.writable = false;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Descongela a escrita da propriedade.
     * 
     * Define `writable` como `true`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static unfreeze(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.writable = true;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Esconde a enumeração da propriedade.
     * 
     * Define `enumerable` como `false`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static hide(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.enumerable = false;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Revela a enumeração da propriedade.
     * 
     * Define `enumerable` como `true`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static show(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.enumerable = true;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Desativa a configuração posterior da propriedade.
     * 
     * Define `configurable` como `false`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static lock(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.configurable = false;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Passa pelos manipuladores de propriedade existentes, aplicando-os a propriedade.
     * @param {Object} object 
     * @param {string|symbol} property 
     * @param  {..."freeze"|"unfreeze"|"hide"|"show"|"lock"} manipulators 
     */
    static set(object, property, ...manipulators) {
        this.validateObjProperty(object, property);

        if (manipulators.includes('lock')) {
            let newmanipulators = [];
            manipulators.forEach(manipulator => {
                if (manipulator === "lock") return;
                newmanipulators.push(manipulator);
            });
            newmanipulators.push('lock');
            manipulators = newmanipulators;
        }

        manipulators.forEach(manipulator => {
            if (!Property.#methods.includes(manipulator)) throw new Error("método de manipulação inválido");

            this[manipulator](object, property);
        });
    }

    /**
     * Procura por uma configuração específica de uma propriedade.
     * @param {Object} object 
     * @param {string|symbol} property 
     * @param {"get"|"set"|"value"|"writable"|"enumerable"|"configurable"} search 
     * @returns 
     */
    static catch(object, property, search = "value") {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (object === null || object === undefined) throw new TypeError("objeto de busca inválido");
        if (!this.#attributes.includes(search)) throw new Error("atributo de busca inválido");

        let properties = Object.getOwnPropertyDescriptor(object, property);
        if (!properties) properties = {};

        return properties[search];
    }

    static assign(object, property, attribute, value) {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (object === null || object === undefined) throw new TypeError("objeto de busca inválido");
        switch (attribute) {
            case "get":
                if (typeof value !== "function") throw new TypeError("getter deve ser uma função");
                if (value.length !== 0) throw new TypeError("getter não pode ter argumentos");
                Object.defineProperty(object, property, { get: value });
                break;
            case "set":
                if (typeof value !== "function") throw new TypeError("setter deve ser uma função");
                if (value.length !== 1) throw new TypeError("setter deve ter um argumento");
                Object.defineProperty(object, property, { set: value });
                break;
            case "value":
                Object.defineProperty(object, property, { value });
                break;
            case "writable":
                if (typeof value !== "boolean") throw new TypeError("writable deve ser um booleano");
                Object.defineProperty(object, property, { writable: value });
                break;
            case "enumerable":
                if (typeof value !== "boolean") throw new TypeError("enumerable deve ser um booleano");
                Object.defineProperty(object, property, { enumerable: value });
                break;
            case "configurable":
                if (typeof value !== "boolean") throw new TypeError("configurable deve ser um booleano");
                Object.defineProperty(object, property, { configurable: value });
                break;
            default:
                throw new TypeError("atributo desconhecido");
        }
    }

    static #methods = [ "freeze", "unfreeze", "hide", "show", "lock" ];
    static #attributes = [ "get", "set", "value", "writable", "enumerable", "configurable" ];

    static {
        // Object.freeze(this);
        Object.freeze(this.prototype);
    }
}

module.exports = Property;