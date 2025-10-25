function listInputEvent(event) {
    if (event.key === "Enter") {
        if (event.target.value === "") return;
        const adjinput = createListInputTopic();
        event.target.insertAdjacentElement("afterend", adjinput);
        if (event.target.selectionStart < event.target.value.length) {
            adjinput.value = event.target.value.substring(event.target.selectionEnd, event.target.value.length);
            event.target.value = event.target.value.substring(0, event.target.selectionStart);
        }
        adjinput.focus();
        adjinput.setSelectionRange(0, 0);
        for (const input of event.target.parentElement.children) {
            if (input instanceof HTMLInputElement) input.dispatchEvent(new Event("input"));
        }
    } else if (event.key === "Backspace") {
        if (event.target.index === 0) return;
        if (event.target.selectionStart === 0 && event.target.selectionEnd === 0) event.preventDefault(); else return;
        for (const element of event.target.parentElement.children) {
            if (element instanceof HTMLInputElement && element.index === event.target.index - 1) {
                element.focus();
                const originalLength = element.value.length;
                element.value += event.target.value;
                element.setSelectionRange(originalLength, originalLength);
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
    } else if (event.key === "ArrowLeft") {
        if (event.target.index === 0) return;
        if (event.target.selectionStart === event.target.selectionEnd && event.target.selectionStart === 0) {
            for (const element of event.target.parentElement.children) {
                if (element instanceof HTMLInputElement && element.index === event.target.index - 1) {
                    element.focus();
                    event.preventDefault();
                    break;
                }
            }
        }
    } else if (event.key === "ArrowRight") {
        if (event.target.index === event.target.parentElement.children.length - 1) return;
        if (event.target.selectionStart === event.target.selectionEnd && event.target.selectionStart === event.target.value.length) {
            for (const element of event.target.parentElement.children) {
                if (element instanceof HTMLInputElement && element.index === event.target.index + 1) {
                    element.focus();
                    event.preventDefault();
                    element.setSelectionRange(0, 0);
                    break;
                }
            }
        }
    } else if (event.key === "Delete") {
        if (event.target.index === event.target.parentElement.children.length - 1) return;
        if (event.target.selectionStart === event.target.selectionEnd && event.target.selectionStart === event.target.value.length) {
            for (const element of event.target.parentElement.children) {
                if (element instanceof HTMLInputElement && element.index === event.target.index + 1) {
                    let originalLength = event.target.value.length
                    event.target.value += element.value;
                    event.target.parentElement.value[event.target.index] = event.target.value;
                    event.preventDefault();
                    element.parentElement.removeChild(element);
                    event.target.setSelectionRange(originalLength, originalLength);

                    let oldLength = event.target.parentElement.value.length;
                    for (let i = event.target.index + 1; i < oldLength; i++) {
                        event.target.parentElement.value[i] = event.target.parentElement.value[i + 1];
                    }
                    event.target.parentElement.value.pop();
                    break;
                }
            }
        }
    } else if (event.key === "ArrowUp") {
        if (event.target.index === 0) return;
        for (const element of event.target.parentElement.children) {
            if (element instanceof HTMLInputElement && element.index === event.target.index - 1) {
                element.focus();
                event.preventDefault();
                break;
            }
        }
    } else if (event.key === "ArrowDown") {
        if (event.target.index === event.target.parentElement.children.length - 1) return;
        for (const element of event.target.parentElement.children) {
            if (element instanceof HTMLInputElement && element.index === event.target.index + 1) {
                element.focus();
                event.preventDefault();
                break;
            }
        }
    } else {
        for (const element of event.target.parentElement.children) {
            if (element instanceof HTMLInputElement) {
                event.target.parentElement.value[element.index] = element.value;
            }
        }
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

const CreatedListInputs = new WeakSet();

class ListInput {
    constructor(container, ...initialValues) {
        if (CreatedListInputs.has(container)) return container;
        if (!(container instanceof HTMLElement)) throw new Error("container must be an HTMLElement");
        container.style.position = "relative";
        const input = createListInputTopic();

        const addButton = document.createElement("i");
        addButton.classList.add('fa', 'fa-add');
        addButton.style.fontSize = "20px";
        addButton.style.position = "absolute";
        addButton.style.bottom = "30px";
        addButton.style.right = "12px";
        addButton.style.cursor = "pointer";
        addButton.addEventListener("click", () => {
            container.append(createListInputTopic());
        });
        container.append(addButton);
        container.append(input);

        const values = [];

        Object.defineProperty(container, "value", {
            value: values,
            writable: false,
            configurable: false
        });

        if (initialValues[0]) input.value = initialValues[0];
        for (let i = 1; i < initialValues.length; i++) {
            if (initialValues[i]) {
                const input = createListInputTopic();
                input.value = initialValues[i];
                container.append(input);
            }
        }

        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("keydown"));

        CreatedListInputs.add(container)

        return container;
    }
}

export default ListInput;