import { app, ipcMain } from "electron";

export class ElectronService {

    private static instance: ElectronService;

    public get instance() {
        return ElectronService.instance;
    }

    constructor() {
        if (ElectronService.instance) {
            return ElectronService.instance;
        }

        ElectronService.instance = this;

        this.init();
    }

    private init() {

        ipcMain.handle("getVersion", async () => {
            return app.getVersion();
        });

    }

}