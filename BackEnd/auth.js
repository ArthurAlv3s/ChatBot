// Registro
if (document.getElementById('enviar')) {
  document.getElementById('enviar').onclick = async () => {
    const username = document.getElementById('new-email').value;
    const senha = document.getElementById('new-password').value;

    if (!username || !senha) {
      document.getElementById('reg-msg').innerText = 'Preencha todos os campos.';
      return;
    }

    const resposta = await window.api.registrar({ username, senha });

    if (resposta.sucesso) {
      document.getElementById('reg-msg').innerText = 'Registrado com sucesso!';
      setTimeout(() => {
        window.location.href = '../FrontEnd/index.html';
      }, 1000);
    } else {
      document.getElementById('reg-msg').innerText = resposta.erro;
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
