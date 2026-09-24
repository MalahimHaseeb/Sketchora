const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sketchora", {
  openFile: () => ipcRenderer.invoke("file:open"),

  saveFile: (payload) => ipcRenderer.invoke("file:save", payload),

  saveFileAs: (payload) => ipcRenderer.invoke("file:save-as", payload),

  getCurrentFilePath: () => ipcRenderer.invoke("file:get-current-path"),

  onMenuNew: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("menu:new", listener);
    return () => ipcRenderer.removeListener("menu:new", listener);
  },

  onMenuOpenResult: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("menu:open-result", listener);
    return () => ipcRenderer.removeListener("menu:open-result", listener);
  },

  onMenuSave: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("menu:save", listener);
    return () => ipcRenderer.removeListener("menu:save", listener);
  },

  onMenuSaveAs: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("menu:save-as", listener);
    return () => ipcRenderer.removeListener("menu:save-as", listener);
  },
});
