document.getElementById('chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;
  
    // adiciona a mensagem do usuário ao chat
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = userInput;
    document.getElementById('chat-box').appendChild(userMessage);
  
    // wnvia a mensagem para o main process
    window.electron.sendMessage(userInput);
  
    // limpa o campo de input
    document.getElementById('user-input').value = '';
    
    // adiciona uma mensagem de espera enquanto aguarda resposta do bot
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message', 'bot');
    botMessage.textContent = 'Aguarde um momento...';
    document.getElementById('chat-box').appendChild(botMessage);
  });
  
  // escuta a resposta do processo principal (bot)
  window.electron.onMessage(function (response) {
    // atualiza a última mensagem do bot com a resposta recebida
    const botMessages = document.querySelectorAll('.chat-message.bot');
    const lastBotMessage = botMessages[botMessages.length - 1];
    lastBotMessage.textContent = response;
  });
  