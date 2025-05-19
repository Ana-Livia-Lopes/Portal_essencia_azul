const http = require("http");
const url = require("url");
const fs = require("fs");
const Page = require("./page.js");
const Session = require("./session.js");
const Component = require("./component.js");
const Cookie = require("../util/cookie.js");
const { ServerError, NotFoundError, ImplementationError, ClientError } = require( "./errors.js" );
const { protect } = require( "../util/" );
const Watcher = require( "./watcher.js" );
const Body = require("./body.js");

const emptyPagePlaceholder = new Page._Placeholder();

const loadComponentPage = new Page._Placeholder();

const bodyAllowedMethods = ["POST", "PUT", "PATCH"];

class Server extends http.Server {
    constructor(options) {
        super(options ?? {}, async (request, response) => {
            try {
                const parsedUrl = url.parse(request.url);
                const pathname = parsedUrl.pathname;

                let [ page, urlparams ] = this.pages.match(pathname);
                if (request.headers["x-get-component"] === "true") {
                    page = loadComponentPage;
                    try {
                        urlparams = JSON.parse(request.headers["x-get-component-params"]);
                    } catch(err) {
                        urlparams = {};
                    }
                }

                const parameters = {
                    server: this,
                    request,
                    response,
                    content: new Page.Content(),
                    // session: Session(this.sessions, request, response),
                    session: this.getSession(request),
                    page,
                };

                try {
                    if (!page) throw NotFoundError(response, `Page not found at ${pathname}`);

                    switch (page._type) {
                        case "screen":
                        case "placeholder":
                        case "executable":
                        case "rest":
                            parameters.query = Cookie.parse(parsedUrl.query?.replaceAll("&", ";") ?? "");
                            parameters.body = bodyAllowedMethods.includes(request.method) ? await Body.get(request, response) : null;
                            parameters.page = page;
                            parameters.params = urlparams;
                            parameters.localhooks = {};

                            break;
                        case "asset":

                            break;
                        default:
                            throw ImplementationError(response, "Page type not implemented");
                    }

                    parameters.content.contentType = page.contentType;

                    if (parameters.body?.error) throw ClientError(response, parameters.body.error?.message);

                    await page.load(parameters);
                } catch (err) {
                    parameters.error = err;
                    
                    await emptyPagePlaceholder._emitEvent("error", parameters);
                }

                parameters.content.write(response, page, parameters._stop);

            } catch (err) {
                console.log(err);
                // response.write(`${err?.name ?? "Error"}: ${err?.message}`);
            } finally {
                response.end();
            }
        });
    }

    pages = new Page.Router();
    sessions = new Session.Collection("HTTP");
    components = new Component.Collection();
    watchers = new Set();

    watchPages(dir, handlerConfigs) {
        if (!fs.existsSync(dir)) throw new Error(`Cannot watch directory ${dir} (does not exist)`);
        if (!fs.statSync(dir).isDirectory()) throw new Error(`Cannot watch ${dir} (not a directory)`);

        const handlers = [];
        for (const handlerConfig of handlerConfigs) {
            const fileConfigs = {
                extensions: handlerConfig.extensions,
                configFile: handlerConfig.configFile,
                ignorePrivates: handlerConfig.ignorePrivates
            }
            handlers.push(new Watcher.Handler.Page(fileConfigs, handlerConfig.type, this.pages, handlerConfig.names));
        }
        
        const watcher = new Watcher(dir, handlers);
        this.watchers.add(watcher);
        return watcher;
    }

    watchComponents(dir, handlerConfigs) {
        if (!fs.existsSync(dir)) throw new Error(`Cannot watch directory ${dir} (does not exist)`);
        if (!fs.statSync(dir).isDirectory()) throw new Error(`Cannot watch ${dir} (not a directory)`);

        const handlers = [];
        for (const handlerConfig of handlerConfigs) {
            const fileConfigs = {
                extensions: handlerConfig.extensions,
                configFile: handlerConfig.configFile,
                ignorePrivates: handlerConfig.ignorePrivates
            }
            handlers.push(new Watcher.Handler.Component(fileConfigs, handlerConfig.type, this.components, handlerConfig.names));
        }

        const watcher = new Watcher(dir, handlers);
        this.watchers.add(watcher);
        return watcher;
    }

    watchEvents(dir, handlerConfigs) {
        if (!fs.existsSync(dir)) throw new Error(`Cannot watch directory ${dir} (does not exist)`);
        if (!fs.statSync(dir).isDirectory()) throw new Error(`Cannot watch ${dir} (not a directory)`);

        const handlers = [];
        for (const handlerConfig of handlerConfigs) {
            const fileConfigs = {
                ignorePrivates: handlerConfig.ignorePrivates
            }
            handlers.push(new Watcher.Handler.Event(fileConfigs, handlerConfig.names));
        }

        const watcher = new Watcher(dir, handlers);
        this.watchers.add(watcher);
        return watcher;
    }

    getSession(request) {
        const cookies = Cookie.parse(request.headers.cookie);
        if (this.sessions.has(cookies[this.sessions.cookieName])) {
            return this.sessions.get(cookies[this.sessions.cookieName]);
        }
        return null;
    }

    startSession(parameters) {
        const cookies = Cookie.parse(parameters.request.headers.cookie);
        if (this.sessions.has(cookies[this.sessions.cookieName])) {
            return this.sessions.get(cookies[this.sessions.cookieName]);
        }
        const session = new Session(this.sessions, parameters.request, parameters.response);
        parameters.session = session;
        return session;
    }

    destroySession(session, response) {
        if (session instanceof Session.Constructor) {
            this.sessions.delete(session.id);
            response.setHeader("Set-Cookie", `${this.sessions.cookieName}=; Max-Age=0; Path=/`);
        } else {
            throw new TypeError(`Session must be an instance of Session`);
        }
    }

    static {
        protect(this);
        protect(this.prototype, Object.getOwnPropertyNames(this.prototype));
    }
}

module.exports = Server;