import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _open = new BehaviorSubject(false);
  sidebarOpen$ = this._open.asObservable();
  toggle(): void { this._open.next(!this._open.value); }
  close():  void { this._open.next(false); }
}
