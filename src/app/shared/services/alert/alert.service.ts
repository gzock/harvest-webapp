import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  private openSnackBar(message: string, action: string, duration: number, cls: [string]) {
    this.snackBar.open(message, action, {
      duration: duration,
      panelClass: cls
    });
  }

  public openErrorAlert(message: string) {
    this.openSnackBar(message, "Close", 3000, ["btn-danger","disabled"]);
  }

  public openSucccessAlert(message: string) {
    this.openSnackBar(message, "Close", 1500, ["btn-success","disabled"]);
  }
}
