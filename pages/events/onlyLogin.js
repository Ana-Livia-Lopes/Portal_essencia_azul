const { isLogged } = require( "../../src/index.js" )

/** @type {import("../../src/tools/node/page.js").ExecutePageFunction} */
module.exports = function onlyLogin({ session }) {
    throw new Error("FAÇA LOGIN");
    if (isLogged(session)) {

    } else {
        throw new Error()
    }
}