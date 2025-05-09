const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 640,
webPreferences: {
  preload: path.join(__dirname, 'preload.js'), //caminho pro preload
  nodeIntegration: false, //pelo que vi, ele desabilita a integração com o node por segurança (nn conhecia)
  contextIsolation: true,  //isola o contexto para evitar riscos de segurança

  
}


  }
  
    );
  
    win.loadFile(path.join(__dirname, '../frontend/index.html')); //carrega o Html pelo caminho correto
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if(BrowserWindow.getAllWindows().length === 0) createWindow(); //cria janela caso n tenha nenhuma aberta
    });
      });

      app.on('window-all-closed', () => { //ao fechar todas as janelas, ele fecha tudo da aplicação no sistema operacional.
        if (process.platform !== 'darwin') app.quit();
    });

    ipcMain.on('chat-message', (event, message) => {
      console.log ('Mensagem recebida:', message);

      event.reply('chat-reply', 'Olá! Como posso te ajudar?');

    });