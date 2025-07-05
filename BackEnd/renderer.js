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

      // Criar ID único para a conversa
      const conversaId = Date.now().toString();

      // Salvar no banco com mesmo conversa_id
      await window.api.salvarMensagem({ email, content: pergunta, sender: 'usuario', conversa_id: conversaId });
      await window.api.salvarMensagem({ email, content: resposta, sender: 'chatbol', conversa_id: conversaId });

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

    const conversasUnicas = new Map();

    listaConversas.innerHTML = '';

    mensagens.forEach(msg => {
      if (!msg.conversa_id) return; // ignora se não tiver ID

      if (!conversasUnicas.has(msg.conversa_id)) {
        conversasUnicas.set(msg.conversa_id, msg.content); // salva a primeira mensagem
      }
    });

    for (const [id, texto] of conversasUnicas.entries()) {
      const div = document.createElement('div');
      div.classList.add('chat-entry');
      div.textContent = extrairAssunto(texto);
      div.addEventListener('click', () => carregarConversaCompleta(id));
      listaConversas.appendChild(div);
    }
  }

  // Carrega mensagens na tela do chat filtradas por conversa_id
  function carregarConversaCompleta(conversaId) {
    chat.innerHTML = '';
    const mensagens = mensagensSalvas.filter(msg => msg.conversa_id === conversaId);
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
