const { contextBridge, ipcRenderer } = require("electron");

function subscribe(channel, callback) {
  const listener = (_event, data) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld("sketchora", {
  openFile: () => ipcRenderer.invoke("file:open"),
  saveFile: (payload) => ipcRenderer.invoke("file:save", payload),
  saveFileAs: (payload) => ipcRenderer.invoke("file:save-as", payload),
  getCurrentFilePath: () => ipcRenderer.invoke("file:get-current-path"),
  setWindowTitle: (filePath, dirty) =>
    ipcRenderer.send("window:set-title", { filePath, dirty }),
  onMenuNew: (callback) => subscribe("menu:new", callback),
  onMenuOpen: (callback) => subscribe("menu:open", callback),
  onMenuSave: (callback) => subscribe("menu:save", callback),
  onMenuSaveAs: (callback) => subscribe("menu:save-as", callback),
  onOpenResult: (callback) => subscribe("file:open-result", callback),
});
