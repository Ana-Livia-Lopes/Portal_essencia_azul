const { doc, Timestamp } = require( "firebase/firestore" );
const { read, Admin, create, remove, update, Familia } = require( "../src/index.js" );
const { ClientError, NotFoundError } = require( "../src/server" );
const Redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require("./_singleField.js");
const jsonField = require("./_jsonField.js");
const { db } = require( "../firebase.js" );
const redirect = require("../src/server/redirect.js");

/** @type {import("../src/server/").Page.RestHandlersObject} */
module.exports = {
    async get({ session, response, query, params }) {
        if (params.id) {
            const admin = (await read(session.get("login"), Admin, { id: params.id }, response))[0];
            if (!admin) throw new NotFoundError(response, "Admin não encontrado");
            if (query.getImagem === "true") {
                const imagem = await admin.references.get_imagem();
                if (!imagem) throw redirect("/img/user-default.png");
                throw redirect(imagem);
            }
            return admin;
        } else {
            return await read(session.get("login"), Admin, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
    async patch({ session, response, params, body }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const blob = body.files.blob ? await getFormidableBlob(body.files.blob) : undefined;
        const admin = await update(session.get("login"), Admin, params.id, {
            nome: body.fields.nome ? singleField(body.fields.nome) : undefined,
            blob,
        }, { editType: "update" }, response);
        return admin;
    },
    async delete({ session, response, params, server }) {
        if (!params.id) throw new ClientError(response, "ID não informado");
        const admin = await remove(session.get("login"), Admin, params.id, response);
        server.sessions.forEach(session => {
            const login = session.get("login");
            if (login && login.email === admin.fields.email) {
                server.sessions.delete(session.id);
            }
        })
        return admin;
    }
}