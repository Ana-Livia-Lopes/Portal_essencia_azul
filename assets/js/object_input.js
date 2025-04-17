class ObjectInput {
    constructor(container, fields = {}) {
        if (!(container instanceof HTMLElement)) throw new Error("container must be an HTMLElement");
        
        fields = { ...fields }
        const currentValues = {};
        
        container.value = new Proxy(currentValues, {
            get(target, property) {
                return fields[property].value;
            }
        });
        for (const [name, field] of Object.entries(fields)) {
            currentValues[name] = field.value;
        }
        Object.defineProperty(container, "value", {
            writable: false,
            configurable: false
        });
    }
}

export default ObjectInput;