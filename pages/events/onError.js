/** @type {import("../../src/tools").Page.ExecutePageOnErrorCallback} */
module.exports = async function execute($1, $2, $error) {
    $1.content.clear();
    try {
        $1.localhooks.error = $error;
        const errorPageInstance = require("../../pages_list").errorPage;
        $1.page = errorPageInstance; // substitui a página atual pela instância de ErrorPage.
        await errorPageInstance.load($1, $2); // carrega a página atual (já passa para content)
    } catch(err) {
        $1.content.clear();
        $1.content.append(`Erro fatal no processamento de erro (etapa 1), comunique a gerência do servidor: ${err}`);
    }
}