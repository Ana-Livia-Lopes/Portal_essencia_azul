const { create, Imagem, remove, update, read } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );

const maxSize = 50 * 1024 * 1024; // 50 MB

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async get({ params, session, query, request }) {
        if (params.id) {
            const image = (await read(session.get("login"), Imagem, { id: params.id }))[0];
            if (request.url.includes("/url")) throw redirect(await image.references.get_conteudo());
            return image;
        } else {
            return await read(session.get("login"), Imagem, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            });
        }
    },
    async post({ body, session, response }) {
        if (!body.files.blob && !body.fields.titulo) throw new ClientError(response, "Parâmetros insuficientes");
        const blob = await getFormidableBlob(body.files.blob);
        if (blob.type !== "image/jpeg" && blob.type !== "image/png") throw new ClientError(response, "Tipo de arquivo inválido");
        if (blob.size > maxSize) throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");
        return await create(session.get("login"), Imagem, {
            blob,
            titulo: body.fields.titulo[0],
            descricao: body.fields?.descricao?.[0] ?? undefined,
            grupos: body.fields?.descricao?.[0] ? body.fields.descricao[0].split(",") : undefined
        });
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Imagem, params.id);
    },
    async patch({ body, session, params }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const patchFields = {}
        if (body.fields.titulo) patchFields.titulo = body.fields.titulo[0];
        if (body.fields.descricao) patchFields.descricao = body.fields.descricao[0];
        if (body.fields.grupos) {
            patchFields.grupos = body.fields.grupos[0].split(",");
        }
        return await update(session.get("login"), Imagem, params.id, patchFields, {
            editType: "update"
        });
    },
}