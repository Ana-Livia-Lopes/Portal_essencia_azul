var Component = ( function() {
    const componentRegExp = /\<component\s?([^\/]*)\s?\/\>/;
    const attrRegExp = /([^=]+)=["']?([^"']+)["']?/;
    const fs = require("fs");
    const validstr = require("../base/string_valid.js");
    const Property = require("../property.js");

    async function replaceComponents(html = "", components, pageParameters) {
        let replacedHtml = html;
    
        while (componentRegExp.test(replacedHtml)) {
            let componentAttrs = replacedHtml.match(componentRegExp)[1]?.trim();
            // replacedHtml = replacedHtml.replace(componentRegExp, "");
            
            let attrObject = {};
    
            while (attrRegExp.test(componentAttrs)) {
                let attr = componentAttrs.match(attrRegExp);
                componentAttrs = componentAttrs.replace(attrRegExp, "");
    
                let key = attr[1]?.trim();
                let value = attr[2]?.trim();
    
                attrObject[key] = value;
            }

            if (attrObject?.name) {
                let component = components.get(attrObject.name);
                if (component) {
                    let componentHtml = await component.open(attrObject, pageParameters);
                    replacedHtml = replacedHtml.replace(componentRegExp, componentHtml);
                } else {
                    replacedHtml = replacedHtml.replace(componentRegExp, `<p>Component ${attrObject.name} not found</p>`);
                }
            }
        }

        return replacedHtml;
    }

    const Types = ["hypertext", "execute"];

    class Component {
        constructor(name, filelocation, type = "hypertext") {
            if (!validstr(name, "blockEmpty", "blockArrays", "blockNumbers")) throw new TypeError("Component name must be a valid string");
            if (!fs.existsSync(filelocation)) throw new TypeError("Component file location must be a valid path to a file");
            if (!Types.includes(type)) throw new TypeError(`Component type must be one of ${Types.join(", ")}`);

            this.name = String(name);
            this.filelocation = String(filelocation);
            this.type = String(type);

            Property.set(this, "name", "freeze", "lock");
            Property.set(this, "filelocation", "freeze", "lock");
            Property.set(this, "type", "freeze", "lock");
        }

        name;
        filelocation;
        type;

        async open(parameters, pageParameters) {
            try {
                switch (this.type) {
                    case "hypertext":
                        return await openFS(this, pageParameters?.server?.cacheContent);
                    case "execute":
                        return await openExecute(this, pageParameters?.server?.cacheContent)(parameters, pageParameters);
                    default:
                        throw new TypeError(`Component ${this.name} type is not supported`);
                }
            } catch (err) {
                return `<p>Error (${err?.name}) opening ${this.name} component: ${err?.message}</p>`
            }
        }
    }

    const componentsCache = new Map();

    async function openFS(component, cache = true) {
        if (cache) {
            if (componentsCache.has(component)) return componentsCache.get(component);
        }
        if (cache) componentsCache.set(component, component.filelocation);
        return await fs.promises.readFile(component.filelocation);
    }

    function openExecute(component, cache) {
        if (cache) {
            if (componentsCache.has(component)) return componentsCache.get(component);
        }
        delete require.cache[require.resolve(component.filelocation)];
        const result = require(component.filelocation);
        if (cache) componentsCache.set(component, result);
        return result;
    }

    /**
     * @type {WeakMap<ComponentCollection, Map<string, Component>>}
     */
    const privateCompCollections = new WeakMap();

    class ComponentCollection {
        constructor() {
            privateCompCollections.set(this, new Map());
        }

        add(...components) {
            const map = privateCompCollections.get(this);
            for (const component of components) {
                if (component instanceof Component) {
                    map.set(component.name, component);
                }
            }
        }

        remove(...components) {
            const map = privateCompCollections.get(this);
            for (const component of components) {
                if (component instanceof Component) {
                    map.delete(component.name);
                } else if (typeof component === "string") {
                    map.delete(component);
                }
            }
        }

        async load(html, pageParameters) {
            if (typeof html !== "string") throw new TypeError("html must be a string");
            const components = privateCompCollections.get(this);

            return await replaceComponents(html, components, pageParameters);
        }

        *keys() {
            yield* privateCompCollections.get(this).keys();
        }

        *values() {
            yield* privateCompCollections.get(this).values();
        }

        *entries() {
            yield* privateCompCollections.get(this).entries();
        }

        get length() {
            return privateCompCollections.get(this).size;
        }

        *[Symbol.iterator]() {
            yield* this.entries();
        }
    }

    Component.Collection = ComponentCollection;

    require("../namespace.js")(Component, "Component");

    return Component;
} )();

module.exports = Component;