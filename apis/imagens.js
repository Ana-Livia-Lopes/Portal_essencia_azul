const { create, Imagem, remove, update, read } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require( "./_singleField.js" );

const maxSize = 50 * 1024 * 1024; // 50 MB

function parseGrupos(body) {
    return body.fields.grupos ?
        (
            body.type.includes("application/json") ?
                body.fields.grupos :
                singleField(body.fields.grupos).split(",")
        ) :
        undefined;
}

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async get({ params, session, query, request, response }) {
        if (params.id) {
            const image = (await read(session.get("login"), Imagem, { id: params.id }, response))[0];
            if (request.url.includes("/url")) throw redirect(await image.references.get_conteudo());
            return image;
        } else {
            return await read(session.get("login"), Imagem, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async post({ body, session, response }) {
        if (
            !body.files.blob ||
            // !body.fields.descricao ||
            !body.fields.titulo
        ) throw new ClientError(response, "Parâmetros insuficientes");
        const blob = await getFormidableBlob(body.files.blob);
        if (blob.type !== "image/jpeg" && blob.type !== "image/png") throw new ClientError(response, "Tipo de arquivo inválido");
        if (blob.size > maxSize) throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");
        return await create(session.get("login"), Imagem, {
            blob,
            titulo: singleField(body.fields.titulo),
            descricao: singleField(body.fields.descricao),
            grupos: parseGrupos(body)
        }, response);
    },
    async delete({ session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        return await remove(session.get("login"), Imagem, params.id, response);
    },
    async patch({ body, session, params, response }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const patchFields = {}
        if (body.fields.titulo) patchFields.titulo = singleField(body.fields.titulo);
        if (body.fields.descricao) patchFields.descricao = singleField(body.fields.descricao);
        if (body.fields.grupos) patchFields.grupos = parseGrupos(body);
        return await update(session.get("login"), Imagem, params.id, patchFields, {
            editType: "update"
        }, response);
    },
}