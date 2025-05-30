document.getElementById('enviarCodigo').onclick = async () => {
  const email = document.getElementById('emailRec').value.trim();
  const msg = document.getElementById('rec-msg');

  if (!email) {
    msg.innerText = 'Digite seu e-mail.';
    return;
  }

  const resposta = await window.api.recuperarSenha(email);

  if (resposta.sucesso) {
    msg.innerText = 'Código enviado! Verifique seu e-mail. Redirecionando...';

    // Aguarda 2 segundos e redireciona para resetar.html com o e-mail na URL
    setTimeout(() => {
      window.location.href = `./resetar.html?email=${encodeURIComponent(email)}`;
    }, 2000);
  } else {
    msg.innerText = resposta.erro || 'Erro ao enviar código.';
  }
};
