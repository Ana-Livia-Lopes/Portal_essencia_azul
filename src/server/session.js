const crypto = require("crypto");
const http = require("http");
const { protect, Cookie } = require("../util");

const isValidName = RegExp.prototype.test.bind(/\w+/);

const SessionConstructor = class Session extends Map {
    constructor(collection, response, maxAge) {
        if (!(collection instanceof Session.Collection)) throw new TypeError(`Session needs a SessionCollection`);
        if (!(response instanceof http.ServerResponse)) throw new TypeError(`Session needs a ServerResponse`);

        super();

        do {
            this.id = crypto.randomBytes(8).toString("hex");
        } while (collection ? collection.has(this.id) : false);

        response.setHeader("Set-Cookie", `${collection.cookieName}=${this.id}; HttpOnly; Path=/`);

        if (maxAge) {
            if (typeof maxAge !== "number") throw new TypeError(`Invalid session maxAge: ${maxAge}`);
            if (maxAge < 0) throw new RangeError(`Session maxAge must be a positive number`);
            this.maxAge = maxAge;
        }

        collection.add(this);
    }

    id;
    lastUse = Date.now();
    maxAge = 120;
}

function Session(collection, request, response, maxAge) {
    const cookies = Cookie.parse(request.headers.cookie);
    if (collection.has(cookies[collection.cookieName])) {
        return collection.get(cookies[collection.cookieName]);
    }
    return new SessionConstructor(collection, response, maxAge);
};

Session.Collection = class SessionCollection extends Map {
    constructor(name, cleaningInterval) {
        if (!isValidName(name)) throw new Error(`Invalid session name: ${name}`);
        if (cleaningInterval && typeof cleaningInterval !== "number") throw new Error(`Invalid session cleaning interval: ${cleaningInterval}`);
        super();
        this.name = name;
        this.cleaningInterval = cleaningInterval ?? 0;

        if (cleaningInterval) {
            if (cleaningInterval < 0) throw new RangeError(`Session cleaning interval must be a positive number`);
            if (cleaningInterval > 0) {
                setInterval(() => {
                    for (const [id, session] of this) {
                        if (Date.now() - session.lastUse > session.maxAge * 60 * 1000) {
                            this.delete(id);
                        }
                    }
                }, cleaningInterval * 60 * 1000);
            }
        }

        this.cookieName = `${this.name}_SESSION_ID`;
    }

    name;
    cleaningInterval;

    set() { throw new Error("SessionCollection doesn't use the method set. Add Sessions via SessionCollection.add()") }

    add(session) {
        if (session instanceof SessionConstructor) {
            super.set(session.id, session);
        } else {
            throw new TypeError(`SessionCollection only accepts Session instances`);
        }
    }

    start(request, response, maxAge) {
        return Session(this, request, response, maxAge)
    }
};

SessionConstructor.Collection = Session.Collection;
Session.Constructor = SessionConstructor;

protect(Session);
protect(Session.Collection);
protect(SessionConstructor);
protect(Session.Constructor);

module.exports = Session;