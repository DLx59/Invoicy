import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InvoiceNumberService {
  private readonly STORAGE_KEY = 'invoice-counter';
  private readonly _counter: WritableSignal<number> = signal(this.loadCounter());

  public readonly counter = this._counter.asReadonly();

  public generateNextInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const paddedCounter = this._counter().toString().padStart(3, '0');
    return `${year}-${paddedCounter}`;
  }

  public incrementCounter(): void {
    this._counter.update(value => {
      const newValue = value + 1;
      this.saveCounter(newValue);
      return newValue;
    });
  }

  public resetCounter(): void {
    this._counter.set(1);
    this.saveCounter(1);
  }

  public setCounter(value: number): void {
    this._counter.set(value);
    this.saveCounter(value);
  }

  public getCounter(): number {
    return this._counter();
  }

  private loadCounter(): number {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : 1;
    return isNaN(parsed) ? 1 : parsed;
  }

  private saveCounter(value: number): void {
    localStorage.setItem(this.STORAGE_KEY, value.toString());
  }
}
