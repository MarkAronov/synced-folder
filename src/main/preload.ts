import { contextBridge, ipcRenderer, IpcRendererEvent, dialog } from 'electron';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: any, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: any, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: any, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  dialog: {
    showOpenDialog() {
      return dialog.showOpenDialog({ properties: ['openDirectory'] });
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
