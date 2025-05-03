import { app, ipcMain } from "electron";

export class ElectronService {
  private static _instance: ElectronService;

  public static get instance(): ElectronService {
    if (!ElectronService._instance) {
      ElectronService._instance = new ElectronService();
    }
    return ElectronService._instance;
  }

  private constructor() {
    this.init();
  }

  private init() {
    ipcMain.handle("getVersion", async () => {
      return app.getVersion();
    });
  }
}
