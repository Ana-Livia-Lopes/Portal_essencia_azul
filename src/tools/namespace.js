const validstr = require("./base/string_valid.js");

var Namespace = ( function() {
    const namespaceSymbol = Symbol.for("NamespaceIdentifier");

    Symbol.NamespaceIdentifier = namespaceSymbol;

    const localNamespaceOperationIdentifier = Symbol("NamespaceIdentifier.Local");

    const availableNamespaces = new Proxy({}, {
        set(target, property, newValue) {
            if (
                newValue instanceof Array &&
                newValue.length === 2 &&
                newValue[1] === localNamespaceOperationIdentifier
            ) {
                target[property] = newValue[0];
                return true;
            } else {
                throw new Error("Operação em objeto não permitida");
            }
        }
    });

    function isNamespace(object) {
        try {
            return Boolean(object[namespaceSymbol]);
        } catch {
            return false;
        }
    }

    function Namespace(object, name) {
        if(
            ( typeof object !== "object" && typeof object !== "function" ) ||
            ( object instanceof Array ) || ( object instanceof Date ) ||
            ( object instanceof Map ) || ( object instanceof Set ) ||
            [ Array, Object, String, Number, BigInt, Symbol, Boolean ].includes( object )
        ) throw new TypeError("O objeto Namespace precisa ser um objeto ou função e não padrão de JavaScript");

        if(!validstr(name)) throw new TypeError("Nome inválido para nome de Namespace");
        if (isNamespace(object)) throw new TypeError("O objeto já é um Namespace");
        Object.defineProperties( object, {
            [ Symbol.toStringTag ]: {
                value: String( name ),
                enumerable: false,
                writable: false,
                configurable: false
            },
            [ namespaceSymbol ]: {
                value: true,
                enumerable: false,
                writable: false,
                configurable: false
            }
        } );
        availableNamespaces[name] = [ object, localNamespaceOperationIdentifier ];
        return object;
    }

    Namespace.availableNamespaces = availableNamespaces;

    Namespace(Namespace, "Namespace");

    Namespace.isNamespace = isNamespace;

    return Namespace;
} )()

module.exports = Namespace;