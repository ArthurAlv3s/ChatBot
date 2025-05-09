const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    sendMessage: (message) => ipcRenderer.send('chat-message', message),
    onmessage: (callback) => ipcRenderer.on('chat-reply', (event, reply) => callback(reply)),
});

