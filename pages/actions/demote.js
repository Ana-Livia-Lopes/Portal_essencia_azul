const { collection, updateDoc, doc, getDoc } = require('firebase/firestore');
const { isLogged } = require('../../src');
const { ClientError, AuthenticationError, PermissionError, NotFoundError } = require('../../src/server');
const { db } = require('../../firebase');

/** @type {import("../../src/server").Page.ExecutablePageFunction} */
module.exports = async function execute({ request, query, session }) {
    if (!isLogged(session)) throw new AuthenticationError(response, "Sessão não encontrada");
    const login = session.get("login");
    if (login.nivel !== "dev") throw new PermissionError(response, "Permissão negada");
    const { id } = query;
    if (!id) throw new ClientError(response, "ID do usuário não fornecido");

    const collRef = collection(db, "admins");
    const docRef = doc(collRef, id);

    const docAdmin = await getDoc(docRef);
    if (!docAdmin.exists()) throw new NotFoundError(response, "Administrador não encontrado");

    const nivel = docAdmin.data().nivel;
    if (nivel === "dev") throw new PermissionError(response, "Não é possível remover permissões de um administrador de menor nível");
    if (nivel === "simples") throw new PermissionError(response, "Administrador já está no nível simples");

    await updateDoc(docRef, { nivel: "simples" });

    const serverSessions = require('../../server.js').sessions;

    if (serverSessions.has(id)) {
        const adminSession = serverSessions.get(id).get("login");
        adminSession.nivel = "simples";
        serverSessions.get(id).set("login", adminSession);
    }

    return JSON.stringify({
        status: "okay",
        message: "Administrador promovido a direção com sucesso"
    });
}