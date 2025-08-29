const { Admin, read } = require("./src/");
const { PermissionError, ServerError, ClientError } = require("./src/server");
const fs = require("fs");

const constructorKey = Symbol("Voting.PrivateConstructor.Key");

class Voting {
    constructor(key, startedBy, response) {
        if (key !== constructorKey) {
            throw new ServerError(response, "Use Voting.start to instantiate Voting");
        }

        this.startedBy = startedBy;

        this._scheduleId = setTimeout(() => {
            
        }, 1000 * 60 * 60 * 24 * 14 /* duas semanas */);
    }

    _scheduleId;

    /** @type {Set<string>} */
    candidates = new Set();
    /** @type {Map<string, string>} */
    votes = new Map();
    /** @type {string} */
    startedBy;

    apply(login, response) {
        if (this.candidates.has(login.id)) return;
        if (login.nivel !== "direcao") throw new ClientError(response, "Only 'direcao' level users can apply as candidates");
    }

    unapply(login, response) {
        this.candidates.delete(login.id);
        for (const [ voter, candidate ] of this.votes) {
            if (candidate === login.id) this.votes.delete(voter);
        }
    }

    vote(login, adminId, response) {
        const level = getLevelNumber(login.nivel);
        if (level <= 0 || level >= 3) throw new PermissionError(response, "Permission denied to apply for voting");
        if (!this.votes.has(adminId)) throw new ClientError(response, "Candidate not found");
        this.votes.set(login.id, adminId);
    }

    hasVoted(login, response) {
        return this.votes.has(login.id);
    }

    end(response) {}

    cancel(response) {}

    static async start(login, response) {
        if (Voting.instance) throw new ClientError(response, "A voting session is already active");
        if (getLevelNumber(login.nivel) < 2) throw new PermissionError(response, "Permission denied");

        const voting = new Voting(constructorKey, login.id, response);
        Voting.instance = voting;
        return voting;
    }

    static instance;
}

function getLevelNumber(nivel) {
    switch (nivel) {
        case "simples": return 1;
        case "direcao": return 2;
        case "dev": return 3;
        default: return 0;
    }
}

module.exports = Voting;