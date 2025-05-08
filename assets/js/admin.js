async function login(email, password) {
    return await (await fetch("/api/login", {
        method: "POST",
        body: new URLSearchParams({
            email,
            password
        }),
        headers: {
            ["Content-Type"]: "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })).text();
}

async function register(email, senha, nivel) {
    return await (await fetch("/api/register", {})).text();
}