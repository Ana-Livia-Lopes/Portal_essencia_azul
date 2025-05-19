const { create, Imagem } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );

const maxSize = 50 * 1024 * 1024; // 50 MB

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async post({ body, session, response }) {
        if (!body.files.blob && !body.fields.titulo) throw new ClientError(response, "Parâmetros insuficientes");
        const blob = await getFormidableBlob(body.files.blob);
        if (blob.type !== "image/jpeg" && blob.type !== "image/png") throw new ClientError(response, "Tipo de arquivo inválido");
        if (blob.size > maxSize) throw new ClientError(response, "Arquivo excede o tamanho máximo de 50MB");
        return await create(session.get("login"), Imagem, {
            blob,
            titulo: body.fields.titulo,
            descricao: body.fields.descricao,
            grupos: body.fields.descricao ? body.fields.descricao.split(",") : undefined
        });
    }
}