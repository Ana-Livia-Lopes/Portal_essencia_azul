const { read, Documento, create, remove, update } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const Redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require("./_singleField.js");

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async get({ params, session, query, request, response }) {
        if (params.id) {
            const document = (await read(session.get("login"), Documento, { id: params.id }, response))[0];
            if (request.url.includes("/url")) throw Redirect(await document.references.get_arquivo());
            return document;
        } else {
            return await read(session.get("login"), Documento, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async post({ body, session, response }) {
        if (!body.files.blob || !body.fields.nome) throw new ClientError(response, "Parâmetros insuficientes");
        const blob = await getFormidableBlob(body.files.blob);
        return await create(session.get("login"), Documento, {
            nome: singleField(body.fields.nome),
            descricao: singleField(body.fields.descricao),
            blob
        }, response);
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Documento, params.id, response);
    },
    async patch({ body, session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const patchFields = {}
        if (body.fields.nome) patchFields.nome = singleField(body.fields.nome);
        if (body.fields.descricao) patchFields.descricao = singleField(body.fields.descricao);
        return await update(session.get("login"), Documento, params.id, patchFields, {
            editType: "update"
        }, response);
    },
}