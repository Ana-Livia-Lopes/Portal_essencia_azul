function listInputEvent(event) {
    if (event.key === "Enter") {
        if (event.target.value === "") return;
        const adjinput = createListInputTopic();
        event.target.insertAdjacentElement("afterend", adjinput);
        adjinput.focus();
        for (const input of event.target.parentElement.children) {
            if (input instanceof HTMLInputElement) input.dispatchEvent(new Event("input"));
        }
    }
    
    if (event.key === "Backspace") {
        if (event.target.index === 0) return;
        if (event.target.value.length === 0) event.preventDefault(); else return;
        for (const element of event.target.parentElement.children) {
            if (element instanceof HTMLInputElement && element.index === event.target.index - 1) {
                element.focus()
                break;
            }
        }

        const valuesCopy = [...event.target.parentElement.value];
        event.target.parentElement.value.length = 0;
        for (let i = 0; i < valuesCopy.length; i++) {
            if (event.target.index === i) continue;
            event.target.parentElement.value.push(valuesCopy[i]);
        }

        event.target.parentElement.removeChild(event.target);
    }
}

function indexGetter() {
    let index = 0;
    let it = 0;
    const container = this.parentElement;
    while (it < container.children.length) {
        const element = container.children[it];
        it++;
        if (element instanceof HTMLInputElement) {
            if (this === element) return index;
            index++;
        }
    }
}

function listInputOnWrite(event) {
    event.target.parentElement.value[event.target.index] = event.target.value;
}

function createListInputTopic() {
    const input = document.createElement("input");
    input.type = "text";

    input.addEventListener("keydown", listInputEvent);
    input.addEventListener("input", listInputOnWrite);
    Object.defineProperty(input, "index", {
        get: indexGetter
    });

    return input;
}

class ListInput {
    constructor(container) {
        if (!(container instanceof HTMLElement)) throw new Error("container must be an HTMLElement");
        const input = createListInputTopic(container);
        container.append(input);

        const values = [];

        Object.defineProperty(container, "value", {
            value: values,
            writable: false,
            configurable: false
        });

        input.dispatchEvent(new Event("input"));

        return container;
    }
}

export default ListInput;