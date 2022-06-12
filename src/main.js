const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs/promises");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const handleCommunication = () => {
  ipcMain.removeHandler("save-to-file");
  ipcMain.removeHandler("restore-from-file");
  ipcMain.handle("save-to-file", async (event, data) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: "todo.json",
      });

      if (!canceled) {
        await fs.writeFile(filePath, data, "utf8");

        return { success: true };
      }
      return {
        canceled,
      };
    } catch (error) {
      return { error };
    }
  });
  ipcMain.handle("restore-from-file", async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "json",
            extensions: ["json"],
          },
        ],
      });

      if (!canceled) {
        const [filePath] = filePaths;
        const data = await fs.readFile(filePath, "utf8");

        return { success: true, data };
      } else {
        return { canceled };
      }
    } catch (error) {
      return { error };
    }
  });
};
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
  handleCommunication();
};

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
