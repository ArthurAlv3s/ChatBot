// verificar.js

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
    document.getElementById('verificar-msg').innerText = 'Verificado com sucesso!';
    setTimeout(() => {
      window.location.href = '../FrontEnd/login.html';
    }, 1000);
  } else {
    document.getElementById('verificar-msg').innerText = resposta.erro || 'Código inválido ou expirado.';
  }
};
