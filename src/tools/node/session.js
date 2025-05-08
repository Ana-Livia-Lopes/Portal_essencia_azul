const crypto = require("crypto");
const Property = require("../property.js");
const TypedMap = require("../collections/typedmap.js");
const validstr = require("../base/string_valid.js");
const Cookie = require("../util/cookie.js");
const http = require("http");

var Session = ( function() {
    const privateLastUses = new WeakMap();
    const privateCollectionConfigs = new WeakMap();
    const privateCollectionIntervals = new WeakMap();

    function renew(session) {
        privateLastUses.set(session, Date.now());
    }

    const Session = class Session extends Map {
        constructor(request, response, collection) {
            super();

            if (!(collection instanceof Session.Collection)) throw new TypeError("Sessions must be in a SessionCollection");

            if (request) {
                const cookies = Cookie.parse(request.headers.cookie);
                const possibleId = cookies[collection.cookieKeyName];
                const possibleSession = collection.get(possibleId);
                if (possibleSession) return possibleSession;
            }

            if (!(response instanceof http.ServerResponse)) throw new TypeError("Sessions can only be created with a response object");

            do {
                this.id = crypto.randomBytes(8).toString("hex");
            } while (collection.has(this.id));

            collection.insert(this);

            Property.set(this, "id", "freeze", "lock");

            try {
                response.setHeader("Set-Cookie", `${collection.cookieKeyName}=${this.id}; Path=/; HttpOnly`);
            } catch(err) {
                console.error(`Erro ao criar sessão: ${err?.message}`);
            }
        }

        id;

        get lastUse() { return privateLastUses.get(this); }

        renew() { renew(this) }

        get [Symbol.toStringTag]() {  }
        toString() { return `[Session: ${this.id}]` }

        static Collection = class SessionCollection extends TypedMap {
            constructor(name, { maxAge, cleaningInterval } = { }) {
                super(Session, String);
                if (!validstr(name, "blockEmpty", "onlyAlphaNumeric"));
                this.name = String(name);

                if (typeof maxAge !== "undefined") {
                    if (!Number.isSafeInteger(maxAge)) throw new TypeError("maxAge must be a safe integer");
                    if (maxAge < 60 * 60 * 1000) throw new RangeError("maxAge must be at least 1 hour");
                }

                if (typeof cleaningInterval !== "undefined") {
                    if (!Number.isSafeInteger(cleaningInterval)) throw new TypeError("cleaningInterval must be a safe integer");
                    if (cleaningInterval < 60 * 1000) throw new RangeError("cleaningInterval must be at least 1 minute");
                }

                privateCollectionConfigs.set(this, {
                    maxAge,
                    cleaningInterval
                });

                if (cleaningInterval && maxAge) this.setCleaningInterval();

                Property.set(this, "name", "freeze", "lock");
                Property.set(this, "id", "freeze", "lock");
            }

            name;
            id = crypto.randomBytes(4).toString("hex");

            get maxAge() { return privateCollectionConfigs.get(this).maxAge }
            get cleaningInterval() { return privateCollectionConfigs.get(this).cleaningInterval }

            get cookieKeyName() { return encodeURIComponent(`${this.name}_SESSION_ID`) }

            insert(session) {
                if (!this.checkType(session, "value")) throw new TypeError("you can only add Session instances to a SessionCollection");
                this.set(session.id, session);
            }

            clear(maxAge = this.maxAge) {
                if (!Number.isSafeInteger(maxAge)) throw new TypeError("maxAge must be a safe integer");
                if (maxAge < 0) throw new RangeError("maxAge must be a positive integer");
                let currentAllowedLastUse = Date.now() - maxAge;
                for (const [ id, session ] of this.entries()) {
                    if (session.lastUse < currentAllowedLastUse) this.delete(id);
                }
            }

            setCleaningInterval(interval = this.cleaningInterval, maxAge = this.maxAge) {
                if (!Number.isSafeInteger(interval)) throw new TypeError("interval must be a safe integer");
                if (interval < 0) throw new RangeError("interval must be a positive integer");

                if (!Number.isSafeInteger(maxAge)) throw new TypeError("maxAge must be a safe integer");
                if (maxAge < 0) throw new RangeError("maxAge must be a positive integer");

                privateCollectionIntervals.set(this, setInterval(this.clear, interval, maxAge));
            }

            unsetCleaningInterval() {
                const intervalId = privateCollectionIntervals.get(this);
                if (intervalId) clearInterval(intervalId);
            }
        }
    }

    return Session;
} )();

module.exports = Session;