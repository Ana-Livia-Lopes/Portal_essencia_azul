const { doc, Timestamp } = require( "firebase/firestore" );
const { read, Alteracao, create, remove, update, Familia } = require( "../src/index.js" );
const { ClientError, NotFoundError } = require( "../src/server" );
const Redirect = require( "../src/server/redirect.js" );
const getFormidableBlob = require( "./_getFormidableBlob.js" );
const singleField = require("./_singleField.js");
const jsonField = require("./_jsonField.js");
const { db } = require( "../firebase.js" );

/** @type {import("../src/server/").Page.RestHandlersObject} */
module.exports = {
    async get({ session, response, query, params }) {
        if (params.id) {
            const alteracao = (await read(session.get("login"), Alteracao, { id: params.id }, response))[0];
            if (!alteracao) throw new NotFoundError(response, "Alteração não encontrada");
            return alteracao;
        } else {
            return await read(session.get("login"), Alteracao, {
                limit: query.pageSize ?? 100,
                limitOffset: query.pageSize * (query.page ?? 0),
                orderBy: query.orderBy,
                orderDirection: query.orderDirection,
            }, response);
        }
    },
}