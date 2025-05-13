module.exports = {
    get({ params, server }) {
        if (params.path) {
            return server.pages.match(params.path);
        } else {
            return [...server.pages.keys()];
        }
    }
}