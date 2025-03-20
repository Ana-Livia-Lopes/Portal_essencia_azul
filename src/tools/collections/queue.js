const DefaultLinkedList = require("./linkedlist.js");

var Queue = ( function (){
    const LinkedList = class QueueLinkedList extends DefaultLinkedList {}

    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    /** @type {ProxyHandler} */
    const proxyHandler = {
        get: DefaultLinkedList.proxyHandler.get,
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                throw new Error("Não é possível definir manualmente propriedades de uma Queue");
            } else {
                target[property] = newValue;
            }
        }
    }

    /**
     * @type {WeakMap<Queue, DefaultLinkedList>}
     */
    const privateLists = new WeakMap();

    const Queue = class Queue {
        constructor(...values) {
            const list = new LinkedList(...values);
            const proxy = new Proxy(this, proxyHandler);
            
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

        shift() {
            return privateLists.get(this).shift();
        }

        has(value) {
            return privateLists.get(this).has(value);
        }

        clear() {
            privateLists.get(this).clear();
        }

        get first() {
            return this.at(0);
        }

        get length() {
            return privateLists.get(this).length;
        }

        *values() {
            yield* privateLists.get(this).values();
        }

        *[Symbol.iterator]() { yield* this.values() }

        [Symbol.for("nodejs.util.inspect.custom")]() {
            return privateLists.get(this);
        }

        toJSON() {
            return privateLists.get(this).toJSON();
        }
    }

    return Queue;
} )();

module.exports = Queue;