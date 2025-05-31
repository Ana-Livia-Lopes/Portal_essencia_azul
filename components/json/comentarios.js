const { read, Comentario } = require("../../src");

module.exports = async function execute(_, { session, response }) {
    const comentarios = await read(session.get("login"), Comentario, { orderBy: "data", orderDirection: "desc" }, response);
    return `<script>
        window.COMENTARIOS = ${JSON.stringify(comentarios)};
    </script>`;
}