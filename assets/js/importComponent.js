/**
 * Insere um component HTML externo em uma página.
 * @param {HTMLElement} targetElement 
 * @param {string} componentLocation 
 * @param {"replace"|"append"} action 
 */
export default async function importComponent(targetElement, componentLocation, action = "replace") {
    const componentText = await (await fetch(componentLocation)).text();
    let temp = document.createElement("div");
    temp.innerHTML = componentText;
    const component = temp.firstElementChild;
    switch (action) {
        case "append":
            targetElement.append(component);
            break;
        case "replace":
            targetElement.outerHTML = componentText;
        default:
            break;
    }
}