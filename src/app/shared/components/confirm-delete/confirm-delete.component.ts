import { ChangeDetectionStrategy,Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent {
  public errMsg: string = '';
  public code: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>
  ) { }


  public onAccept() {
    this.dialogRef.close(true);
  }

}
