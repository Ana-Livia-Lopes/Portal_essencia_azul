/** @type {import("../../src/").Component.ExecuteComponentFunction} */
module.exports = function execute({}, { session }) {
    return `<p>Current session ID is: ${session?.id}</p>`
}