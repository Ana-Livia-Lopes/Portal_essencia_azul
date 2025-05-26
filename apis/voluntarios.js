const { create, Voluntario, remove, update, read } = require("../src/index.js");
const { ClientError } = require("../src/server");
const singleField = require("./_singleField.js");

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ session, body, response }) {
        if (
            !body.fields.nome ||
            !body.fields.cpf ||
            !body.fields.email ||
            !body.fields.telefone ||
            !body.fields.como_ajudar ||
            !body.fields.por_que_ser_voluntario
        ) throw new ClientError(response, "Parâmetros insuficientes");

        return await create(session.get("login"), Voluntario, {
            nome: singleField(body.fields.nome),
            cpf: singleField(body.fields.cpf),
            email: singleField(body.fields.email),
            telefone: singleField(body.fields.telefone),
            como_ajudar: singleField(body.fields.como_ajudar),
            por_que_ser_voluntario: singleField(body.fields.por_que_ser_voluntario),
        }, response);
    },
    async get({ params, query, session, response }) {
        if (params.id) {
            const voluntario = (await read(session.get("login"), Voluntario, { id: params.id }, response))[0];
            return voluntario;
        } else {
            return await read(session.get("login"), Voluntario, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Voluntario, params.id, response);
    },
    async patch({ body, session, params, response }) {
        const patchFields = {};
        if (body.fields.nome) patchFields.nome = singleField(body.fields.nome);
        if (body.fields.cpf) patchFields.cpf = singleField(body.fields.cpf);
        if (body.fields.email) patchFields.email = singleField(body.fields.email);
        if (body.fields.telefone) patchFields.telefone = singleField(body.fields.telefone);
        if (body.fields.como_ajudar) patchFields.como_ajudar = singleField(body.fields.como_ajudar);
        if (body.fields.por_que_ser_voluntario) patchFields.por_que_ser_voluntario = singleField(body.fields.por_que_ser_voluntario);
        return await update(session.get("login"), Voluntario, params.id, patchFields, {
            editType: "update"
        }, response);
    },
};