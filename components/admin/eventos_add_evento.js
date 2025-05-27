const { isLogged } = require("../../src/");

const content = `
<script>
        function AddEventos() {
            Swal.fire({
                title: 'Adicionar evento',
                html: \`` + `
        <div class="modal-container">
            <label for="dataEvento" class="modal-label">Data do evento</label>
            <input type="date" id="dataEvento" class="modal-input">

            <label for="nomeEvento" class="modal-label">Nome do evento</label>
            <input type="text" id="nomeEvento" class="modal-input">

            <label for="descricaoEvento" class="modal-label">Descrição</label>
            <textarea id="descricaoEvento" class="modal-textarea"></textarea>

            <label for="arquivoInput" class="modal-label">Arte do evento</label>
            <input type="file" id="arquivoInput" class="modal-file">
        </div>
    \`` + `,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: "#1535B5",
                showCancelButton: true,
                focusConfirm: false,
                customClass: {
                    popup: 'custom-popup'
                },
                preConfirm: () => {
                    const nome = document.getElementById('nomeEvento').value.trim();
                    const descricao = document.getElementById('descricaoEvento').value.trim();
                    const data = document.getElementById('dataEvento').value;
                    const arquivo = document.getElementById('arquivoInput').files[0];

                    const fd = new FormData();

                    if (!nome || !descricao || !data || !arquivo) {
                        Swal.showValidationMessage('Preencha todos os campos!');
                        return false;
                    }

                    if (new Date(data) < new Date()) {
                        Swal.showValidationMessage('Data deve ser futura!');
                        return false;
                    }

                    fd.append('blob', arquivo);
                    fd.append('titulo', nome);
                    fd.append('descricao', descricao);
                    fd.append('data', data);

                    return fd;
                }
            }).then(result => {
                if (result.isConfirmed) {
                    const fd = result.value;
                    fetch("/api/eventos", {
                        method: "POST",
                        body: fd
                    }).then(resp => resp.json()).then(json => {
                        if (json.status === "error") {
                            Swal.fire({
                                icon: "error",
                                title: "Houve um erro...",
                                text: json.message,
                            });
                        } else {
                            Swal.fire({
                                icon: "success",
                                title: "Sucesso!",
                                text: "Evento adicionado com sucesso!",
                            }).then(() => window.location.reload());
                        }
                    });
                }
            });
        }
    </script>
    <button onclick="AddEventos()" class="conteudo-site botao-editar">Adicionar eventos</button>`;

module.exports = function execute(_, { session }) {
    if (!session) return "";
    if (!isLogged(session)) return "";
    return content;
}