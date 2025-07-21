const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const { API_KEY, EMAIL_SENDER, EMAIL_PASSWORD } = process.env;
const knex = require('./knexfile');
const { classificarPergunta, responderPergunta: responderGemini } = require('./gemini');
const { inserirTimes } = require('./futebolAPI');

const usersFile = path.join(__dirname, 'usuarios.json');
let tentativas = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_SENDER,
    pass: EMAIL_PASSWORD,
  },
});

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('../FrontEnd/login.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Login
ipcMain.handle('login', async (event, { username, senha }) => {
  if (!tentativas[username]) tentativas[username] = 0;

  if (tentativas[username] >= 3) {
    return { sucesso: false, erro: 'Usuário bloqueado por tentativas inválidas' };
  }

  try {
    const usuarioSQL = await knex('users').where('email', username).first();
    if (usuarioSQL) {
      if (usuarioSQL.status !== 'verificado') {
        return { sucesso: false, erro: 'Conta ainda não verificada via 2FA.' };
      }

      const senhaCorreta = await bcrypt.compare(senha, usuarioSQL.password_hash);
      if (senhaCorreta) {
        tentativas[username] = 0;
        return { sucesso: true };
      } else {
        tentativas[username]++;
        return { sucesso: false, erro: 'Senha incorreta' };
      }
    }
  } catch (err) {
    console.error('Erro ao verificar login no banco de dados:', err);
  }

  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
  }

  const user = users.find(u => u.email === username);
  if (!user) {
    tentativas[username]++;
    return { sucesso: false, erro: 'Usuário não encontrado' };
  }

  const senhaCorreta = await bcrypt.compare(senha, user.passwordHash);
  if (senhaCorreta) {
    tentativas[username] = 0;
    return { sucesso: true };
  } else {
    tentativas[username]++;
    return { sucesso: false, erro: 'Senha incorreta' };
  }
});

// Registro com 2FA
ipcMain.handle('registrar', async (event, { username, senha }) => {
  try {
    const usuarioExistenteSQL = await knex('users').where('email', username).first();
    if (usuarioExistenteSQL) {
      return { sucesso: false, erro: 'Usuário já existe no banco de dados' };
    }

    const codigo2FA = crypto.randomBytes(3).toString('hex');
    const expira = new Date(Date.now() + 5 * 60 * 1000);

    await knex('users').insert({
      email: username,
      password_hash: await bcrypt.hash(senha, 10),
      status: 'aguardando_verificacao',
      codigo_2fa: codigo2FA,
      expira_em: expira,
    });

    await transporter.sendMail({
      from: `"Chatbot" <${EMAIL_SENDER}>`,
      to: username,
      subject: 'Código de verificação',
      text: `Seu código de verificação é: ${codigo2FA}`,
    });

    return { sucesso: true, mensagem: 'Usuário registrado. Verifique seu e-mail para ativar a conta.' };
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    return { sucesso: false, erro: 'Erro ao registrar usuário' };
  }
});


ipcMain.handle('verificar2FA', async (event, { email, codigo }) => {
  try {
    const usuario = await knex('users').where({ email }).first();

    if (usuario && usuario.codigo_2fa === codigo && new Date(usuario.expira_em) > new Date()) {
      await knex('users').where({ email }).update({
        codigo_2fa: null,
        expira_em: null,
      });
      return { sucesso: true };
    } else {
      return { sucesso: false, erro: 'Código inválido ou expirado' };
    }
  } catch (err) {
    console.error('Erro ao verificar código 2FA:', err);
    return { sucesso: false, erro: 'Erro interno' };
  }
});

ipcMain.handle('enviarCodigo2FA', async (event, email) => {
  try {
    const codigo = gerarCodigo();
    const expira = new Date(Date.now() + 5 * 60 * 1000);

    await knex('users').where({ email }).update({
      codigo_2fa: codigo,
      expira_em: expira,
    });

    await transporter.sendMail({
      from: `"Chatbot" <${EMAIL_SENDER}>`,
      to: email,
      subject: 'Seu código de verificação',
      text: `Código de verificação: ${codigo}`,
    });

    return { sucesso: true };
  } catch (err) {
    console.error('Erro ao enviar código 2FA:', err);
    return { sucesso: false, erro: 'Erro ao enviar código' };
  }
});

ipcMain.handle('recuperarSenha', async (event, email) => {
  try {
    const user = await knex('users').where({ email }).first();
    if (!user) return { sucesso: false, erro: 'Usuário não encontrado' };

    const codigo = gerarCodigo();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await knex('password_resets').insert({
      email,
      token: codigo,
      expires_at: expires,
    });

    await transporter.sendMail({
      from: `"Chatbot" <${EMAIL_SENDER}>`,
      to: email,
      subject: 'Código para redefinição de senha',
      text: `Seu código para redefinir a senha é: ${codigo}`,
    });

    return { sucesso: true };
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    return { sucesso: false, erro: 'Erro ao enviar e-mail' };
  }
});

ipcMain.handle('resetarSenha', async (event, { token, novaSenha }) => {
  try {
    const reset = await knex('password_resets')
      .where({ token })
      .andWhere('expires_at', '>', new Date())
      .first();

    if (!reset) return { sucesso: false, erro: 'Código inválido ou expirado' };

    const hash = await bcrypt.hash(novaSenha, 10);
    await knex('users').where({ email: reset.email }).update({ password_hash: hash });
    await knex('password_resets').where({ token }).del();

    return { sucesso: true };
  } catch (err) {
    console.error('Erro ao resetar senha:', err);
    return { sucesso: false, erro: 'Erro interno ao resetar senha' };
  }
});

ipcMain.handle('salvarMensagem', async (event, mensagem) => {
  try {
    await knex('messages').insert({
      user_email: mensagem.email,
      content: mensagem.content,
      sender: mensagem.sender,
      favorita: mensagem.favorita || 0,
      timestamp: new Date(),
      conversa_id: mensagem.conversa_id || null
    });
    return { sucesso: true };
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    return { sucesso: false, erro: 'Erro ao salvar mensagem' };
  }
});

ipcMain.handle('getMensagensPorEmail', async (event, email) => {
  try {
    const mensagens = await knex('messages')
      .where('user_email', email)
      .orderBy('timestamp', 'asc');
    return mensagens;
  } catch (err) {
    console.error('[ERRO] Ao buscar mensagens:', err);
    return [];
  }
});

ipcMain.handle('classificarPergunta', async (event, pergunta) => {
  try {
    const categoria = await classificarPergunta(pergunta);
    return categoria;
  } catch (err) {
    console.error('Erro ao classificar pergunta:', err);
    return 'erro';
  }
});

ipcMain.handle('responderPergunta', async (event, pergunta) => {
  try {
    const consultaExistente = await knex('queries')
      .where('user_query', pergunta)
      .first();

    if (consultaExistente) {
      return consultaExistente.response;
    }

    const respostaGerada = await responderGemini(pergunta);

    await knex('queries').insert({
      user_query: pergunta,
      response: respostaGerada,
    });

    return respostaGerada;
  } catch (err) {
    console.error('[ERRO] Falha ao responder pergunta:', err);
    return 'Erro ao gerar resposta.';
  }
});

cron.schedule('0 0 * * *', () => {
  console.log('[INFO] Atualizando dados dos times...');
  inserirTimes(knex);
});

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// Finaliza o registro após verificação 2FA
ipcMain.handle('registrarFinalizado', async (event, email) => {
  try {
    const usuario = await knex('users').where({ email }).first();

    if (!usuario) {
      return { sucesso: false, erro: 'Usuário não encontrado' };
    }

    if (usuario.status !== 'aguardando_verificacao') {
      return { sucesso: false, erro: 'Usuário já verificado ou em status inválido' };
    }

    await knex('users').where({ email }).update({
      status: 'verificado',
    });

    return { sucesso: true };
  } catch (err) {
    console.error('Erro ao finalizar registro:', err);
    return { sucesso: false, erro: 'Erro ao finalizar registro' };
  }
});