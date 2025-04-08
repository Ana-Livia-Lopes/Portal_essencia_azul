/** @type {import("../../src/tools").Page.ExecutePageOnErrorCallback} */
module.exports = async function execute($1, $2, $error) {
    $1.content.clear();
    console.log("onError", $error?.message);
    try {
        $1.localhooks.error = $error;
        const errorPageInstance = require("../../pages_list").errorPage;
        $1.page = errorPageInstance;
        let errorPage = await errorPageInstance.load($1, $2);
        // console.log(errorPage);
    } catch(err) {
        $1.content.clear();
        $1.content.append(`Erro fatal, comunique a gerência do servidor: ${err}`);
    }
}