async function login(email, senha) {
    return await (await fetch("/actions/login", {
        method: "POST",
        body: new URLSearchParams({
            email,
            senha
        }),
        headers: {
            ["Content-Type"]: "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })).json();
}

async function register(email, senha, nome, nivel) {
    return await (await fetch("/actions/register", {
        method: "POST",
        body: URLSearchParams({
            email,
            senha,
            nome,
            nivel
        })
    })).json();
}

async function logout() {
    return await (await fetch("/actions/logout", {
        method: "GET",
        headers: {
            ["x-confirm-logout"]: "true"
        }
    })).json();
}