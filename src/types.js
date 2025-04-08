const { BaseDataTypes } = require("./index.js");

var Types = { ...BaseDataTypes };
require("./tools/namespace.js")(Types, "Types");

module.exports = Types;