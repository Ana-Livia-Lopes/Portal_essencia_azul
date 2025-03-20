const Property = require("../property.js");
const Stack = require("./stack.js");
const Typed = require( "./typed.js" );

class TypedStack extends Stack {
    constructor(type, includeAllInstances = false) {
        super();

        if (type instanceof Array) type = new Typed.TypeList(...type);
        if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de TypedStack precisa ser uma função construtora ou TypeList");
        this.type = type;
        this.includeAllInstances = Boolean(includeAllInstances);

        Property.set(this, "type", "freeze", "lock");
        Property.set(this, "includeAllInstances", "freeze", "lock");
    }

    type;
    includeAllInstances;

    checkType(value) {
        return Typed.checkType(value, this.type, this.includeAllInstances);
    }

    append(...values) {
        for (const value of values) {
            if (!this.checkType(value)) throw new TypeError(`Valor inválido para coleção Stack de tipo ${this.type.name}`);
    
            super.append(value);
        }
    }
}

module.exports = TypedStack;