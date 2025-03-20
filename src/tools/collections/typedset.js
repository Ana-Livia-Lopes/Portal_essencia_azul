const Property = require( "../property.js" );
const Typed = require( "./typed.js" );

class TypedSet extends Set {
    constructor(type, includeAllInstances = false) {
        super();
        if (type instanceof Array) type = new Typed.TypeList(...type);
        if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de TypedSet precisa ser uma função construtora ou TypeList");
        this.type = type;
        this.includeAllInstances = Boolean(includeAllInstances);

        Property.set(this, "type", "freeze", "lock");
        Property.set(this, "includeAllInstances", "freeze", "lock");
    }

    /** @type {Function} */
    type;
    includeAllInstances = false;
    
    checkType(value) {
        return Typed.checkType(value, this.type, this.includeAllInstances);
    }

    add(value) {
        if (!this.checkType(value)) throw new TypeError(`Valor inválido para coleção Set de tipo ${this.type.name}`);

        return super.add(value);
    }

    get [Symbol.toStringTag]() {
        return `${this.type.name}`;
    }

    static {
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
}

module.exports = TypedSet;