const { isLogged } = require("../../src");

const content = `
<button onclick="addImagem()" class="botaoAdd">Adicionar imagem</button>
<script>
    function addImagem() {
            Swal.fire({
                title: 'Adicionar imagem',
                html:\`` + `
        <div class="modal-container">
            <form id="upload-image-form">
                <label for="tituloInput" class="modal-label">Título</label>
                <input type="text" name="titulo" id="tituloInput" class="modal-input"/>
                <label for="descricaoInput" class="modal-label">Descrição (opcional)</label>
                <input type="text" name="descricao" id="descricaoInput" class="modal-input"/>
                <label for="arquivoInput" class="modal-label">Imagem</label>
                <input type="file" name="blob" id="arquivoInput" class="modal-file"/>
            </form>
        </div>\`
    ` + `,
                didOpen() {
                    document.getElementById("tituloInput").focus();
                },
                confirmButtonText: 'Salvar',
                
                cancelButtonText: 'Cancelar',
                confirmButtonColor: "#1535B5",
                showCancelButton: true,
                focusConfirm: false,
                customClass: {
                    popup: 'custom-popup'
                },
                preConfirm: () => {
                    const titulo = document.getElementById("tituloInput");
                    const descricao = document.getElementById("descricaoInput");
                    const arquivo = document.getElementById("arquivoInput");

                    const fd = new FormData();
                    if (!titulo.value.trim()) {
                        Swal.showValidationMessage("Insira um título.");
                        return false;
                    }
                    if (!arquivo.files[0]) {
                        Swal.showValidationMessage("Selecione uma imagem.");
                        return false;
                    }

                    fd.append("blob", arquivo.files[0]);
                    fd.append("titulo", titulo.value.trim());
                    if (descricao.value.trim()) fd.append("descricao", descricao.value.trim());

                    return fd;
                }
            }).then(result => {
                if (result.isConfirmed) {
                    const formData = result.value;
                    fetch("/api/imagens", {
                        method: "POST",
                        body: formData
                    }).then(result => result.json()).then(json => {
                        if (json.status && json.status === "error") {
                            Swal.fire({
                                icon: "error",
                                title: "Erro",
                                text: json.message,
                                confirmButtonColor: "#1535B5"
                            });
                        } else {
                            Swal.fire({
                                icon: "success",
                                title: "Sucesso",
                                text: "Imagem adicionada com sucesso!",
                                confirmButtonColor: "#1535B5"
                            }).then(() => {
                                window.location.reload();
                            });
                        }
                    })
                }
            });
        }
</script>`;

module.exports = function execute(_, { session }) {
    if (!session) return "";
    if (!isLogged(session)) return "";
    return content;
}