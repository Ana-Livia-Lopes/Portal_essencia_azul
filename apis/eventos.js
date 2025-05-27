const { create, Evento, remove, update, read } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require( "./_singleField.js" );

const maxSize = 50 * 1024 * 1024; // 50 MB

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ session, body, response }) {
        if (
            !body.files.blob ||
            !body.fields.titulo ||
            !body.fields.descricao ||
            !body.fields.data
        ) throw new ClientError(response, "Parâmetros insuficientes");

        const blob = await getFormidableBlob(body.files.blob);
        const data = new Date(`${singleField(body.fields.data)}T03:00:00Z`);
        if (isNaN(data.getTime())) {
            throw new ClientError(response, "Data inválida");
        }

        if (blob.type !== "image/jpeg" && blob.type !== "image/png") {
            throw new ClientError(response, "Tipo de arquivo inválido");
        }
        if (blob.size > maxSize) {
            throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");
        }

        return await create(session.get("login"), Evento, {
            titulo: singleField(body.fields.titulo),
            descricao: singleField(body.fields.descricao),
            blob,
            data,
        }, response);
    },
    async get({ params, query, request, session, response }) {
        if (params.id) {
            const event = (await read(session.get("login"), Evento, { id: params.id }, response))[0];
            if (request.url.includes("/url")) throw redirect(await event.references.get_imagem());
            return event;
        } else {
            return await read(session.get("login"), Evento, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Evento, params.id, response);
    },
    async patch({ body, session, response, params }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const patchFields = {};
        if (body.fields.titulo) patchFields.titulo = singleField(body.fields.titulo);
        if (body.fields.descricao) patchFields.descricao = singleField(body.fields.descricao);
        if (body.fields.data) {
            const data = new Date(singleField(body.fields.data));
            if (isNaN(data.getTime())) {
                throw new ClientError(response, "Data inválida");
            }
            patchFields.data = data;
        }
        if (body.files.blob) {
            const blob = await getFormidableBlob(body.files.blob);
            if (blob.type !== "image/jpeg" && blob.type !== "image/png") {
                throw new ClientError(response, "Tipo de arquivo inválido");
            }
            if (blob.size > maxSize) {
                throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");
            }
            patchFields.blob = blob;
        }
        return await update(session.get("login"), Evento, params.id, patchFields, {
            editType: "update"
        }, response);
    },
}