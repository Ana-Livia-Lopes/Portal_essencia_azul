/** @type {import("../../src/tools").Component.ExecuteComponentFunction} */
module.exports = function execute() {
    const d = new Date();
    return `<p>Data e hora atuais: ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}</p>`
}