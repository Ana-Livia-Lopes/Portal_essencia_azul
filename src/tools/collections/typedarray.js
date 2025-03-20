const Property = require("../property.js");
const Typed = require( "./typed.js" );

var TypedArray = ( function() {
    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    const proxyHandler = {
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                if (!target.checkType(newValue)) throw new TypeError(`valor inválido para coleção Array de tipo ${this.type.name}`);
                target[property] = newValue;
                return true;
            } else {
                target[property] = newValue;
                return true;
            }
        }
    }

    const TypedArray = class TypedArray extends Array {
        constructor(type, includeAllInstances = false) {
            super();
            if (type instanceof Array) type = new Typed.TypeList(...type);
            if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de TypedArray precisa ser uma função construtora ou TypeList");
            this.type = type;
            this.includeAllInstances = Boolean(includeAllInstances);
    
            Property.set(this, "type", "freeze", "hide", "lock");
            Property.set(this, "includeAllInstances", "freeze", "hide", "lock");
    
            return new Proxy(this, proxyHandler);
        }

        type;
        includeAllInstances;

        checkType(value) {
            return Typed.checkType(value, this.type, this.includeAllInstances);
        }

        get [Symbol.toStringTag]() {
            return `${this.type.name}`;
        }

        map(callback, thisArg) {
            const result = super.map(callback, thisArg);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        filter(callback, thisArg) {
            const result = super.filter(callback, thisArg);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        slice(begin, end) {
            const result = super.slice(begin, end);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        splice(start, deleteCount, ...items) {
            const result = super.splice(start, deleteCount, ...items);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        concat(...values) {
            const result = super.concat(...values);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        flatMap(callback, thisArg) {
            const result = super.flatMap(callback, thisArg);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        reduce(callback, initialValue) {
            const result = super.reduce(callback, initialValue);
            if (Array.isArray(result)) {
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
            }
            return result;
        }

        reduceRight(callback, initialValue) {
            const result = super.reduceRight(callback, initialValue);
            if (Array.isArray(result)) {
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
            }
            return result;
        }

        flat(depth = 1) {
            const result = super.flat(depth);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }
    }

    return TypedArray;
} )();

module.exports = TypedArray;