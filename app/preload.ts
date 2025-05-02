const {contextBridge, ipcRenderer} = require('electron');

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('databaseAPI', {
    executeQuery: (query: any, params: any) => ipcRenderer.invoke('executeQuery', query, params)
  });
}
