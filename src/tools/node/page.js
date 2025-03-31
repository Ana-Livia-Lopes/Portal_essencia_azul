const path = require("path");
const fs = require("fs");
const Property = require("../property.js");
const { TypedMap, TypedSet } = require("../collections");
const chokidar = require("chokidar");

var Page = ( function() {
    const defaultContentTypesForEXT = {
        ".js": "text/javascript",
        ".html": "text/html",
        ".css": "text/css",
        ".json": "application/json",
        ".xml": "application/xml",
        ".svg": "image/svg+xml",
        ".jpeg": "image/jpeg",
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".bmp": "image/bmp",
        ".webp": "image/webp",
        ".ico": "image/x-icon",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".pdf": "application/pdf",
        ".zip": "application/zip",
        ".tar": "application/x-tar",
        ".gz": "application/gzip",
        ".rar": "application/vnd.rar",
        ".7z": "application/x-7z-compressed",
        ".exe": "application/x-msdownload",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".xls": "application/vnd.ms-excel",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }

    const contentTypes = [
        "text/html", "text/plain", "text/css", "text/javascript", "application/json",
        "application/xml", "application/octet-stream", "image/png", "image/jpeg",
        "image/svg+xml", "image/gif", "image/webp", "image/x-icon", "image/vnd.microsoft.icon",
        "image/vnd.wap.wbmp", "image/bmp", "image/tiff", "image/x-xbitmap", "image/vnd.djvu",
        "image/x-portable-pixmap", "image/x-portable-anymap", "image/x-portable-bitmap",
        "image/x-portable-graymap", ""
    ];

    const pageTypes = [
        "hypertext",
        "execute"
    ];

    const paramRegExp = /\[([^\]]+)\]/g;

    function validChunk(chunk) {
        if (typeof chunk === "string") return true;
        if (chunk instanceof Buffer) return true;
        return false;
    }

    const privateCollectionMaps = new WeakMap();

    /** @type {Map<string, chokidar.FSWatcher>} */
    const chokidarWatchers = new Map();

    const Page = class Page {
        constructor(filelocation, pagelocation, pageType = "hypertext", contentType, { statusCode, flags, events } = {}) {
            if (typeof filelocation !== "string") throw new TypeError("File location must be a string");
            if (typeof pagelocation !== "string") throw new TypeError("Page location must be a string");
            if (!pageTypes.includes(pageType)) throw new TypeError("Page type must be either 'hypertext' or 'execute'");

            const parsedLocation = path.parse(filelocation);

            if (!contentType) contentType = defaultContentTypesForEXT[parsedLocation.ext];
            if (!contentTypes.includes(contentType)) contentType = "text/plain";

            pagelocation = pagelocation.replaceAll("\\", "/");
            if (!pagelocation.startsWith("/")) pagelocation = "/" + pagelocation;

            if (!fs.existsSync(filelocation)) {
                console.error(new Error(`File does not exist: ${filelocation}`));
                this._valid = false;
                return;
            }

            this.filename = parsedLocation.base;
            this.filelocation = filelocation;
            this.path = pagelocation;
            this.contentType = contentType;
            this.pageType = pageType;

            if (statusCode) {
                if (typeof statusCode !== "number") throw new TypeError("Status code must be a number");
                if (statusCode < 100 || statusCode > 599) throw new TypeError("Status code must be between 100 and 599");
                this.statusCode = statusCode;
            }

            if (flags) {
                if (!(flags instanceof Array)) throw new TypeError("Flags must be an array");
                for (const flag of flags) {
                    if (typeof flag !== "symbol") throw new TypeError("Flags must be symbols");
                    if (Object.values(Page.Flags).includes(flag)) this.flags.push(flag);
                }
            }

            if (events) {
                if (!(flags instanceof Object)) throw new TypeError("Events must be an object");
                let eventsbefore = events.before;
                let eventsafter = events.after;
                if (events.before) {
                    if (typeof eventsbefore === "function") eventsbefore = [ eventsbefore ];
                    for (const event of eventsbefore) {
                        if (typeof event !== "function") throw new TypeError("events.before event must be a callback or a callback array");
                        this.events.before.push(event);
                    }
                }
                if (events.after) {
                    if (typeof eventsafter === "function") eventsafter = [ eventsafter ];
                    for (const event of eventsafter) {
                        if (typeof event !== "function") throw new TypeError("events.after event must be a callback or a callback array");
                        this.events.after.push(event);
                    }
                }
            }

            Property.set(this, "filename", "freeze", "lock");
            Property.set(this, "filelocation", "freeze", "lock");
            Property.set(this, "path", "freeze", "lock");
            Property.set(this, "contentType", "freeze", "lock");
            Property.set(this, "pageType", "freeze", "lock");
            Property.set(this, "statusCode", "freeze", "lock");
            Property.set(this, "flags", "freeze", "lock");
            Object.freeze(this.flags);
            Property.set(this, "events", "freeze", "lock");
            Object.freeze(this.events);
            Property.set(this, "_valid", "hide", "freeze", "lock");
        }

        filename;
        filelocation;
        path;
        contentType;
        statusCode;
        pageType;
        flags = [];
        events = {
            before: [],
            after: []
        };

        _valid = true;

        async load({ query, body, params, session, server, content, page, request, response, components, localhooks } = { }, apis = {}) {
            if (this.events.before) {
                try {
                    await this.events.before.forEach(async event => {
                        await event({ query, body, params, session, server, content, page, request, response, localhooks }, apis);
                    });
                } catch (err) {
                    console.error(err);
                }
            }

            if (this.contentType === "text/html") {
                const clientObjectsJSON = [];
                if (this.flags.includes(Page.Flags.HTMLClientParams)) {
                    clientObjectsJSON.push(`window.PARAMS = ${JSON.stringify(params)};\n`);
                }
                if (this.flags.includes(Page.Flags.HTMLClientQuery)) {
                    clientObjectsJSON.push(`window.QUERY = ${JSON.stringify(query)};\n`);
                }
                if (clientObjectsJSON.length > 0) {
                    content.append("<script id=\"server_objects_append_script\">\n", "before");
                    content.append(clientObjectsJSON.join(""), "before");
                    content.append("const server_objects_append_script = document.getElementById(\"server_objects_append_script\");\n", "before");
                    content.append("server_objects_append_script.parentElement.removeChild(server_objects_append_script);\n", "before");
                    content.append("</script>\n", "before");
                }
            }

            try {
                switch (this.pageType) {
                    default:
                    case "hypertext":
                        let data = await fs.promises.readFile(this.filelocation);
                        if (page?.contentType === "text/html") {
                            data = await components?.load(data.toString("utf-8"));
                        }
                        content.append(data);
                        return data;
                    case "execute":
                        delete require.cache[require.resolve(this.filelocation)];
                        const execute = require(this.filelocation);
                        const result = await execute({ query, body, params, session, server, content, page, request, response, components, localhooks }, apis);
                        if (result) content.append(result); 
                        return result;
                }
            } catch(err) {
                content.clear();
                content.append(`${err}`);
                console.error(`Error on loading page ${this.path}`, err);
            }

            if (this.events.after) {
                try {
                    await this.events.after({ query, body, params, session, server, content, page, request, response, localhooks }, apis);
                } catch (err) {
                    console.error(err);
                }
            }
        }

        match(url) {
            if (!url.startsWith("/")) url = "/" + url;
            if (this.path === url) return true;
            if (!this.path.endsWith("/")) {
                if (this.path + "/" === url) return true;
            } else {
                if (this.path === url + "/") return true;
            }
            return false;
        }

        static Flags = {
            HTMLClientQuery: Symbol.for("PageFlags.HTMLClientQuery"),
            HTMLClientParams: Symbol.for("PageFlags.HTMLClientParams")
        }

        static Special = class SpecialPage extends Page {
            constructor(filelocation, pagelocation, pageType, contentType, { statusCode, flags, events } = {}) {
                super(filelocation, pagelocation, pageType, contentType, { statusCode, flags, events });

                let pathRegExpMiddle = this.path.replace(paramRegExp, "([^/]+)");
                if (pathRegExpMiddle.endsWith("/")) pathRegExpMiddle += "?"; else pathRegExpMiddle += "/?";

                this.pathRegExp = new RegExp("^" + pathRegExpMiddle + "$");

                const params = this.path.match(this.pathRegExp).slice(1);

                this.paramNames = params.map(param => param.replace("[", "").replace("]", ""));

                Object.freeze(this.paramNames);
                Property.set(this, "paramNames", "freeze", "lock");
                Property.set(this, "pathRegExp", "freeze", "lock");
            }

            pathRegExp;
            paramNames;

            match(url, getParams) {
                if (!url.startsWith("/")) url = "/" + url;
                if (this.pathRegExp.test(url)) {
                    if (getParams) {
                        const params = {};

                        const match = url.match(this.pathRegExp).slice(1);

                        for (let i = 0; i < this.paramNames.length; i++) {
                            params[ this.paramNames[i] ] = match[i];
                        }

                        return params;
                    } else {
                        return true;   
                    }
                } else {
                    return false;
                }
            }
        }

        static LoadList(array, collection, pathCorrection) {
            if (!(array instanceof Array)) throw new TypeError("Page.List only work with an array");
            if (!(collection instanceof Page.Collection)) throw new TypeError("Page.List only work with a Page Collection");
            if (typeof pathCorrection !== "string") throw new TypeError("Path correction must be a string");

            const pages = [];

            let index = 0;
            for (const pageobj of array) {
                let constructor;
                let urltype = (pageobj.urltype ?? "default").toLowerCase();
                switch (urltype) {
                    case "special":
                    case "params":
                        constructor = Page.Special;
                        break;
                    case "default":
                    case "simple":
                    case "page":
                    case "commom":
                    default:
                        constructor = Page;
                        break;
                }
                let filelocation = pageobj.filelocation;
                if (typeof filelocation !== "string") { console.error(`Page.List of index ${index} is missing correct filelocation`); continue; }
                let pagelocation = pageobj.pagelocation;
                if (typeof pagelocation !== "string" && !(pagelocation instanceof Array)) { console.error(`Page.List of index ${index} is missing correct pagelocation`); continue; }
                pagelocation = typeof pagelocation === "string" ? [ pagelocation ] : pagelocation;
                let pagetype = pageobj.pagetype ?? "hypertext";
                let contenttype = pageobj.contenttype;
                let statuscode = pageobj.statuscode;
                let events = pageobj.events;

                let flags = [];
                const pageobjflags = pageobj.flags ? pageobj.flags.filter(fl => typeof fl === "string" ? true : false).map(fl => fl.toLowerCase()) : [];
                for (const [ flagName, flag ] of Object.entries(Page.Flags)) {
                    if (pageobjflags.includes(flagName.toLowerCase())) flags.push(flag);
                }

                pagelocation.forEach(pl => {
                    pages.push(new constructor(
                        path.join(pathCorrection, filelocation),
                        pl,
                        pagetype,
                        contenttype,
                        { statuscode, flags, events }
                    ));
                });
                index++;
            }

            collection.append(...pages);
        }

        static MapDir(dirpath, pathbase = "/", collection, syncChanges) {
            if (!(collection instanceof Page.Collection)) throw new TypeError("Collection needs to be a PageCollection instance");
            if (!fs.existsSync(dirpath)) {
                console.error(new Error(`No directory available in ${dirpath}`));
                return;
            }
            
            const dirStat = fs.statSync(dirpath);
            if (!dirStat.isDirectory()) {
                console.error(new Error(`Path ${dirpath} is not a directory`));
                return;
            }

            const files = fs.readdirSync(dirpath);

            const pages = [];

            for (const readingName of files) {
                const readingPath = path.join(dirpath, readingName);
                const readingStat = fs.statSync(readingPath);
                const pathbaseExtend = path.join(pathbase, readingName);

                if (readingStat.isFile()) {
                    pages.push(new Page(readingPath, pathbaseExtend, "hypertext"));
                }
                if (readingStat.isDirectory()) {
                    Page.MapDir(readingPath, pathbaseExtend, collection);
                }
            }

            collection.append(...pages);

            if (syncChanges) {
                const watcher = chokidar.watch(dirpath, { persistent: true, ignoreInitial: true });

                watcher.on("add", newpath => {
                    const newStat = fs.statSync(newpath);
                    if (newStat.isFile()) {
                        collection.append(new Page(
                            newpath,
                            path.join(pathbase, path.relative(dirpath, newpath)),
                            "hypertext"
                        ));
                        console.log("adding new page at " + newpath);
                    }
                });

                watcher.on("unlink", oldpath => {
                    collection.remove(path.join(pathbase, path.relative(dirpath, oldpath)).replaceAll("\\", "/"));
                    console.log("removing old page at " + oldpath);
                    // nao ta funcionando essa coisa, acho q é o collection remove
                });

                chokidarWatchers.set(dirpath, watcher);
            }
        }

        static Content = class PageContent {
            constructor() {}

            body = [];
            before = [];
            after = [];

            append(chunk, area = "body") {
                if (!validChunk(chunk)) throw new TypeError("Chunk must be a string or a buffer");
                switch (area) {
                    case "body":
                        this.body.push(chunk);
                        break;
                    case "before":
                        this.before.push(chunk);
                        break;
                    case "after":
                        this.after.push(chunk);
                        break;
                    default:
                        throw new TypeError("Area must be 'body', 'before', or 'after'");
                        break;
                }
            }

            clear(...areas) {
                if (areas.length === 0) {
                    this.body.length = 0;
                    this.before.length = 0;
                    this.after.length = 0;
                }
                for (const area of areas) {
                    switch (area) {
                        case "body":
                            this.body.length = 0;
                            break;
                        case "before":
                            this.before.length = 0;
                            break;
                        case "after":
                            this.after.length = 0;
                            break;
                        default:
                            throw new TypeError("Area must be 'body', 'before', or 'after'");
                    }
                }
            }

            write(response) {
                for (const chunk of this.before) {
                    response.write(chunk);
                }
                for (const chunk of this.body) {
                    response.write(chunk);
                }
                for (const chunk of this.after) {
                    response.write(chunk);
                }
            }
        }

        static Collection = class PageCollection {
            constructor(...pages) {
                privateCollectionMaps.set(this, {
                    all: new TypedMap(Page, String, true),
                    simple: new TypedMap(Page, String),
                    special: new TypedSet(Page.Special)
                });
                if (pages.length > 0) this.append(pages);
            }

            append(...pages) {
                const maps = privateCollectionMaps.get(this);
                for (const page of pages) {
                    if (page instanceof Page) {
                        if (!page._valid) {
                            console.error(new Error(`Invalid page: ${page.path}`));
                            continue;
                        }

                        for (const existingPage of maps.all.values()) {
                            if (existingPage.match(page.path)) {
                                console.error(new Error(`Page already exists: ${page.path}`));
                                continue;
                            }
                        }

                        maps.all.set(page.path, page);
                        if (page.constructor === Page) maps.simple.set(page.path, page);
                        if (page.constructor === Page.Special) maps.special.add(page);

                    } else {
                        throw new TypeError("Page Collections only accept Page instances");
                    }
                }
            }

            remove(...pages) {
                const maps = privateCollectionMaps.get(this);
                for (let page of pages) {
                    if (typeof page === "string") page = maps.all.get(page);
                    if (page instanceof Page) {
                        maps.all.delete(page.path);
                        maps.simple.delete(page.path);
                        maps.special.delete(page);
                    }
                }
            }

            match(url) {
                const maps = privateCollectionMaps.get(this);
                
                let page = null;
                let params = {};
                let pagetype = null;

                for (const specialPage of maps.special.values()) {
                    if (specialPage.match(url)) {
                        page = specialPage;
                        params = specialPage.match(url, true);
                        pagetype = "special";
                        break;
                    }
                }
                for (const simplePage of maps.simple.values()) {
                    if (simplePage.match(url)) {
                        page = simplePage;
                        pagetype = "simple";
                    }
                }

                return [ page, params, pagetype ];
            }

            clear() {
                const maps = privateCollectionMaps.get(this);
                maps.all.clear();
                maps.simple.clear();
                maps.special.clear();
            }

            get length() {
                return privateCollectionMaps.get(this).all.size;
            }

            *values() {
                for (const page of privateCollectionMaps.get(this).all.values()) {
                    yield page;
                }
            }
            *keys() {
                for (const key of privateCollectionMaps.get(this).all.keys()) {
                    yield key;
                }
            }
            *entries() {
                for (const entry of privateCollectionMaps.get(this).all.entries()) {
                    yield entry;
                }
            }
        }
    }

    Object.freeze(Page.Flags);
    Property.set(Page, "Flags", "freeze", "lock");

    return Page;
} )();

module.exports = Page;