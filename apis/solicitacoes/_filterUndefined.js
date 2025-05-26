function filterUndefinedInArray(item) {
    return item !== undefined;
}

function filterUndefined(object) {
    const newObj = {};
    for (const key in object) {
        if (object[key] !== undefined) {
            newObj[key] = object[key];
        } else if (object[key] instanceof Array) {
            newObj[key] = object[key].filter(filterUndefined);
        } else if (typeof object[key] === 'object' && object[key] !== null) {
            newObj[key] = filterUndefined(object[key]);
        }
    }
}

module.exports = filterUndefined;