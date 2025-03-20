const emptystr = require("./base/string_empty.js");
const validstr = require("./base/string_valid.js");
const timestamp = require("./base/timestamp.js");

const Namespace = require("./namespace.js");
const Property = require("./property.js");

const LinkedList = require("./collections/linkedlist.js");
const Stack = require("./collections/stack.js");
const Queue = require("./collections/queue.js");
const Typed = require("./collections/typed.js");
const TypedMap = require("./collections/typedmap.js");
const TypedSet = require("./collections/typedset.js");
const TypedStack = require("./collections/typedstack.js");
const TypedArray = require("./collections/typedarray.js");

const ContextError = require("./errors/contexterror.js");
const ExpressionError = require("./errors/expressionerror.js");
const InterfaceError = require("./errors/interfaceerror.js");
const LogicalError = require("./errors/logicalerror.js");
const OptionError = require("./errors/optionerror.js");

const Cookie = require("./util/cookie.js");
const Color = require("./util/color.js");
const ConsoleStyle = require("./util/consolestyle.js");

const Page = require("./node/page.js");
const Session = require("./node/session.js");
const ServerManager = require("./node/server.js");

const Compatibility = require("./client/compatibility.js");

module.exports = {
    emptystr,
    validstr,
    timestamp,
    Namespace,
    Property,
    LinkedList,
    Stack,
    Queue,
    Typed,
    TypedMap,
    TypedSet,
    TypedStack,
    TypedArray,
    ContextError,
    ExpressionError,
    InterfaceError,
    LogicalError,
    OptionError,
    Cookie,
    Color,
    ConsoleStyle,
    Page,
    Session,
    ServerManager,
    Compatibility
}