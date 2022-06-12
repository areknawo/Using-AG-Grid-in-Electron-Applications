const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveToFile(data) {
    return ipcRenderer.invoke("save-to-file", data);
  },
  restoreFromFile() {
    return ipcRenderer.invoke("restore-from-file");
  },
});
