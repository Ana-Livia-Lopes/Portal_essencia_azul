const formidable = require("formidable");
const { ClientError } = require( "./errors.js" );
const privateConstructorSymbol = Symbol("privateConstructorSymbol");

class Body {
    constructor(creationKey) {
        if (creationKey !== privateConstructorSymbol) {
            throw new Error("Cannot create instance of Body directly");
        }
    }

    type;
    files;
    fields;
    error;

    static async get(request, response) {
        const body = new Body(privateConstructorSymbol);

        const contentType = request.headers["content-type"] || "";
        body.fields = {};
        body.files = {};

        if (contentType.includes("multipart/form-data")) {

            body.type = "multipart/form-data";

            await new Promise(async (resolve, reject) => {
                const form = new formidable.IncomingForm();
                form.parse(request, (err, fields, files) => {
                    if (err) {
                        reject(err);
                        body.error = err;
                    } else {
                        body.fields = fields;
                        body.files = files;
                    }
                    resolve();
                });
                
                await new Promise((resolve, reject) => {
                    form.on("end", resolve);
                    form.on("error", reject);
                });
            });

            
        } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("application/json")) {

            const bodyParts = [];
            request.on("data", chunk => bodyParts.push(chunk));
            await new Promise((resolve, reject) => {
                request.on("end", () => {
                    const bodyString = Buffer.concat(bodyParts).toString();
                    try {
                        if (contentType.includes("application/json")) {
                            body.fields = JSON.parse(bodyString);
                        } else if (contentType.includes("application/x-www-form-urlencoded")) {
                            body.fields = Object.fromEntries(new URLSearchParams(bodyString).entries());
                        } else {
                            body.fields = bodyString;
                        }
                    } catch (err) {
                        reject(ClientError(response, err?.message));
                    }
                    resolve();
                });
            });

        } else {
            throw new ClientError(response, `Unsupported request content type: ${contentType}`);
        }
        return body;
    }
}

module.exports = Body;