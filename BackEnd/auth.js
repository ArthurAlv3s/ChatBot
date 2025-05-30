// auth.js

// Registro com 2FA
if (document.getElementById('enviar')) {
  document.getElementById('enviar').onclick = async () => {
    const username = document.getElementById('new-email').value;
    const senha = document.getElementById('new-password').value;

    if (!username || !senha) {
      document.getElementById('reg-msg').innerText = 'Preencha todos os campos.';
      return;
    }

    // Tenta registrar o usuário
    const respostaRegistro = await window.api.registrar({ username, senha });

    if (respostaRegistro.sucesso) {
      // Envia o código 2FA para o email do usuário
      const resposta2FA = await window.api.enviarCodigo2FA(username);

      if (resposta2FA.sucesso) {
        // Redireciona para a página de verificação, passando o email pela URL
        window.location.href = `verificar.html?email=${encodeURIComponent(username)}`;
      } else {
        document.getElementById('reg-msg').innerText = 'Erro ao enviar código 2FA.';
      }
    } else {
      document.getElementById('reg-msg').innerText = respostaRegistro.erro;
    }
  };
}

// Login
if (document.getElementById('entrada')) {
  document.getElementById('entrada').onclick = async () => {
    const username = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (!username || !senha) {
      document.getElementById('login-msg').innerText = 'Preencha todos os campos.';
      return;
    }

    const resposta = await window.api.login({ username, senha });

    if (resposta.sucesso) {
      document.getElementById('login-msg').innerText = 'Login bem-sucedido!';
      setTimeout(() => {
        window.location.href = '../FrontEnd/index.html';
      }, 1000);
    } else {
      document.getElementById('login-msg').innerText = resposta.erro;
    }
  };
}
