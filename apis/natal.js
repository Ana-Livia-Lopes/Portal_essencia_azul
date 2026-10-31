const { RegistroParticipacao, read } = require("../src")

/** @type {import("../src/server").Page.RestHandlersObject} */
module.exports = {
    async get({ request, response, query, session }) {
        let quantidade = 0;
        let autistas = 0;
        const data = await read(session.get("login"), RegistroParticipacao, {}, response);
        for (const item of data) {
            quantidade += 1;
            if (item.fields.tipo == "familia") {
                for (const membro of item.fields.familia) {
                    quantidade += 1;
                    if (membro.autista) {
                        autistas += 1;
                    }
                    if (membro.ref_acolhido) {
                        membro.ref_acolhido = membro.ref_acolhido.id;
                    }
                }
            }
        }
        return {
            statistics: {
                participantes: quantidade,
                autistas,
            },
            data,
        };
    }
}