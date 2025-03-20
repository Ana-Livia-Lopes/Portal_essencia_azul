const babel = require("@babel/core");

module.exports = function compileJSX(text) {
    return babel.transform(text, {
        presets: ["@babel/preset-env", "@babel/preset-react"]
    });
}