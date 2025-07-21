// REGISTRO COM 2FA
if (document.getElementById('enviar')) {
  document.getElementById('enviar').onclick = async () => {
    const username = document.getElementById('new-email').value;
    const senha = document.getElementById('new-password').value;

    if (!username || !senha) {
      document.getElementById('reg-msg').innerText = 'Preencha todos os campos.';
      return;
    }

    const respostaRegistro = await window.api.registrar({ username, senha });

    if (respostaRegistro.sucesso) {
      const resposta2FA = await window.api.enviarCodigo2FA(username);

      if (resposta2FA.sucesso) {
        window.location.href = `verificar.html?email=${encodeURIComponent(username)}`;
      } else {
        document.getElementById('reg-msg').innerText = 'Erro ao enviar código 2FA.';
      }
    } else {
      document.getElementById('reg-msg').innerText = respostaRegistro.erro;
    }
  };
}

// LOGIN
if (document.getElementById('entrada')) {
  const loginHandler = async () => {
    const username = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (!username || !senha) {
      document.getElementById('login-msg').innerText = 'Preencha todos os campos.';
      document.getElementById('login-msg').style.color = 'red';
      return;
    }

    const resposta = await window.api.login({ username, senha });

    if (resposta.sucesso) {
      document.getElementById('login-msg').innerText = 'Login bem-sucedido!';
      document.getElementById('login-msg').style.color = 'green';
      localStorage.setItem('userEmail', username);
      setTimeout(() => {
        window.location.href = '../FrontEnd/index.html';
      }, 1000);
    } else {
      // Se o erro for "Conta ainda não verificada via 2FA." mostra link para verificar
      if (resposta.erro === 'Conta ainda não verificada via 2FA.') {
        document.getElementById('login-msg').innerHTML = `
          ${resposta.erro} 
          <a href="verificar.html?email=${encodeURIComponent(username)}" style="margin-left: 8px;">Verificar 2FA</a>
        `;
      } else {
        document.getElementById('login-msg').innerText = resposta.erro;
      }
      document.getElementById('login-msg').style.color = '#e1b20e';
    }
  };

  document.getElementById('entrada').onclick = loginHandler;

  ['email', 'password'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          loginHandler();
        }
      });
    }
  });
}

// RECUPERAÇÃO DE SENHA
if (document.getElementById('recuperar')) {
  document.getElementById('recuperar').onclick = async () => {
    const email = document.getElementById('email').value;

    if (!email) {
      document.getElementById('rec-msg').innerText = 'Preencha o campo de e-mail.';
      return;
    }

    const resposta = await window.api.recuperarSenha(email);

    if (resposta.sucesso) {
      document.getElementById('rec-msg').innerText = 'Código enviado para o e-mail.';
      document.getElementById('rec-msg').style.color = 'green';
      setTimeout(() => {
        window.location.href = `resetar.html?email=${encodeURIComponent(email)}`;
      }, 1000);
    } else {
      document.getElementById('rec-msg').innerText = resposta.erro;
      document.getElementById('rec-msg').style.color = 'red';
    }
  };
}
