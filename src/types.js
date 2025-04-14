const index = require("./index.js");
const { BaseDataTypes } = index

var Types = { ...BaseDataTypes };
require("./tools/namespace.js")(Types, "Types");

module.exports = Types;