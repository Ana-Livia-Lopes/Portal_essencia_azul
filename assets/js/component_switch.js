import getComponent from "/js/component.js";

class ComponentSwitch {
    constructor(targetElement, { ignoreCache, defaultParameters } = {}) {
        if (!(targetElement instanceof HTMLElement)) throw new Error("targetElement must be an HTMLElement");
        this.targetElement = targetElement;
        if (ignoreCache) this.ignoreCache = true;

        if (defaultParameters) {
            this.defaultParameters = Object(defaultParameters);
        }
    }

    targetElement;
    ignoreCache = false;
    defaultParameters = {};

    change(componentName, parameters) {
        getComponent(
            componentName,
            { ...this.defaultParameters, ...parameters },
            { ignoreCache: this.ignoreCache, outputElement: this.targetElement }
        );
        return this;
    }

    setChangeButton(buttonElement, componentName, parameters) {
        if (!(buttonElement instanceof HTMLElement)) throw new Error("buttonElement must be an HTMLElement");
        buttonElement.addEventListener("click", () => this.change(componentName, parameters));
        return this;
    }
}

export default ComponentSwitch;