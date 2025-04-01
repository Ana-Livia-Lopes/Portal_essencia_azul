/** @type {import("../page.js").ExecutePageFunction} */
module.exports = async function execute({ params, components, content, localhooks, page, request, response, server, body, query, session }, apis) {
    return await components.load(
        (`<component name="${params.name}" ${
            Object.entries(query).filter(d => d[0] !== "name").map(d => d[0] + "=\"" + d[1] + "\"").join(" ")
        } />`),
        { params, components, content, localhooks, page, request, response, server, body, query, session, apis }
    );
}