class CodedError extends Error {
    constructor(code, message, classification) {
        super(message ?? CodedError.defaultMessages[code]);
        this.code = code;
        this.classification = String(classification);
    }

    code;
    classification;

    static defaultMessages = Object.freeze({
        [401]: "Autenticação necessária",
        [403]: "Acesso negado",
        [404]: "Página não encontrada",
        [500]: "Erro interno do servidor",
        [503]: "Serviço temporariamente indisponível",
        [504]: "Tempo de espera esgotado"
    });
}

module.exports = CodedError;