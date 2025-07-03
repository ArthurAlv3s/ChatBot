const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registrar: (dados) => ipcRenderer.invoke('registrar', dados),
  login: (dados) => ipcRenderer.invoke('login', dados),

  salvarMensagem: (mensagem) => ipcRenderer.invoke('salvarMensagem', mensagem),
  getMensagensPorEmail: (email) => ipcRenderer.invoke('getMensagensPorEmail', email),
  // 2FA
  enviarCodigo2FA: (email) => ipcRenderer.invoke('enviarCodigo2FA', email),
  verificar2FA: (dados) => ipcRenderer.invoke('verificar2FA', dados),

  // Recuperação e reset de senha
  recuperarSenha: (email) => ipcRenderer.invoke('recuperarSenha', email),
  resetarSenha: (dados) => ipcRenderer.invoke('resetarSenha', dados),

  // Gemini (chatbot)
  responderPergunta: (pergunta) => ipcRenderer.invoke('responderPergunta', pergunta),
  classificarPergunta: (pergunta) => ipcRenderer.invoke('classificarPergunta', pergunta),
});

contextBridge.exposeInMainWorld('electronAPI', {
  enviarMensagem: (msg) => ipcRenderer.invoke('enviar-mensagem', msg),
});
