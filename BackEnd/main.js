const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { API_KEY } = process.env;  // API Key do arquivo .env

// Gemini e banco de dados
const { classificarPergunta, responderPergunta: responderGemini } = require('./gemini');
const knex = require('./knexfile');
const { inserirTimes } = require('./futebolAPI');  // Importando a função de inserção de times

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

  // Verifica primeiro no banco de dados SQL
  try {
    const usuarioSQL = await knex('users').where('email', username).first();
    if (usuarioSQL) {
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

  // Se não encontrar no banco, verifica no arquivo JSON
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
  try {
    // Verifica se o email já está cadastrado no banco SQL
    const usuarioExistenteSQL = await knex('users').where('email', username).first();
    if (usuarioExistenteSQL) {
      return { sucesso: false, erro: 'Usuário já existe no banco de dados' };
    }

    // Verifica no arquivo JSON se o usuário já existe
    let users = [];
    if (fs.existsSync(usersFile)) {
      users = JSON.parse(fs.readFileSync(usersFile));
    }
    const existente = users.find(u => u.email === username);
    if (existente) {
      return { sucesso: false, erro: 'Usuário já existe no arquivo JSON' };
    }

    // Gera o hash da senha e registra no banco SQL
    const hash = await bcrypt.hash(senha, 10);
    await knex('users').insert({
      email: username,
      password_hash: hash,
    });

    // Registra também no arquivo JSON
    users.push({ email: username, passwordHash: hash });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    return { sucesso: true };
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    return { sucesso: false, erro: 'Erro ao registrar usuário' };
  }
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
    console.log('[INFO] Verificando pergunta no banco:', pergunta);

    const consultaExistente = await knex('queries')
      .where('user_query', pergunta)
      .first();

    if (consultaExistente) {
      console.log('[INFO] Resposta encontrada no banco de dados.');
      return consultaExistente.response;
    }

    console.log('[INFO] Pergunta não encontrada no banco, gerando resposta...');
    const respostaGerada = await responderGemini(pergunta);

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

// ========== Atualizar Dados dos Times Periodicamente ==========

const cron = require('node-cron');

// Atualizando os times a cada dia à meia-noite
cron.schedule('0 0 * * *', () => {
  console.log('[INFO] Atualizando dados dos times...');
  inserirTimes(knex);  // Chama a função para inserir os dados dos times
});
