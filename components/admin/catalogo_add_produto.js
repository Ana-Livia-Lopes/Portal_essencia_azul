const { isLogged } = require("../../src");

const content = `<button onclick="adicionarProduto()" class="botao-editar conteudo-site">Adicionar produto</button>
        <script>
            function createNovaOpcaoForm() {
                const container = document.getElementById("add-produto-options");
                if (!container) return;
                if (!container.opcoes) container.opcoes = [];

                const optionContainer = document.createElement("div");
                optionContainer.classList.add("optionContainer");

                optionContainer.innerHTML = \`` + `
                    <hr style="border: 2px solid white; margin: 24px 0;">
                    <label class="modal-label">Nome</label>
                    <input type="text" name="nome" class="modal-input add-produtos-nome-input" />

                    <label class="modal-label">Descrição</label>
                    <textarea name="descricao" class="modal-textarea add-produtos-descricao-input"></textarea>

                    <label class="modal-label">Preço</label>
                    <input type="number" name="preco" class="modal-input add-produtos-preco-input" step="0.1" min="0" />

                    <label class="modal-label">Imagem</label>
                    <input type="file" name="imagem" class="modal-input add-produtos-imagem-input" accept="image/*" />
                \`` +  `;

                optionContainer.fields = {};
                for (const child of optionContainer.children) {
                    if (child.tagName === "INPUT" || child.tagName === "TEXTAREA") {
                        const name = child.name;
                        optionContainer.fields[name] = child;
                    }
                }

                optionContainer.remove = function () {
                    container.removeChild(optionContainer);
                    container.opcoes = container.opcoes.filter((opcao) => opcao !== optionContainer);
                };

                const removeButton = document.createElement("i");
                removeButton.classList.add("fa-solid", "fa-trash", "removerOpcaoProduto");
                removeButton.onclick = function () {
                    optionContainer.remove();
                };
                optionContainer.appendChild(removeButton);

                container.opcoes.push(optionContainer);
                container.appendChild(optionContainer);
            }

            function adicionarProduto() {
                Swal.fire({
                    title: "Adicionar produto",
                    html: \`` + `
                        <div class="modal-container">
                            <label for="nome-input" class="modal-label">Nome *</label>
                            <input type="text" id="nome-input" class="modal-input" />

                            <label for="descricao-input" class="modal-label">Descrição *</label>
                            <textarea id="descricao-input" class="modal-textarea"></textarea>

                            <label for="preco-input" class="modal-label">Preço *</label>
                            <input type="number" id="preco-input" class="modal-input" step="0.1" min="0" />

                            <label for="imagem-input" class="modal-label">Imagem *</label>
                            <input type="file" id="imagem-input" class="modal-input" accept="image/*" />

                            <label for="opcoes-input" class="modal-label">Outras opções</label>
                            <div id="add-produto-options">
                                <i class="fa-solid fa-plus" onclick="createNovaOpcaoForm()"></i>
                            </div>

                        </div>
                    \`` + `,
                    confirmButtonText: "Salvar",
                    confirmButtonColor: "#1535B5",
                    cancelButtonText: "Cancelar",
                    showCancelButton: true,
                    focusConfirm: false,
                    customClass: {
                        popup: "custom-popup",
                    },
                    preConfirm: () => {
                        const nome = document.getElementById("nome-input").value;
                        const descricao = document.getElementById("descricao-input").value;
                        const preco = document.getElementById("preco-input").value;
                        const imagem = document.getElementById("imagem-input").files[0];
                        const opcoes = document.getElementById("add-produto-options").opcoes ?? [];

                        
                        if (!nome || !descricao || !preco || !imagem) {
                            Swal.showValidationMessage("Por favor, preencha todos os campos.");
                        }

                        const produto = {
                            nome,
                            descricao,
                            preco,
                            blob: imagem,
                            opcoes: []
                        };

                        for (const opcao of opcoes) {
                            const nomeOpcao = opcao.fields.nome.value;
                            const descricaoOpcao = opcao.fields.descricao.value;
                            const precoOpcao = opcao.fields.preco.value;
                            const imagemOpcao = opcao.fields.imagem.files[0];

                            if (!nomeOpcao) {
                                Swal.showValidationMessage("Por favor, preencha pelo menos o nome da opção.");
                            }

                            const opcaoFinal = {
                                nome: nomeOpcao,
                            };
                            if (descricaoOpcao) opcaoFinal.descricao = descricaoOpcao;
                            if (precoOpcao) opcaoFinal.preco = precoOpcao;
                            if (imagemOpcao) opcaoFinal.blob = imagemOpcao;

                            produto.opcoes.push(opcaoFinal);
                        }

                        const fd = new FormData();

                        fd.append("nome", nome);
                        fd.append("descricao", descricao);
                        fd.append("preco", preco);
                        fd.append("blob", imagem);
                        for (let i = 0; i < produto.opcoes.length; i++) {
                            const opcao = produto.opcoes[i];
                            fd.append("opcoes[]", JSON.stringify(opcao));
                            if (opcao.blob) {
                                fd.append(\`` + "blob_opcao[${i}]" + `\`, opcao.blob);
                            }
                        }

                        return fd;
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetch("/api/produtos", {
                            method: "POST",
                            body: result.value
                        }).then(resp => resp.json()).then(json => {
                            if (json.status === "error") {
                                Swal.fire({
                                    icon: "error",
                                    title: "Erro ao adicionar produto",
                                    confirmButtonColor: "#1535B5",
                                    text: json.message,
                                });
                            } else {
                                Swal.fire({
                                    icon: "success",
                                    title: "Produto adicionado com sucesso!",
                                    confirmButtonColor: "#1535B5",
                                    timer: 1500
                                }).then(() => {
                                    window.location.reload();
                                });
                            }
                        }).catch(err => {
                            Swal.fire({
                                icon: "error",
                                title: "Erro ao adicionar produto",
                                confirmButtonColor: "#1535B5",
                                text: err.message,
                            });
                        });
                    }
                });
            }
        </script>`;

module.exports = function execute(_, { session }) {
    if (!session) return "";
    if (!isLogged(session)) return "";
    return content;
}