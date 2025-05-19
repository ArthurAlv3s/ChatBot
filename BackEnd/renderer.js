document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('mensagem');
  const chat = document.getElementById('chat');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pergunta = input.value.trim();
    if (!pergunta) return;

    adicionarMensagem('Você', pergunta);
    input.value = '';

    const categoria = await window.api.classificarPergunta(pergunta);

    if (categoria === 'futebol') {
      const resposta = await window.api.responderPergunta(pergunta);
      adicionarMensagem('ChatBol', resposta);
    } else if (categoria === 'erro') {
      adicionarMensagem('ChatBol', 'Desculpe, ocorreu um erro ao processar sua pergunta.');
    } else {
      adicionarMensagem('ChatBol', 'Desculpe, só posso responder perguntas sobre futebol ⚽.');
    }
  });

  function adicionarMensagem(remetente, texto) {
    const div = document.createElement('div');
    div.classList.add('mensagem');
    div.innerHTML = `<strong>${remetente}:</strong> ${texto}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }
});
