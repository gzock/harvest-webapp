import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent implements OnInit {
  public errMsg: string;
  public code: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>
  ) { }

  ngOnInit() {
  }

  public onAccept() {
    this.dialogRef.close(true);
  }

}
