const { Comentario, remove, read, isLogged } = require("../../src/index.js");
const { ClientError, AuthenticationError } = require("../../src/server");
const singleField = require("../_singleField.js");
const { addDoc, collection, Timestamp } = require("firebase/firestore");
const { db } = require("../../firebase.js");
const jsonField = require("../_jsonField.js");
const filterUndefined = require("./_filterUndefined.js");

/** @type {import("../../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ body, response }) {
        const email = singleField(body.fields.email);
        const nome = singleField(body.fields.nome);
        const mensagem = singleField(body.fields.mensagem);

        await addDoc(collection(db, "comentarios"), filterUndefined({
            email,
            nome,
            mensagem,
            data: Timestamp.now()
        }));

        return JSON.stringify({
            status: "okay",
            message: "Solicitação registrada com sucesso"
        })
    },
    async get({ params, response, session, query }) {
        if (!session || !isLogged(session)) throw new AuthenticationError(response, "Usuário não autenticado");
        if (params.id) {
            const solicitacao = (await read(session.get("login"), Comentario, { id: params.id }, response))[0];
            if (!solicitacao) throw new ClientError(response, "Solicitação não encontrada");
            return solicitacao;
        } else {
            return await read(session.get("login"), Comentario, {
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
        return await remove(session.get("login"), Comentario, params.id, response);
    }
}