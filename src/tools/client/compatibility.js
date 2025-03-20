const Namespace = require("../namespace.js");
const Property = require("../property.js");

var Compatibility = ( function() {
    const Compatibility = {};
    Namespace(Compatibility, "Compabilitity");

    let privateFields = function privateFields() {
        try {
            new (class {
                #privateField;
            })()
        } catch (err) {
            console.error(err);
            return false;
        }
        return true;
    }
    Property.assign(Compatibility, "privateFields", "get", privateFields);

    return Compatibility;
} )();

module.exports = Compatibility;