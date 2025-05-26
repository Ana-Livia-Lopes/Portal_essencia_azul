const { SolicitacaoVoluntario, remove, read, isLogged } = require("../../src/index.js");
const { ClientError, AuthenticationError } = require("../../src/server");
const singleField = require("../_singleField.js");
const { addDoc, collection } = require("firebase/firestore");
const { db } = require("../../firebase.js");
const jsonField = require("../_jsonField.js");
const filterUndefined = require("./_filterUndefined.js");

/** @type {import("../../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ body, response }) {
        const nome = singleField(body.fields.nome);
        const cpf = singleField(body.fields.cpf);
        const email = singleField(body.fields.email);
        const telefone = singleField(body.fields.telefone);
        const como_ajudar = singleField(body.fields.como_ajudar);
        const por_que_ser_voluntario = singleField(body.fields.por_que_ser_voluntario);

        if (!nome || !cpf || !email || !telefone || !como_ajudar || !por_que_ser_voluntario) {
            throw new ClientError(response, "Parâmetros insuficientes");
        }

        await addDoc(collection(db, "solicitacoes_voluntarios"), filterUndefined({
            nome,
            cpf,
            email,
            telefone,
            como_ajudar,
            por_que_ser_voluntario
        }));
    },
    async get({ params, response, session, query }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (params.id) {
            const solicitacao = (await read(session.get("login"), SolicitacaoVoluntario, { id: params.id }, response))[0];
            if (!solicitacao) throw new ClientError(response, "Solicitação não encontrada");
            return solicitacao;
        } else {
            return await read(session.get("login"), SolicitacaoVoluntario, {
                limit: query?.pageSize ?? 100,
                limitOffset: (query?.pageSize ?? 100) * (query?.page ?? 0),
                orderBy: query?.orderBy,
                orderDirection: query?.orderDirection,
            }, response);
        }
    },
    async delete({ params, session, response }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), SolicitacaoVoluntario, params.id, response);
    }
}