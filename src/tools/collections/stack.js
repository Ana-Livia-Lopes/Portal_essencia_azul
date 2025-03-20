const DefaultLinkedList = require("./linkedlist.js");

var Stack = ( function() {
    const LinkedList = class StackLinkedList extends DefaultLinkedList {}

    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    /** @type {ProxyHandler} */
    /** @type {ProxyHandler} */
    const proxyHandler = {
        get: DefaultLinkedList.proxyHandler.get,
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                throw new Error("Não é possível definir manualmente propriedades de um Stack");
            } else {
                target[property] = newValue;
            }
        }
    }

    /** @type {WeakMap<Stack, DefaultLinkedList>} */
    const privateLists = new WeakMap();

    const Stack = class Stack {
        constructor(...values) {
            const proxy = new Proxy(this, proxyHandler);
            const list = new LinkedList(...values);

            privateLists.set(this, list);
            privateLists.set(proxy, list);

            return proxy;
        }

        at(index) {
            return privateLists.get(this).at(index);
        }

        append(...values) {
            privateLists.get(this).append(...values);
        }

        pop() {
            return privateLists.get(this).pop();
        }

        clear() {
            privateLists.get(this).clear();
        }

        has(value) {
            return privateLists.get(this).has(value);
        }

        *values() {}

        get top() {
            return this.at("last");
        }
        get length() {
            return privateLists.get(this).length;
        }

        *[Symbol.iterator]() { yield* this.values() }

        [Symbol.for("nodejs.util.inspect.custom")]() {
            return privateLists.get(this);
        }

        toJSON() {
            return privateLists.get(this).toJSON();
        }
    }

    return Stack;
} )();

module.exports = Stack;