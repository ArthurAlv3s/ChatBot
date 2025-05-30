document.getElementById('confirmar').onclick = async () => {
  const token = document.getElementById('token').value.trim();
  const novaSenha = document.getElementById('novaSenha').value.trim();
  const msg = document.getElementById('msg');

  if (!token || !novaSenha) {
    msg.innerText = 'Por favor, preencha todos os campos.';
    return;
  }

  const resposta = await window.api.resetarSenha({ token, novaSenha });

  if (resposta.sucesso) {
    msg.innerText = 'Senha redefinida com sucesso! Você será redirecionado para o login.';
    setTimeout(() => {
      window.location.href = './login.html';
    }, 2000);
  } else {
    msg.innerText = resposta.erro || 'Erro ao redefinir senha.';
  }
};
