const paging = require("./_pageQuery.js");

/** @type {import("../src/server/").Page.RestHandlersObject} */
module.exports = {
    get({ params, request, query }) {
        if (request.headers["x-acolhido-docs"]) {
            
        } else {

        }
    },
    post({ body }) {
        
    },
    patch({ params }) {},
    put({ params }) {},
    delete({ params }) {}
};