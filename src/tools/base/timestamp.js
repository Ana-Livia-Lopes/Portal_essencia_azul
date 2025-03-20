var timestamp = ( function() {
    function toRawObject(date, fixedDateLength) {
        fixedDateLength = fixedDateLength ? 1 : 0;
        return [
            [ "Y", date.getFullYear().toString().padStart(4 * fixedDateLength, "0") ],
            [ "M", (date.getMonth() + 1).toString().padStart(2 * fixedDateLength, "0") ],
            [ "D", date.getDate().toString().padStart(2 * fixedDateLength, "0") ],
            [ "h", date.getHours().toString().padStart(2 * fixedDateLength, "0") ],
            [ "m", date.getMinutes().toString().padStart(2 * fixedDateLength, "0") ],
            [ "s", date.getSeconds().toString().padStart(2 * fixedDateLength, "0") ],
            [ "ms", date.getMilliseconds().toString().padStart(3 * fixedDateLength, "0") ]
        ].reduce((obj, darr) => { obj[darr[0]] = darr[1]; return obj }, {});
    }

    const timestamp = function timestamp(date = new Date, { mainjoin = "-", subjoin = ".", datejoin, hourjoin, fixedDateLength = false } = {}) {
        if (!(date instanceof Date)) date = new Date(date);
        date = toRawObject(date, fixedDateLength);

        return [
            [ date.Y, date.M, date.D ].join(datejoin ?? subjoin),
            [ date.h, date.m, date.s, date.ms ].join(hourjoin ?? subjoin)
        ].join(mainjoin);
    }

    timestamp.template = function template(date = new Date, template, fixedDateLength = false) {
        if (!(date instanceof Date)) date = new Date(date);
        if (typeof template !== "string") throw new TypeError("template must be a string");
        date = toRawObject(date, fixedDateLength);

        return template
            .replace("Y", date.Y)
            .replace("M", date.M)
            .replace("D", date.D)
            .replace("h", date.h)
            .replace("m", date.m)
            .replace("s", date.s)
            .replace("ms", date.ms);
    }

    return timestamp;
} )();

module.exports = timestamp;