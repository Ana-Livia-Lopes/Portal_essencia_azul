const { isLogged } = require( "../../src/index.js" );
const { CodedError } = require( "../../src/tools/index.js" );

/** @type {import("../../src/tools/node/page.js").ExecutePageFunction} */
module.exports = function onlyLogin({ session }) {
    // throw new CodedError(401, "FAÇA LOGIN");
    // if (isLogged(session)) {

    // } else {
    //     throw new Error()
    // }
}