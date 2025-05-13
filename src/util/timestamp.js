module.exports = function timestamp(date = new Date()) {
    return date.toISOString();
}