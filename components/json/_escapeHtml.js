const { Timestamp } = require("firebase/firestore");

const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
};

const htmlEscapeRegExp = /[&<>"'\/]/g;

function escapeHtml(str = "") {
    return str.replace(htmlEscapeRegExp, (match) => htmlEscapes[match]);
}

const mapEscapeArray = (element) => escapeHtmlJSON(element, false);

function escapeHtmlJSON(obj, toJSON = true) {
    let newObj;
    
    switch (typeof obj) {
        case "string":
            newObj = escapeHtml(obj);
            break;
        case "object":
            if (obj instanceof Array) {
                newObj = obj.map(mapEscapeArray);
            } else if (obj instanceof Date) {
                newObj = obj.toISOString();
            } else if (obj instanceof Timestamp) {
                newObj = obj.toDate().toISOString();
            } else {
                newObj = {};
                for (const key in obj) {
                    newObj[escapeHtml(key)] = escapeHtmlJSON(obj[key], false);
                }
            }
            break;
        case "number":
        case "boolean":
            newObj = obj;
            break;
        default:
            break;
    }

    return toJSON ? JSON.stringify(newObj) : newObj;
}

module.exports = escapeHtmlJSON;