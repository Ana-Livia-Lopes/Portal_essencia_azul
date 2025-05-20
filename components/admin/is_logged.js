const { isLogged } = require("../../src/")
module.exports = async function execute(_, { session }) {
    let is;
    if (!session) {
        is = "false";
    } else if (!(await isLogged(session))) {
        is= "false";
    } else {
        is = "true";
    }
    return `<script>window.ISLOGGED = ${is}</script>`;
}