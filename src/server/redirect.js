class Redirect extends Error {
    constructor(destination) {
        super();
        this.destination = destination;
    }

    destination;

    static {
        this.prototype.name = "Redirect";
    }
}

module.exports = function(destination) {
    return new Redirect(destination);
}