const chokidar = require("chokidar");
const fs = require("fs");
const { protect } = require( "../util/" );
const Page = require( "./page.js" );
const path = require( "path" );
const Component = require( "./component.js" );
const Event = require("./event.js");

const PrivateMethodSymbol = Symbol("PrivateMethodSymbol");

class WatcherHandler extends Map { // filepath => element
    constructor(files) {
        super();
        if (new.target === WatcherHandler) throw new TypeError("Cannot construct abstract class WatcherHandler");

        if (files) {
            if (typeof files !== "object") throw new TypeError("files output config must be an object");
            if (files.extensions) {
                if (!Array.isArray(files.extensions)) throw new TypeError("files extensions must be insine an array");
                if (files.extensions.includes("*") || files.extensions.length === 0) {
                    this.files.extensions = "*";
                } else {
                    for (const ext of files.extensions) {
                        if (typeof ext !== "string") throw new TypeError(`files extensions must be strings`);
                        if (!ext.startsWith(".")) throw new TypeError(`files extensions must start with a dot`);
    
                        this.files.extensions.push(ext);
                    }
                }
            } else { this.files.extensions = "*" }
            if (files.configFile) {
                if (typeof files.configFile !== "string") throw new TypeError("files configFile must be a string");
                if (!files.configFile.endsWith(".json")) throw new TypeError("files configFile must be a JSON file");
                this.files.configFile = files.configFile;
            }
            if (files.ignorePrivates) {
                if (typeof files.ignorePrivates !== "boolean") throw new TypeError("files ignorePrivates must be a boolean");
                this.files.ignorePrivates = files.ignorePrivates;
            }
        }
        Object.freeze(this.files);
    }

    files = {
        extensions: [],
        configFile: "_.json",
        ignorePrivates: true,
    };
    names = {};
    
    set(key, value, passkey) {
        if (passkey !== PrivateMethodSymbol) throw new TypeError("Cannot manually set a element to the handler storage");
        super.set(key, value);
    }

    unset(key, passkey) {
        if (passkey !== PrivateMethodSymbol) throw new TypeError("Cannot manually unset a element to the handler storage");
        super.delete(key);
    }

    add(dir, file, stat) {}
    delete(dir, file, stat) {}

    clear(key) {
        if (key !== PrivateMethodSymbol) throw new TypeError("Cannot manually clear a element to the handler storage");
        super.clear();
    }

    reload(dir) {
        const files = [ ...this.keys() ];
        console.log("Reloading")
        for (const file of files) {
            console.log("Removing", dir);
            this.delete(dir, file);
        }
        const addBackCallback = () => {
            for (const file of files) {
                console.log("Adding", dir);
                this.add(dir, file);
            }
        }
        return addBackCallback;
    }
    
    static Page = class PageWatcherHandler extends WatcherHandler {
        constructor(files, pageType, collection, names) {
            super(files);

            if (!pageType) throw new TypeError("pageType is required");
            if (typeof pageType !== "string") throw new TypeError("pageType must be a string");
            if (!Page._PublicTypes.includes(pageType.toLowerCase())) throw new TypeError(`pageType must be one of ${Page._PublicTypes.join(", ")}`);
            this._pageTypeConstructor = Page._PublicTypesConstructors[pageType.toLowerCase()];

            if (!collection) throw new TypeError("collection is required");
            if (!(collection instanceof Page.Router)) throw new TypeError("collection must be an instance of Page.Collection");
            this.collection = collection;

            if (names) {
                if (typeof names !== "object") throw new TypeError("names output config must be an object");
                if (names.prefix) {
                    if (typeof names.prefix !== "string") throw new TypeError("names prefix must be a string");
                    this.names.prefix = names.prefix;
                }
                if (names.extension) {
                    if (typeof names.extension !== "boolean") throw new TypeError("names extension must be a boolean");
                    this.names.extension = names.extension;
                }
            }

            Object.freeze(this.names);
            protect(this);
        }

        _pageTypeConstructor;
        collection;
        names = {
            prefix: "",
            extension: false
        }

        add(dir, file) {
            const pathParsed = path.parse( path.join("/", path.relative(dir, file)) );
            
            const configFile = path.resolve(dir, this.files.configFile);
            if (configFile === file) return;
            if (pathParsed.name.startsWith("_") && this.files.ignorePrivates) return;
            
            if (this.files.extensions.includes(pathParsed.ext) || this.files.extensions === "*") {
                let pagePath = path.join("/", this.names.prefix, pathParsed.dir, this.names.extension ? pathParsed.base : pathParsed.name).replaceAll("\\", "/");
                
                let config;
                if (fs.existsSync(configFile)) {
                    const configFileContent = require(configFile);
                    config = configFileContent[path.relative(dir, file).replaceAll("\\", "/")];
                }

                let paths = [];
                let pageConfigs = {};
                if (config) {
                    if (config.paths) paths = config.paths.map(singlePath => path.join(this.names.prefix, singlePath).replaceAll("\\", "/"));
                    if (config.includesFileName ?? true) paths.push(pagePath);
                    else if (paths.length === 0) paths.push(pagePath);
                    if (config.contentType) pageConfigs.contentType = config.contentType;
                    if (config.events) {
                        pageConfigs.events = {};
                        for (let [ eventName, callbackNames ] of Object.entries(config.events)) {
                            if (!Array.isArray(callbackNames)) callbackNames = [ callbackNames ];
                            pageConfigs.events[eventName] = callbackNames.map(name => new Event.Getter(name));
                        }
                    }
                } else { paths.push(pagePath) }

                const page = new this._pageTypeConstructor(paths, file, pageConfigs);
                super.set(file, page, PrivateMethodSymbol);

                const [ existingPage ] = this.collection.match(pagePath);
                if (existingPage) {
                    if (!fs.existsSync(existingPage.file)) {
                        this.collection.delete(pagePath);
                    }
                }

                this.collection.add(page);
                // console.log(`Adding page ${pagePath} from ${file} (${paths.length})`);
                return page;
            }
        }

        delete(dir, file) {
            const pathParsed = path.parse( path.join("/", path.relative(dir, file)) );

            if (path.join(dir, this.files.configFile) === file) return;
            if (pathParsed.name.startsWith("_") && this.files.ignorePrivates) return;

            if (this.files.extensions.includes(pathParsed.ext) || this.files.extensions === "*") {
                const pagePath = path.join("/", this.names.prefix, pathParsed.dir, this.names.extension ? pathParsed.base : pathParsed.name).replaceAll("\\", "/");
                const page = this.collection.match(pagePath)[0];
                if (page) this.collection.delete(page);
                super.unset(file, PrivateMethodSymbol);
                // console.log(`Removing page ${pagePath} from ${file} (${!!page})`);
            }
        }
    }

    static Component = class ComponentWatcherHandler extends WatcherHandler {
        constructor(files, componentType, collection, names) {
            super(files);

            if (!componentType) throw new TypeError("componentType is required");
            if (typeof componentType !== "string") throw new TypeError("componentType must be a string");
            if (!Component._PublicTypes.includes(componentType.toLowerCase())) throw new TypeError(`componentType must be one of ${Component._PublicTypes.join(", ")}`);
            this._componentTypeConstructor = Component._PublicTypesConstructors[componentType.toLowerCase()];

            if (!collection) throw new TypeError("collection is required");
            if (!(collection instanceof Component.Collection)) throw new TypeError("collection must be an instance of Component.Collection");
            this.collection = collection;

            if (names) {
                if (typeof names !== "object") throw new TypeError("names output config must be an object");
                if (names.prefix) {
                    if (typeof names.prefix !== "string") throw new TypeError("names prefix must be a string");
                    this.names.prefix = names.prefix;
                }
            }

            Object.freeze(this.names);
            protect(this);
        }

        _componentTypeConstructor;
        collection;
        names = {
            prefix: ""
        }

        add(dir, file) {
            const pathParsed = path.parse( path.join("/", path.relative(dir, file)) );

            if (path.join(dir, this.files.configFile) === file) return;
            if (pathParsed.name.startsWith("_") && this.files.ignorePrivates) return;

            if (this.files.extensions.includes(pathParsed.ext) || this.files.extensions === "*") {
                const pathPrefixes = pathParsed.dir.slice(1).split("\\").join("-");
                const componentName = (this.names.prefix + pathPrefixes + (pathPrefixes ? "-" : "") + pathParsed.name);

                const component = new this._componentTypeConstructor(componentName, file);
                super.set(file, component, PrivateMethodSymbol);

                this.collection.add(component);
                // console.log(`Adding component ${componentName} from ${file}`);
                return component;
            }
        }

        delete(dir, file) {
            const pathParsed = path.parse( path.join("/", path.relative(dir, file)) );

            if (path.join(dir, this.files.configFile) === file) return;
            if (pathParsed.name.startsWith("_") && this.files.ignorePrivates) return;

            if (this.files.extensions.includes(pathParsed.ext) || this.files.extensions === "*") {
                const componentName = (this.names.prefix + pathParsed.name);
                if (this.collection.get(componentName)[0]?.file === file) this.collection.delete(componentName);
                super.unset(file, PrivateMethodSymbol);
                // console.log(`Removing component ${componentName} from ${file}`);
            }
        }
    }

    static Event = class EventWatcherHandler extends WatcherHandler {
        constructor(files, names) {
            const superFiles = {
                extensions: [ ".js" ]
            };
            if (files) {
                if (typeof files !== "object") throw new TypeError("files output config must be an object");
                if (files.ignorePrivates) {
                    if (typeof files.ignorePrivates !== "boolean") throw new TypeError("files ignorePrivates must be a boolean");
                    superFiles.ignorePrivates = files.ignorePrivates;
                }
            }
            super(superFiles);

            if (names) {
                if (typeof names !== "object") throw new TypeError("names output config must be an object");
                if (names.prefix) {
                    if (typeof names.prefix !== "string") throw new TypeError("names prefix must be a string");
                    this.names.prefix = names.prefix;
                }
            }

            Object.freeze(this.names);
        }

        names = {
            prefix: ""
        };

        add(dir, file) {
            const pathParsed = path.parse(path.join("/", path.relative(dir, file)));

            if (pathParsed.name.startsWith("_") && this.files.ignorePrivates) return;

            if (this.files.extensions.includes(pathParsed.ext)) {
                const eventName = (this.names.prefix + pathParsed.name);

                const event = new Event(eventName, file);
                super.set(file, event, PrivateMethodSymbol);

                // console.log(`Adding event ${eventName} from ${file}`);
                return event;
            }
        }

        delete(dir, file) {
            const pathParsed = path.parse(path.join("/", path.relative(dir, file)));

            if (pathParsed.name.startsWith("_") && this.files.ignorePrivates) return;

            if (this.files.extensions.includes(pathParsed.ext)) {
                const eventName = (this.names.prefix + pathParsed.name);
                Event.remove(eventName);
                super.unset(file, PrivateMethodSymbol);
                // console.log(`Removing event ${eventName} from ${file}`);
            }
        }
    }
}

function addElement(file) {
    for (const handler of this.values()) {
        handler.add(this.dir, file);
    }
}

function removeElement(file) {
    for (const handler of this.values()) {
        handler.delete(this.dir, file);
    }
}

function updateConfigFile(file) {
    // mapeia os handlers para verificar se o arquivo editado é o arquivo de configuração.
    // se for o arquivo de configuração, reinstancia todos os elementos.

    const configFor = [];
    for (const handler of this.values()) {
        if (path.join(this.dir, handler.files.configFile) === file) {
            configFor.push(handler);
        }
    }

    if (configFor.length === 0) return;

    const addBackCallbacks = [];

    for (const handler of configFor) {
        const addBackCallback = handler.reload(this.dir);
        if (addBackCallback) addBackCallbacks.push(addBackCallback);
    }

    for (const addBackCallback of addBackCallbacks) {
        addBackCallback();
    }
}

class Watcher extends Set {
    constructor(dir, ...handlers) {
        super();
        handlers = handlers.flat();
        for (const handler of handlers) this.add(handler);

        if (!fs.existsSync(dir)) throw new Error(`Directory ${dir} does not exist`);
        if (!fs.statSync(dir).isDirectory()) throw new Error(`${dir} is not a directory`);

        this.dir = dir;

        this.watcher = chokidar.watch(dir, { persistent: true })
            .on("unlink", removeElement.bind(this))
            .on("add", addElement.bind(this))
            .on("change", updateConfigFile.bind(this));
    }

    add(handler) {
        if (handler instanceof WatcherHandler) {
            for (const oldHandler of this.values()) {
                for (const existingExt of oldHandler.files.extensions) {
                    if (handler.files.extensions.includes(existingExt)) {
                        throw new TypeError(`Two existing handlers have the same extension: ${existingExt}`);
                    }
                }
            }
            super.add(handler);
        } else {
            throw new TypeError("Handler must be an instance of WatcherHandler");
        }
    }

    reload() {
        for (const handler of this.values()) {
            for (const file of handler.keys()) {
                removeElement.call(this, file);
                addElement.call(this, file);
            }
        }
    }

    close() {
        this.watcher.close();
        for (const handler of this.values()) {
            handler.clear(PrivateMethodSymbol);
        }
        super.clear();
    }

    *elements() {
        for (const handler of this.values()) {
            yield* handler.value();
        }
    }

    dir;
    watcher;

    static Handler = WatcherHandler;

    static {
        protect(this);
        protect(this.Handler);
    }
}

module.exports = Watcher;