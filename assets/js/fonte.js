function mostrarBotoes() {
    const botoes = document.getElementById('botoesFonte');
    botoes.style.display = botoes.style.display === 'flex' ? 'none' : 'flex';
}
    var tamanhosOriginais = [];

    window.addEventListener('DOMContentLoaded', function() {
        var elementos = document.querySelectorAll('.conteudo-site');
        elementos.forEach(function(elemento, index) {
            tamanhosOriginais[index] = parseFloat(window.getComputedStyle(elemento, null).getPropertyValue('font-size'));
        });
    });

    function alterarFonte(acao) {
        var elementos = document.querySelectorAll('.conteudo-site');
        elementos.forEach(function(elemento, index) {
            var tamanhoAtual = parseFloat(window.getComputedStyle(elemento, null).getPropertyValue('font-size'));

            if (acao === 'a') {
                elemento.style.fontSize = (tamanhoAtual + 2) + "px";
            } else if (acao === 'd') {
                elemento.style.fontSize = (tamanhoAtual - 2) + "px";
            } else if (acao === 'n') {
                elemento.style.fontSize = tamanhosOriginais[index] + "px"; // volta para o original de cada elemento
            }
        });
    }
