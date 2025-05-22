const { isLogged } = require("../../src")

const usuarioLogado = `<div class="botoes-admin">
    <a href="/gerenciamento"><button id="gerenciamento">Gerenciamento</button></a>
    <a><button id="sair" onclick="sair()" id="sair-adm">Sair</button></a>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        function sair() {
                Swal.fire({
                icon: 'question',
                title: 'Tem certeza que deseja sair?',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Sair',
                confirmButtonColor: "#1535b5bd",
                cancelButtonColor: "#a21a1a",
            }).then(result => {
                if (result.isConfirmed) {
                    fetch("/actions/logout", {
                        headers: {
                            ["x-confirm-logout"]: 'true'
                        }
                    }).then(resp => resp.json()).then(json => {
                        if (json.status === 'error') {
                            Swal.fire({
                                icon: 'error',
                                title: 'Houve um erro!',
                                text: json.message,
                                confirmButtonColor: "#1535b5bd"
                            })
                        }
                        else {
                            Swal.fire({
                                icon: 'success',
                                title: 'Sessão encerrada com sucesso!',
                                confirmButtonColor: "#1535b5bd"
                            }).then(()=>{
                                window.location.href = '/';
                            })
                        }
                    })
                }
            })
        }
    </script>

    <style>
        #gerenciamento {
            background-color: #ffffff;
            color: #4a62be;
            width: 160px;
            height: 30px;
            font-size: 14px;
            border-radius: 0.4rem;
            border: none;
            font-family: 'Montserrat';
            font-weight: 600;
            display: flex;
            justify-content: center;
            align-items: center;
            justify-self: center;
            margin-bottom: 15px;
            cursor: pointer;
        }
        #gerenciamento:hover {
            background-color: rgb(193, 205, 255);;
            color: #4558a7;
        }
        #sair {
            background-color:rgba(255, 255, 255, 0);
            color: #fff;
            width: 80px;
            height: 30px;
            font-size: 16px;
            border-radius: 0.4rem;
            border: none;
            font-family: 'Montserrat';
            font-weight: 600;
            display: flex;
            justify-content: center;
            align-items: center;
            justify-self: center;
            cursor: pointer;
            text-decoration: underline;
            transition: 0.3s all;
        }
        #sair:hover {
            font-size: 20px;
            transform: (scale 1.6);
        }
        @media (max-width: 768px) {
            #gerenciamento {
                margin-top: 30px;
                margin-bottom: 20px;
                width: 180px;
                height: 40px;
                font-size: 16px;
            }
            #sair {
                font-size: 20px;
            }
        }
    </style>
</div>`;

const usuarioNaoLogado = `<a href="/entrar" id="entrar-a"><button id="entrar-adm">Entrar como administrador</button></a>`;


module.exports = function (_, { session }) {
    if (!session) return usuarioNaoLogado;
    if (!isLogged(session)) return usuarioNaoLogado;
    return usuarioLogado;
}