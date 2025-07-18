const { create, Familia, remove, update, read, Acolhido } = require( "../src/index.js" );
const { ClientError } = require( "../src/server" );
const redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require( "./_singleField.js" );
const jsonField = require("./_jsonField.js");
const { doc, getDocs, collection, query, where } = require("firebase/firestore");
const { db } = require("../firebase.js");

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
            endereco: body.fields.endereco ? singleField(body.fields.endereco) : "",
            residentes: jsonField(body, residentes),
            observacoes: body.fields.observacoes ? singleField(body.fields.observacoes) : "",
        }, response);
    },
    async get({ params, query, session, response, request }) {
        if (params.id) {
            if (request.headers["x-acolhidos"]) {
                const acolhidos = await read(session.get("login"), Acolhido, { conditions: [ { field: "ref_familia", relation: "==", value: doc(db, "familias", params.id) } ] });
                return acolhidos;
            }
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
        if ((await getDocs(query(collection(db, "acolhidos"), where("ref_familia", "==", doc(db, "familias", params.id))))).size > 0) {
            throw new ClientError(response, "Não é possível remover uma família com acolhidos associados");
        }
        return await remove(session.get("login"), Familia, params.id, response);
    },
    async patch({ body, session, params, response }) {
        const patchFields = {};
        if (body.fields.sobrenome) patchFields.sobrenome = singleField(body.fields.sobrenome);
        if (body.fields.endereco) patchFields.endereco = singleField(body.fields.endereco);
        if (body.fields.residentes) patchFields.residentes = jsonField(body, "residentes");
        if (body.fields.observacoes) patchFields.observacoes = singleField(body.fields.observacoes);
        return await update(session.get("login"), Familia, params.id, patchFields, {
            editType: "update"
        }, response);
    },
};