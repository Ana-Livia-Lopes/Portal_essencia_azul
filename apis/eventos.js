const { create, Evento, remove, update, read } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );

const maxSize = 50 * 1024 * 1024; // 50 MB

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ session, body, response }) {
        if (
            !body.files.blob ||
            !body.fields.titulo ||
            !body.fields.data
        ) throw new ClientError(response, "Parâmetros insuficientes");

        const blob = await getFormidableBlob(body.files.blob);
        const data = new Date(`${body.fields.data[0]}T03:00:00Z`);
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
            titulo: body.fields.titulo[0],
            descricao: body.fields.descricao?.[0] ?? undefined,
            blob,
            data,
        })
    },
    async get({ params, query, response, session }) {
        if (params.id) {
            const event = (await read(session.get("login"), Evento, { id: params.id }))[0];
            if (request.url.includes("/url")) throw redirect(await event.references.get_imagem());
            return event;
        } else {
            return await read(session.get("login"), Evento, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            });
        }
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Evento, params.id);
    },
    async patch({ body, session, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const patchFields = {};
        if (body.fields.titulo) patchFields.titulo = body.fields.titulo[0];
        if (body.fields.descricao) patchFields.descricao = body.fields.descricao[0];
        if (body.fields.data) {
            const data = new Date(body.fields.data[0]);
            if (isNaN(data.getTime())) {
                throw new ClientError(response, "Data inválida");
            }
            patchFields.data = data;
        }
        return await update(session.get("login"), Evento, params.id, patchFields, {
            editType: "update"
        });
    },
}