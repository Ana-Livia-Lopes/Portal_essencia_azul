const { create, Familia, remove, update, read } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require( "./_singleField.js" );
const jsonField = require("./_jsonField.js");

const maxSize = 50 * 1024 * 1024; // 50 MB

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ session, body, response }) {
        if (
            !body.fields.sobrenome ||
            // !body.fields.endereco ||
            !body.fields.residentes
            // !body.fields.observacoes
        ) throw new ClientError(response, "Parâmetros insuficientes");

        return await create(session.get("login"), Familia, {
            sobrenome: singleField(body.fields.sobrenome),
            endereco: body.fields.endereco ? singleField(body.fields.endereco) : undefined,
            residentes: jsonField(body, residentes),
            observacoes: body.fields.observacoes ? singleField(body.fields.observacoes) : undefined,
        }, response);
    },
    async get({ params, query, session, response }) {
        if (params.id) {
            const familia = (await read(session.get("login"), Familia, { id: params.id }, response))[0];
            return familia;
        } else {
            return await read(session.get("login"), Familia, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Familia, params.id, response);
    },
    async patch({ body, session, params, response }) {
        const patchFields = {};
        if (body.fields.sobrenome) patchFields.sobrenome = singleField(body.fields.sobrenome);
        if (body.fields.endereco) patchFields.endereco = singleField(body.fields.endereco);
        if (body.fields.residentes) patchFields.residentes = jsonField(body, residentes);
        if (body.fields.observacoes) patchFields.observacoes = singleField(body.fields.observacoes);
        return await update(session.get("login"), Familia, params.id, patchFields, {
            editType: "update"
        }, response);
    },
};