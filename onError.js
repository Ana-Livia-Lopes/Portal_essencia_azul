const path = require( "path" );
const { Page } = require( "./src/server" );
const { timestamp } = require("./src/util/index");

const errorScreen = new Page.Screen("/", path.join(__dirname, "./onError.html"), { contentType: "text/html" });

/**
 * @param {import("./src/server").Page.ErrorPageLoadParameters} parameters 
 */
module.exports = async function onError(parameters) {
    let { error, content } = parameters;

    content.clear();

    if (error.name === "Redirect" && error.destination) {
        parameters._stop = true;
        parameters.response.writeHead(302, { location: error.destination });
        return;
    }

    switch (content.contentType) {
        case "application/json":
            content.append(JSON.stringify({
                status: "error",
                message: error?.message ?? "No details about",
                timestamp: timestamp()
            }));
            break;
        case "text/html":
        default:
            await errorScreen.load(parameters);
            // content.append(`${error?.name ?? "Error"} (${error?.code ?? 500}): ${error?.message}`);
            break;
    }
    console.log(error);
}