"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...listenerArgs) => listener(event, ...listenerArgs)
    );
  },
  off(...args) {
    const [channel, ...listenerArgs] = args;
    return electron.ipcRenderer.off(channel, ...listenerArgs);
  },
  send(...args) {
    const [channel, ...sendArgs] = args;
    return electron.ipcRenderer.send(channel, ...sendArgs);
  },
  invoke(...args) {
    const [channel, ...invokeArgs] = args;
    return electron.ipcRenderer.invoke(channel, ...invokeArgs);
  }
});
electron.contextBridge.exposeInMainWorld("workspaceApi", {
  saveWorkspace: (workspace) => electron.ipcRenderer.invoke("workspace:save", workspace),
  onSaveRequested: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("workspace:save-request", listener);
    return () => electron.ipcRenderer.removeListener("workspace:save-request", listener);
  }
});
