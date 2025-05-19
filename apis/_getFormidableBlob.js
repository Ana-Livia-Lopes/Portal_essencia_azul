const fs = require("fs");

async function getFormidableBlob(fileObject) {
    if (fileObject instanceof Array) fileObject = fileObject[0];
    const content = await fs.promises.readFile(fileObject.filepath);

    return new Blob([ content ], { type: fileObject.mimetype });
}

getFormidableBlob.multiple = async function(fileObjects) {
    const blobs = await Promise.all(fileObjects.map(getFormidableBlob));
    return blobs;
}

Object.freeze(getFormidableBlob);

module.exports = getFormidableBlob;