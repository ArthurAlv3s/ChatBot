document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('mensagem');
  const chat = document.getElementById('chat');
  const listaConversas = document.getElementById('lista-conversas');
  const email = localStorage.getItem('userEmail');
  let mensagensSalvas = [];

  if (!email) {
    alert("Usuário não identificado. Faça login novamente.");
    return;
  }

  // Enviar nova pergunta
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pergunta = input.value.trim();
    if (!pergunta) return;

    adicionarMensagem('Você', pergunta);
    input.value = '';

    const categoria = await window.api.classificarPergunta(pergunta);

    if (categoria === 'futebol') {
      const resposta = await window.api.responderPergunta(pergunta);

      // Salvar no banco
      await window.api.salvarMensagem({ email, content: pergunta, sender: 'usuario' });
      await window.api.salvarMensagem({ email, content: resposta, sender: 'chatbol' });

      adicionarMensagem('ChatBol', resposta);
      carregarConversasLaterais(); // Atualiza menu lateral
    } else {
      const msg = categoria === 'erro'
        ? 'Desculpe, ocorreu um erro ao processar sua pergunta.'
        : 'Desculpe, só posso responder perguntas sobre futebol ⚽.';
      adicionarMensagem('ChatBol', msg);
    }
  });

  // Adicionar mensagem na caixa de chat
  function adicionarMensagem(remetente, texto) {
    const div = document.createElement('div');
    div.classList.add('mensagem');
    div.innerHTML = `<strong>${remetente}:</strong> ${texto}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  // Carregar todas conversas do banco
  async function carregarConversasLaterais() {
    const mensagens = await window.api.getMensagensPorEmail(email);
    mensagensSalvas = mensagens;

    const assuntos = new Set();

    listaConversas.innerHTML = '';

    mensagens.forEach(msg => {
      const assunto = extrairAssunto(msg.content);

      if (!assuntos.has(assunto)) {
        assuntos.add(assunto);

        const div = document.createElement('div');
        div.classList.add('chat-entry');
        div.textContent = assunto;
        div.addEventListener('click', () => carregarConversaCompleta(assunto));
        listaConversas.appendChild(div);
      }
    });
  }

  // Carrega mensagens na tela do chat filtradas por assunto
  function carregarConversaCompleta(assunto) {
    chat.innerHTML = '';
    const mensagens = mensagensSalvas.filter(msg => extrairAssunto(msg.content) === assunto);
    mensagens.forEach(msg => {
      adicionarMensagem(msg.sender === 'usuario' ? 'Você' : 'ChatBol', msg.content);
    });
  }

  // Extrai assunto da mensagem (simplesmente as 5 primeiras palavras)
  function extrairAssunto(texto) {
    return texto.split(' ').slice(0, 5).join(' ') + '...';
  }

  carregarConversasLaterais();
});
