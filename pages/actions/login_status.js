module.exports = function({ session }) {
    return JSON.stringify(session.get("login"));
}