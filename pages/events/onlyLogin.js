const { isLogged } = require( "../../src/index.js" )

/** @type {import("../../src/tools/node/page.js").ExecutePageFunction} */
module.exports = function onlyLogin({ session }) {
    if (isLogged(session)) {

    } else {
        throw new Error()
    }
}