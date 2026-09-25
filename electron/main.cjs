const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron");
const fs = require("fs/promises");
const path = require("path");

const isDev = !app.isPackaged;
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  let mainWindow = null;
  let currentFilePath = null;
  let pendingOpenPath = null;

  function setWindowTitle(filePath = null, dirty = false) {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    const fileName = filePath ? path.basename(filePath) : "Untitled";
    mainWindow.setTitle(`${dirty ? "*" : ""}${fileName} - Sketchora`);
  }

  function send(channel, data) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }
  }

  async function readSketchoraFile(filePath) {
    const content = await fs.readFile(filePath, "utf8");
    JSON.parse(content);
    currentFilePath = filePath;
    app.addRecentDocument(filePath);
    setWindowTitle(filePath, false);
    return { filePath, content };
  }

  async function openFile() {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        { name: "Sketchora Files", extensions: ["excalidraw"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled || !result.filePaths[0]) {
      return null;
    }

    try {
      return await readSketchoraFile(result.filePaths[0]);
    } catch (error) {
      await dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "Cannot Open File",
        message: "The selected file is not a valid Sketchora drawing.",
        detail: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async function saveFile({ filePath, content }) {
    if (!filePath) {
      return saveFileAs({ content });
    }

    await fs.writeFile(filePath, content, "utf8");
    currentFilePath = filePath;
    app.addRecentDocument(filePath);
    setWindowTitle(filePath, false);
    return { filePath, saved: true };
  }

  async function saveFileAs({ content }) {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: currentFilePath || "Untitled.excalidraw",
      filters: [{ name: "Sketchora Files", extensions: ["excalidraw"] }],
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    const filePath = result.filePath.toLowerCase().endsWith(".excalidraw")
      ? result.filePath
      : `${result.filePath}.excalidraw`;

    await fs.writeFile(filePath, content, "utf8");
    currentFilePath = filePath;
    app.addRecentDocument(filePath);
    setWindowTitle(filePath, false);
    return { filePath, saved: true };
  }

  function createMenu() {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: "File",
          submenu: [
            {
              label: "New",
              accelerator: "CmdOrCtrl+N",
              click: () => send("menu:new"),
            },
            {
              label: "Open...",
              accelerator: "CmdOrCtrl+O",
              click: () => send("menu:open"),
            },
            { type: "separator" },
            {
              label: "Save",
              accelerator: "CmdOrCtrl+S",
              click: () => send("menu:save"),
            },
            {
              label: "Save As...",
              accelerator: "CmdOrCtrl+Shift+S",
              click: () => send("menu:save-as"),
            },
            { type: "separator" },
            { role: "quit" },
          ],
        },
        { role: "editMenu" },
        { role: "viewMenu" },
        { role: "windowMenu" },
      ]),
    );
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 900,
      minHeight: 600,
      backgroundColor: "#121212",
      title: "Untitled - Sketchora",
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    mainWindow.once("ready-to-show", () => mainWindow.show());

    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    if (isDev) {
      mainWindow.loadURL("http://localhost:3001");
    } else {
      mainWindow.loadFile(
        path.join(__dirname, "..", "excalidraw-app", "build", "index.html"),
      );
    }
  }

  async function handleOpenPath(filePath) {
    if (!filePath || !mainWindow) {
      return;
    }

    try {
      send("file:open-result", await readSketchoraFile(filePath));
    } catch (error) {
      await dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "Cannot Open File",
        message: "Sketchora could not open this file.",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  ipcMain.handle("file:open", openFile);
  ipcMain.handle("file:save", (_event, payload) => saveFile(payload));
  ipcMain.handle("file:save-as", (_event, payload) => saveFileAs(payload));
  ipcMain.handle("file:get-current-path", () => currentFilePath);
  ipcMain.on("window:set-title", (_event, payload) => {
    setWindowTitle(payload.filePath, payload.dirty);
  });

  app.on("second-instance", (_event, commandLine) => {
    const filePath = commandLine.find((arg) =>
      arg.toLowerCase().endsWith(".excalidraw"),
    );

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      if (filePath) {
        void handleOpenPath(filePath);
      }
    }
  });

  app.on("open-file", (event, filePath) => {
    event.preventDefault();
    if (mainWindow) {
      void handleOpenPath(filePath);
    } else {
      pendingOpenPath = filePath;
    }
  });

  app.whenReady().then(() => {
    app.setAppUserModelId("com.sketchora.app");
    createWindow();
    createMenu();

    if (pendingOpenPath) {
      const filePath = pendingOpenPath;
      pendingOpenPath = null;
      mainWindow.webContents.once("did-finish-load", () => {
        void handleOpenPath(filePath);
      });
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
