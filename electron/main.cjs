const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron");
const fs = require("fs/promises");
const path = require("path");

const isDev = !app.isPackaged;
let mainWindow = null;
let currentFilePath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#121212",
    title: "Sketchora",

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3001");
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "..", "excalidraw-app", "build", "index.html"),
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function openFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Sketchora Files",
        extensions: ["excalidraw"],
      },
      {
        name: "All Files",
        extensions: ["*"],
      },
    ],
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, "utf8");

  currentFilePath = filePath;

  if (mainWindow) {
    mainWindow.setTitle(`Sketchora - ${path.basename(filePath)}`);
  }

  return {
    filePath,
    content,
  };
}

async function saveFile({ filePath, content }) {
  if (!filePath) {
    return saveFileAs({ content });
  }

  await fs.writeFile(filePath, content, "utf8");

  currentFilePath = filePath;

  if (mainWindow) {
    mainWindow.setTitle(`Sketchora - ${path.basename(filePath)}`);
  }

  return {
    filePath,
    saved: true,
  };
}

async function saveFileAs({ content }) {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: currentFilePath || "Untitled.excalidraw",
    filters: [
      {
        name: "Sketchora Files",
        extensions: ["excalidraw"],
      },
    ],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  let filePath = result.filePath;

  if (!filePath.toLowerCase().endsWith(".excalidraw")) {
    filePath += ".excalidraw";
  }

  await fs.writeFile(filePath, content, "utf8");

  currentFilePath = filePath;

  if (mainWindow) {
    mainWindow.setTitle(`Sketchora - ${path.basename(filePath)}`);
  }

  return {
    filePath,
    saved: true,
  };
}

function sendToRenderer(channel, data = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CmdOrCtrl+N",
          click: () => sendToRenderer("menu:new"),
        },
        {
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const result = await openFile();
            if (result) {
              sendToRenderer("menu:open-result", result);
            }
          },
        },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => sendToRenderer("menu:save"),
        },
        {
          label: "Save As...",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => sendToRenderer("menu:save-as"),
        },
        { type: "separator" },
        {
          role: "quit",
        },
      ],
    },
    {
      role: "editMenu",
    },
    {
      role: "viewMenu",
    },
    {
      role: "windowMenu",
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle("file:open", openFile);

ipcMain.handle("file:save", async (_event, payload) => {
  return saveFile(payload);
});

ipcMain.handle("file:save-as", async (_event, payload) => {
  return saveFileAs(payload);
});

ipcMain.handle("file:get-current-path", () => currentFilePath);

app.whenReady().then(() => {
  createWindow();
  createMenu();

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
