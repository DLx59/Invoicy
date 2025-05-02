import { Injectable } from '@angular/core';
import { ElectronService as NgxElectronService } from 'ngx-electronyzer';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  constructor(
    private electron: NgxElectronService,
  ) { }

  public getVersion(): Promise<string> {
    return this.electron.ipcRenderer.invoke("getVersion");
  }
}
