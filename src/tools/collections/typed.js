const Namespace = require("../namespace.js");
const validstr = require("../base/string_valid.js");
const Property = require("../property.js");

var Typed = ( function () {
    const Typed = {};
    Namespace(Typed, "Typed");
    
    Typed.checkType = function checkType(value, type, includeAllInstances = false) {
        if (value === null || value === undefined) return false;
        if (typeof type === "function") {
            if (includeAllInstances) {
                if (value instanceof type) return true;
            }
            if (value.constructor === type) return true;
            return false;
        }
        
        if (!(type instanceof Typed.TypeList)) throw new TypeError("type precisa ser uma função construtora ou uma lista iterável de tipos");
    
        for (const typel of type.values()) {
            if (includeAllInstances && value instanceof typel) return true;
            if (value.constructor === typel) return true;
        }
    
        return false;
    }

    const customNamedArrays = new Map();

    Typed.customNamedArray = function customNamedArray(name, suffix) {
        if (!validstr(name, "blockEmpty", "blockBooleans", "blockArrays", "onlyAlphaNumeric")) throw new TypeError("Nome de Array inválido");
        if (suffix && !validstr(suffix, "blockEmpty", "blockBooleans", "blockArrays", "onlyAlphaNumeric")) throw new TypeError("Sufixo de Array inválido");
        name = String(name).trim();
        suffix = suffix ? String(suffix).trim() : "";
        let NamedArrayConstructor = customNamedArrays.get(name);
        if (!NamedArrayConstructor) {
            NamedArrayConstructor = (new Function(`return class ${name}Array${suffix} extends Array {}`))();
            customNamedArrays.set(name, NamedArrayConstructor);
        }
        return NamedArrayConstructor;
    }

    const TypeListArray = Typed.customNamedArray("TypeList");
    
    Typed.TypeList = class TypeList {
        constructor(...types) {
            for (const type of types) {
                if (typeof type === "function") {
                    if (!this.list.includes(type)) this.list.push(type);
                } else {
                    throw new TypeError("type precisa ser uma função construtora");
                }
            }
    
            Object.freeze(this.list);
            Property.set(this, "list", "freeze", "hide", "lock");
        }
    
        list = new TypeListArray;
    
        *values() {
            yield* this.list.values();
        }
    
        get length() { return this.list.length }
    
        get name() { return this.toString() }
    
        has(type) {
            return this.list.includes(type);
        }
    
        toString() {
            return `(${this.list.map(t => t.name).join(", ")})`;
        }
    
        [Symbol.for("nodejs.util.inspect.custom")](depth, options) {
            return this.list;
        }
    }

    return Typed;
} )()

module.exports = Typed;