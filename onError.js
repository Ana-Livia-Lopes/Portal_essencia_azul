const { timestamp } = require("./src/util/index");

/**
 * @param {import("./src/server").Page.ErrorPageLoadParameters} param0 
 */
module.exports = function({ error, content }) {
    content.clear();
    switch (content.contentType) {
        case "application/json":
            content.append(JSON.stringify({
                status: "error",
                message: error?.message ?? "No details about",
                timestamp: timestamp()
            }));
            break;
        default:
            content.append(`${error?.name ?? "Error"} (${error?.code ?? 500}): ${error?.message}`);
            break;
    }
    console.log(error);
}