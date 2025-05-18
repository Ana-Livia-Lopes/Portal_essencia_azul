/**
 * @param {object} param0
 * @param {import("../../src/server").Page.ErrorPageLoadParameters} param1
 */
module.exports = function execute(_, { error, request }) {
    switch (error.name) {
        case "AuthenticationError":
            return "Você precisa estar autenticado para acessar esta página.<br>Se você for um administrador, <a href=\"/entrar\">inicie uma sessão</a> para obter suas permissões."
        case "PermissionError":
            return "Você não tem permissão para acessar essa página.";
        case "NotFoundError":
            return "Esta página não foi encontrada, verifique se o URL está correto ou <a href=\"/contato\">contate-nos</a> para relatar a anormalidade de algum botão.";
        case "ClientError":
            return "Alguma informação enviada não está correta. Se nada foi feito errado, <a href=\"/contato\">contate-nos</a> para relatar a anormalidade."
        case "MethodError":
            return `Essa página não permite requisições do método ${(request.method ?? "").toUpperCase()}.`
        case "ImplementationError":
            return "Desculpe, essa página ainda não está funcionando.";
        case "ServiceError":
            return "Desculpe, um serviço externo retornou um erro.<br>Tente novamente mais tarde e, se persistir, <a href=\"/contato\">contate-nos</a> para relatar a anormalidade.";
        case "TimeoutError":
            return "Desculpe, um serviço externo não respondeu a tempo.<br>Tente novamente mais tarde e, se persistir, <a href=\"/contato\">contate-nos</a> para relatar a anormalidade.";
        case "ServerError":
        default:
            return "Algo deu errado dentro do servidor. <a href=\"/contato\">Contate-nos</a> para relatar o erro.";
    }
}