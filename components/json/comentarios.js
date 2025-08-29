const { read, Comentario } = require("../../src");
const escapeHtml = require("./_escapeHtml.js");

module.exports = async function execute(_, { session, response }) {
    const comentarios = await read(session.get("login"), Comentario, { orderBy: "data", orderDirection: "desc" }, response);
    return `<script>
        window.COMENTARIOS = ${escapeHtml(comentarios)};
    </script>`;
}