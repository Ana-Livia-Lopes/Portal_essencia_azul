function argumentResolver(argumentArray) {
    if (!(argumentArray instanceof Array)) throw new TypeError("Processing arguments needs process.argv array");
    return argumentArray.slice(2).map(arg => {
        if(arg.includes("=")) {
            arg = arg.split("=").slice(0, 2);
        } else {
            arg = [ arg, true ]
        }
        return arg;
    }).reduce(( prev, arg ) => {
        prev[arg[0]] = arg[1];
        return prev;
    }, {});
}

module.exports = argumentResolver;