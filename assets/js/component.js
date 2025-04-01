export default async function component(name, parameters, { outputElement, ignoreCache = false }) {
    const headers = new Headers();

    headers.set("x-get-component", "true");
    headers.set("x-get-component-parameters", parameters ? JSON.stringify(parameters) : "{}");

    if (!window.componentsCache) window.componentsCache = new Map();
    const cache = window.componentsCache.get(name);
    let component;

    if (cache && !ignoreCache) {
        component = cache;
    } else {
        component = await (await fetch(`/${name}`, {
            headers
        })).text();
        window.componentsCache.set(name, component);
    }
    
    if (outputElement && (outputElement instanceof HTMLElement)) {
        outputElement.innerHTML = component;
    }

    return component;
}