const { isLogged } = require("../../src");

const usuarioLogado = `<div class="botoes-admin">
    <a><button onclick="editarFooter()" id="gerenciamento">Editar informações</button></a>
    <a href="/gerenciamento"><button id="gerenciamento">Gerenciamento</button></a>
    <a><button id="sair" onclick="sair()" id="sair-adm">Sair</button></a>
    
    <script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.8/dist/inputmask.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.8/dist/bindings/inputmask.binding.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        function sair() {
            Swal.fire({
                icon: 'question',
                title: 'Tem certeza que deseja sair?',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Sair',
                confirmButtonColor: "#1535B5",
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
                                confirmButtonColor: "#1535B5",
                            });
                        } else {
                            Swal.fire({
                                icon: 'success',
                                title: 'Sessão encerrada com sucesso!',
                                confirmButtonColor: "#1535B5",
                            }).then(() => {
                                window.location.href = '/';
                            });
                        }
                    });
                }
            });
        }

        function editarFooter() {
            Swal.fire({
                title: 'Editar informações',
                html: \`
                    <div class="modal-container">
                        <label for="endereco" class="modal-label">Endereço</label>
                        <textarea type="text" id="editar_endereco_texto" class="modal-textarea" value="daUmJeitoLin"></textarea>

                        <label for="linkendereco" class="modal-label">Link do Endereço</label>
                        <textarea type="text" id="editar_endereco_link" class="modal-textarea" value="daUmJeitoLin"></textarea>

                        <label for="email" class="modal-label">E-mail</label>
                        <input type="email" id="editar_email" class="modal-input" value="daUmJeitoLin">

                        <label for="insta" class="modal-label">Usuário do Instagram</label>
                        <input type="text" id="editar_instagram" class="modal-input" value="daUmJeitoLin">

                        <label for="facebook" class="modal-label">Usuário do Facebook</label>
                        <input type="text" id="editar_facebook_usuario" class="modal-input" value="daUmJeitoLin">
                        <label for="facebook" class="modal-label">Nome do Facebook</label>
                        <input type="text" id="editar_facebook_nome" class="modal-input" value="daUmJeitoLin">

                        <label for="telefone" class="modal-label">Telefone 1 - Rodapé</label>
                        <input type="text" id="editar_telefone_1" class="modal-input" value="daUmJeitoLin">
                        
                        <label for="telefone" class="modal-label">Telefone 2 - Rodapé</label>
                        <input type="text" id="editar_telefone_2" class="modal-input" value="daUmJeitoLin">

                        <label for="telefone" class="modal-label">Telefone - Catálogo</label>
                        <input type="text" id="editar_telefone_catalogo" class="modal-input" value="daUmJeitoLin">
                    </div>
                \`,
                confirmButtonText: 'Salvar alterações',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: "#1535B5",
                showCancelButton: true,
                focusConfirm: false,
                customClass: {
                    popup: 'custom-popup'
                },
                didOpen: () => {
                    Inputmask("(99) 99999-9999").mask("#editar_telefone_1");
                    Inputmask("(99) 99999-9999").mask("#editar_telefone_2");
                    Inputmask("(99) 99999-9999").mask("#editar_telefone_catalogo");

                    const enderecoInput = document.getElementById('editar_endereco_texto');
                    const linkEnderecoInput = document.getElementById('editar_endereco_link');
                    const emailInput = document.getElementById('editar_email');
                    const instaInput = document.getElementById('editar_instagram');
                    const facebookUsuarioInput = document.getElementById('editar_facebook_usuario');
                    const facebookNomeInput = document.getElementById('editar_facebook_nome');
                    const telefone1Input = document.getElementById('editar_telefone_1');
                    const telefone2Input = document.getElementById('editar_telefone_2');
                    const telefoneCatalogoInput = document.getElementById('editar_telefone_catalogo');

                    enderecoInput.value = window.FOOTER_INFO.endereco.texto;
                    linkEnderecoInput.value = window.FOOTER_INFO.endereco.link;
                    emailInput.value = window.FOOTER_INFO.email;
                    instaInput.value = window.FOOTER_INFO.instagram;
                    facebookUsuarioInput.value = window.FOOTER_INFO.facebook.usuario;
                    facebookNomeInput.value = window.FOOTER_INFO.facebook.nome;
                    telefone1Input.value = window.FOOTER_INFO.whatsapp.footer_1;
                    telefone2Input.value = window.FOOTER_INFO.whatsapp.footer_2;
                    telefoneCatalogoInput.value = window.FOOTER_INFO.whatsapp.catalogo;
                },
                preConfirm: () => {
                    const endereco = document.getElementById('endereco').value.trim();
                    const linkendereco = document.getElementById('linkendereco').value.trim();
                    const email = document.getElementById('email').value.trim();
                    const insta = document.getElementById('insta').value.trim();
                    const facebook = document.getElementById('facebook').value.trim();
                    const telefone = document.getElementById('telefone').value.trim();

                    if (!endereco || !linkendereco || !email || !telefone) {
                        Swal.showValidationMessage('Preencha todos os campos obrigatórios!');
                        return false;
                    }

                    const fd = new FormData();
                    fd.append("endereco", endereco);
                    fd.append("linkendereco", linkendereco);
                    fd.append("email", email);
                    fd.append("insta", insta);
                    fd.append("facebook", facebook);
                    fd.append("telefone", telefone);
                    if (arquivo) fd.append("arquivo", arquivo);

                    return fetch('/editar-footer', {
                        method: 'POST',
                        body: fd
                    }).then(resp => resp.json())
                      .catch(() => {
                          Swal.showValidationMessage("Erro na requisição.");
                      });
                }
            }).then(result => {
                if (result.isConfirmed && result.value?.status === "success") {
                    Swal.fire({
                        icon: "success",
                        title: "Sucesso!",
                        text: "Footer atualizado com sucesso!",
                        confirmButtonColor: "#1535B5",
                    }).then(() => window.location.reload());
                } else if (result.value?.status === "error") {
                    Swal.fire({
                        icon: "error",
                        title: "Erro!",
                        text: result.value.message,
                        confirmButtonColor: "#1535B5",
                    });
                }
            });
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
            background-color: rgb(193, 205, 255);
            color: #4558a7;
        }
        #sair {
            background-color: rgba(255, 255, 255, 0);
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
            transform: scale(1.1);
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
};
