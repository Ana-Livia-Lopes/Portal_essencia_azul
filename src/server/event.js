const { protect } = require( "../util/" );

const Cache = new (require("./cache.js"))();
const ExistingEvents = new Map();

// refazer e fazer depender de arquivo.

class Event {
    constructor(name, file) {
        if (ExistingEvents.has(name)) return ExistingEvents.get(name);
        if (typeof name !== "string") throw new TypeError("Event name must be a string");
        if (typeof file !== "string") throw new TypeError("Event file must be a string");
        this.name = name;
        this.file = file;
        protect(this);
        ExistingEvents.set(name, this);
    }

    static get(name) {
        return ExistingEvents.get(name);
    }

    static Getter = class EventGetter {
        constructor(name) {
            this.name = name;
        }

        get() {
            const event = ExistingEvents.get(this.name);
            if (!event) throw new Error(`Event ${this.name} not found`);
            return event;
        }

        call(object, parameters) {
            const event = this.get();
            return event.call(object, parameters);
        }
    }

    static clear() {
        Cache.clear();
        ExistingEvents.clear();
    }

    name;
    file;

    content() {
        if (Cache.has(this.name)) return Cache.get(this.name);
        delete require.cache[require.resolve(this.file)];
        const content = require(this.file);
        Cache.set(this.name, content);
        return content;
    }

    call(object, parameters) {
        return this.content().call(object, parameters);
    }

    static remove(name) {
        const event = ExistingEvents.get(name);
        if (!event) return;
        Cache.delete(name);
        return event;
    }

    static {
        protect(this);
    }
}


module.exports = Event;