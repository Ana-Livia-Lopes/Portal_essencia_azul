const Property = require( "../property.js" );
const Typed = require( "./typed.js" );

class TypedMap extends Map {
    constructor(type, keytype = undefined, includeAllInstances = false) {
        super();
        if (type instanceof Array) type = new Typed.TypeList(...type);
        if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de um TypedMap precisa ser uma função construtura ou TypeList");
        this.type = type;
        if (keytype instanceof Array) keytype = new Typed.TypeList(...keytype);
        if (typeof keytype !== "function" && !(keytype instanceof Typed.TypeList) && keytype !== undefined) throw new TypeError("Tipo de chave de um TypedMap precisa ser uma função construtora ou TypeList");
        if (keytype) this.keytype = keytype;
        this.includeAllInstances = Boolean(includeAllInstances);

        Property.set(this, "type", "freeze", "lock");
        Property.set(this, "keytype", "freeze", "lock");
        Property.set(this, "includeAllInstances", "freeze", "lock");
    }

    type;
    keytype = undefined;
    includeAllInstances = false;

    checkType(value, type) {
        if (type == "key" && this.keytype == undefined) return true;
        switch (type) {
            default:
            case "value":
                return Typed.checkType(value, this.type, this.includeAllInstances);
            case "key":
                return Typed.checkType(value, this.keytype, this.includeAllInstances);
        }
    }

    set(key, value) {
        if (!this.checkType(key, "key")) throw new TypeError(`Chave inválida para coleção Map de tipo ${this.keytype.name}`);
        if (!this.checkType(value, "value")) throw new TypeError(`Valor inválido para coleção Map de tipo ${this.type.name}`);

        return super.set(key, value);
    }

    get [Symbol.toStringTag]() {
        return `${this.type.name}`;
    }

    static {
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
}

module.exports = TypedMap;