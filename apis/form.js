const { ClientError } = require( "../src/server" );

module.exports = {
    post({ body }) {
        console.log(body);
        for(const file of Object.entries(body.files)) {
            console.log(file, Object.keys(file));
        }
        return body?.type ?? "no body type identified";
    }
}