const validstr = require( "../base/string_valid.js" );
const { customNamedArray } = require( "./typed.js" );

var LinkedList = ( function() {
    const Node = class Node {
        constructor(value, { next, last } = {}) {
            this.value = value;
            this.next = next ?? null;
            this.last = last ?? null;

            if (next && last) {
                if (!(next instanceof Node) || !(last instanceof Node)) throw new TypeError("Nodes só podem ser colocados entre outros Nodes.");
                if (next.last !== last || last.next !== next) throw new Error("Passado next e last Nodes para um novo Node, porém não estão conectados entre si de forma correta.");

                next.last = this;
                last.next = this;
            } else if (next) {
                if (!(next instanceof Node)) throw new TypeError("next precisa ser um Node");
                if (next.last) {
                    this.last = next.last;
                }
                this.next = next;
                next.last = this;
            } else if (last) {
                if (!(last instanceof Node)) throw new TypeError("last precisa ser um Node");
                if (last.next) {
                    this.next = last.next;
                }
                this.last = last;
                last.next = this;
            }
        }

        value;
        next;
        last;

    }

    const customNodes = new Map();

    function createCustomNode(name) {
        let NodeConstructor = customNodes.get(name);
        if (NodeConstructor) return NodeConstructor;

        if (!validstr(name, "onlyAlphaNumeric","blockNumbers","blockBooleans","blockEmpty")) throw new TypeError("Nome de classe inválida");
        name = String(name).trim().replace("LinkedList", "");
        NodeConstructor = customNodes.get(name);
        if (!NodeConstructor) {
            NodeConstructor = new Function("Node", `return class ${name}LinkedListNode extends Node {}`)(Node);
            customNodes.set(name, NodeConstructor);
        }
        return NodeConstructor;
    }

    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    /** @type {ProxyHandler} */
    const proxyHandler = {
        get(target, property) {
            if (typeof property === "symbol") return target[property];
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                return target.at(toNumberProperty);
            }
            return target[property];
        },
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                target.set(toNumberProperty, newValue);
            } else {
                target[property] = newValue;
            }
            return true;
        },
        deleteProperty(target, property) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                target.remove(toNumberProperty);
            }
            return true;
        }
    };

    Object.freeze(proxyHandler);

    /**
     * @type {WeakMap<LinkedList, { first: Node | null, last: Node | null }>}
     */
    const LinkedListPrivateFields = new WeakMap();

    const LinkedList = class LinkedList {
        constructor(...values) {
            const proxy = new Proxy(this, proxyHandler);
            const fields = { first: null, last: null };
            
            LinkedListPrivateFields.set(this, fields);
            LinkedListPrivateFields.set(proxy, fields);

            if (values.length > 0) this.append(...values);
            return proxy;
        }
        
        at(index) {
            return getNodeAt(this, index)?.value;
        }

        set(index, value) {
            const nodeAtIndex = getNodeAt(this, index);

            nodeAtIndex.value = value;
        }

        insert(index, ...values) {
            const privateFields = LinkedListPrivateFields.get(this);
            const nodeBeforeIndex = getNodeAt(this, index)?.last ?? privateFields.last;

            let last = nodeBeforeIndex;
            let nextNode = nodeBeforeIndex?.next;
            let thisNodeType = (createCustomNode(this.constructor.name));
            for (const value of values) {
                const node = new thisNodeType(value, { next: nextNode, last: last });
                if (!last) privateFields.first = node;
                last = node;
            }

            if (!last.next) privateFields.last = last;
        }

        remove(index) {
            const nodeAtIndex = getNodeAt(this, index);
            const privateFields = LinkedListPrivateFields.get(this);

            const last = nodeAtIndex?.last;
            const next = nodeAtIndex?.next;

            if (next && last) {
                next.last = last;
                last.next = next;
            } else if (next) {
                next.last = null;
                privateFields.first = next;
            } else if (last) {
                last.next = null;
                privateFields.last = last;
            }

            return nodeAtIndex?.value;
        }

        append(...values) { this.insert("last", ...values) }

        unshift(...values) { this.insert(0, ...values) }

        pop() { return this.remove("last") }

        shift() { return this.remove(0) }

        get length() {
            let length = 0;

            let current = LinkedListPrivateFields.get(this).first;
            while (current) {
                length++;
                current = current.next;
            }

            return length;
        }

        get first() {
            return LinkedListPrivateFields.get(this).first?.value;
        }

        get last() {
            return LinkedListPrivateFields.get(this).last?.value;
        }
        
        // toString() {}

        // join() {}

        // forEach() {}

        // map() {}

        // fill() {}

        // filter() {}

        // find() {}

        // findLast() {}

        has(value) {
            for (const nodeValue of this.values()) {
                if (nodeValue === value) return true;
            }
            return false;
        }

        clear() {
            const privateFields = LinkedListPrivateFields.get(this);
            privateFields.first = null;
            privateFields.last = null;
        }

        // reduce() {}

        // reduceRight() {}

        *values() {
            let current = LinkedListPrivateFields.get(this).first;
            
            while (current) {
                yield current.value;
                current = current?.next;
            }
        }

        *[Symbol.iterator]() { yield* this.values(); }

        [Symbol.for("nodejs.util.inspect.custom")](depth, options) {
            const array = new (customNamedArray(this.constructor.name, ""));
            array.push(...this.values());
            return array;
        }

        toJSON() {
            return [...this.values()];
        }
    }

    function getNodeAt(list, index) {
        if (index === "last") return LinkedListPrivateFields.get(list).last;
        if (typeof index !== "number") throw new TypeError("Índice precisa ser um número");
        if (!Number.isInteger(index) || index < 0) throw new RangeError("Índice precisa ser um número inteiro positivo");

        let currentIndex = 0;
        let current = LinkedListPrivateFields.get(list).first;

        while(currentIndex < index) {
            if (!current) break;
            current = current?.next;
            currentIndex++;
        }

        return current;
    }

    LinkedList.proxyHandler = proxyHandler;

    return LinkedList;
} )();

module.exports = LinkedList;