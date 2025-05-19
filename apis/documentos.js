const { read, Documento, create, remove, update } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const Redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async get({ params, session, query, request }) {
        if (params.id) {
            const document = (await read(session.get("login"), Documento, { id: params.id }))[0];
            if (request.url.includes("/url")) throw Redirect(await document.references.get_arquivo());
            return document;
        } else {
            return await read(session.get("login"), Documento, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            });
        }
    },
    async post({ body, session, response }) {
        if (!body.files.blob || !body.fields.nome) throw new ClientError(response, "Parâmetros insuficientes");
        const blob = await getFormidableBlob(body.files.blob);
        return await create(session.get("login"), Documento, {
            nome: body.fields.nome,
            descricao: body.fields.descricao,
            blob
        });
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Documento, params.id);
    },
    async patch({ body, session, params }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await update(session.get("login"), Documento, params.id, body.fields, {
            editType: "update"
        });
    },
}