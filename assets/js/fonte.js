function mostrarBotoes() {
    const botoes = document.getElementById('botoesFonte');
    botoes.style.display = botoes.style.display === 'flex' ? 'none' : 'flex';
}

function alterarFonte(acao) {
    var corpo = document.querySelector('.conteudo-site');
    var tamanhoAtual = parseFloat(window.getComputedStyle(corpo, null).getPropertyValue('font-size'));

    if (acao === 'a') {
        corpo.style.fontSize = (tamanhoAtual + 2) + "px";
    } else if (acao === 'd') {
        corpo.style.fontSize = (tamanhoAtual - 2) + "px";
    } else if (acao === 'n') {
        corpo.style.fontSize = "16px";
    }
}