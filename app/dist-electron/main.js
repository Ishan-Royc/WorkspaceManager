import { ipcMain, dialog, app, BrowserWindow, Menu } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname$1, "..");
process.env.APP_ROOT = APP_ROOT;
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const MAIN_DIST = path.join(APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(APP_ROOT, "dist");
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, "public") : RENDERER_DIST;
process.env.VITE_PUBLIC = VITE_PUBLIC;
let win;
ipcMain.handle(
  "workspace:save",
  async (_event, workspace) => {
    if (!workspace || typeof workspace.title !== "string" || !Array.isArray(workspace.files)) {
      throw new Error("Invalid workspace data.");
    }
    const defaultName = `${workspace.title.replace(/[\\/:*?"<>|]/g, "_") || "Workspace"}.json`;
    const options = {
      defaultPath: defaultName,
      filters: [{ name: "JSON", extensions: ["json"] }]
    };
    const result = win && !win.isDestroyed() ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options);
    const { canceled, filePath } = result;
    if (canceled || !filePath) {
      return { canceled: true };
    }
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(workspace, null, 2),
      "utf8"
    );
    return { canceled: false, filePath };
  }
);
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  const menuTemplate = [];
  if (process.platform === "darwin") {
    menuTemplate.push({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    });
  }
  menuTemplate.push(
    {
      label: "File",
      submenu: [
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => win == null ? void 0 : win.webContents.send("workspace:save-request")
        },
        { type: "separator" },
        { role: "close" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { role: "togglefullscreen" }
      ]
    }
  );
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
