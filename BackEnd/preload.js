const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registrar: (dados) => ipcRenderer.invoke('registrar', dados),
  login: (dados) => ipcRenderer.invoke('login', dados),

  responderPergunta: (pergunta) =>
    ipcRenderer.invoke('responderPergunta', pergunta),

  classificarPergunta: (pergunta) =>
    ipcRenderer.invoke('classificarPergunta', pergunta),
});

// Se você não usar o 'electronAPI.enviarMensagem', pode remover abaixo
contextBridge.exposeInMainWorld('electronAPI', {
  enviarMensagem: (msg) => ipcRenderer.invoke('enviar-mensagem', msg),
});
