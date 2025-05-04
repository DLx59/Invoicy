import {inject, Injectable} from '@angular/core';
import {DatePipe} from "@angular/common";
import {getNextDocumentNumberQuery} from "./document-number-query";

@Injectable({
  providedIn: 'root'
})
export class DocumentNumberService {
  private readonly datePipe = inject(DatePipe);

  async generateNextNumber(type: 'F' | 'D'): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const params = [type, currentYear, type, currentYear];
    const rows = await (window as any).databaseAPI?.executeQuery(getNextDocumentNumberQuery, params);

    if (!rows || !rows[0]?.lastNumber) {
      throw new Error('Erreur lors de la génération du numéro de document');
    }

    const number = rows[0].lastNumber.toString().padStart(5, '0');
    return `${type}${currentYear}${number}`;
  }
}
