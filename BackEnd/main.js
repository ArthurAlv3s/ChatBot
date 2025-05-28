const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const API_KEY = process.env.API_KEY;


// Gemini e banco de dados
const { classificarPergunta, responderPergunta: responderGemini } = require('./gemini');
const knex = require('./knexfile');

const usersFile = path.join(__dirname, 'usuarios.json');
let tentativas = {};

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

// ========== LOGIN ==========

ipcMain.handle('login', async (event, { username, senha }) => {
  if (!tentativas[username]) tentativas[username] = 0;

  if (tentativas[username] >= 3) {
    return { sucesso: false, erro: 'Usuário bloqueado por tentativas inválidas' };
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

// ========== REGISTRO ==========

ipcMain.handle('registrar', async (event, { username, senha }) => {
  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
  }

  const existente = users.find(u => u.email === username);
  if (existente) {
    return { sucesso: false, erro: 'Usuário já existe' };
  }

  const hash = await bcrypt.hash(senha, 10);
  users.push({ email: username, passwordHash: hash });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  return { sucesso: true };
});

// ========== CLASSIFICAR PERGUNTA ==========

ipcMain.handle('classificarPergunta', async (event, pergunta) => {
  try {
    const categoria = await classificarPergunta(pergunta);
    return categoria;
  } catch (err) {
    console.error('Erro ao classificar pergunta:', err);
    return 'erro';
  }
});

// ========== RESPONDER PERGUNTA COM VERIFICAÇÃO NO BANCO ==========

ipcMain.handle('responderPergunta', async (event, pergunta) => {
  try {
    // Verifica se a pergunta já existe no banco
    console.log('[INFO] Verificando pergunta no banco:', pergunta);

    const consultaExistente = await knex('queries')
      .where('user_query', pergunta)
      .first();

    if (consultaExistente) {
      console.log('[INFO] Resposta encontrada no banco de dados.');
      return consultaExistente.response;
    }

    // Gera resposta com Gemini
    console.log('[INFO] Pergunta não encontrada no banco, gerando resposta...');
    const respostaGerada = await responderGemini(pergunta);

    // Salva no banco
    console.log('[INFO] Salvando nova resposta no banco...');
    await knex('queries').insert({
      user_query: pergunta,
      response: respostaGerada
    });

    console.log('[OK] Resposta salva com sucesso no banco.');

    return respostaGerada;
  } catch (err) {
    console.error('[ERRO] Falha ao responder pergunta:', err);
    return 'Erro ao gerar resposta.';
  }
});

// Placeholder para função futura
ipcMain.handle('enviar-mensagem', async (event, msg) => {
  return "Resposta não implementada ainda";
});
const cron = require('node-cron');

cron.schedule('0 0 * * *', () => {
  console.log('Atualizando dados dos times...');
  inserirTimes();
});