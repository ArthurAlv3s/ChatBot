document.getElementById('verificar').onclick = async () => {
  const codigo = document.getElementById('codigo2fa').value;
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');

  if (!codigo || !email) {
    document.getElementById('verificar-msg').innerText = 'Código ou e-mail ausente.';
    return;
  }

  const resposta = await window.api.verificar2FA({ email, codigo });

  if (resposta.sucesso) {
    const respostaRegistro = await window.api.registrarFinalizado(email);

    if (respostaRegistro.sucesso) {
      document.getElementById('verificar-msg').innerText = 'Verificado com sucesso e registrado!';
      setTimeout(() => {
        window.location.href = '../FrontEnd/login.html';
      }, 1000);
    } else {
      document.getElementById('verificar-msg').innerText = respostaRegistro.erro || 'Erro ao registrar o usuário.';
    }
  } else {
    document.getElementById('verificar-msg').innerText = resposta.erro || 'Código inválido ou expirado.';
  }
};

// Botão reenviar código
document.getElementById('reenviar').onclick = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');

  if (!email) {
    document.getElementById('verificar-msg').innerText = 'E-mail ausente para reenviar código.';
    return;
  }

  const resposta = await window.api.enviarCodigo2FA(email);

  if (resposta.sucesso) {
    document.getElementById('verificar-msg').innerText = 'Código reenviado para seu e-mail.';
  } else {
    document.getElementById('verificar-msg').innerText = resposta.erro || 'Erro ao reenviar código.';
  }
};
