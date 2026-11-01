import { ChangeDetectionStrategy,Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-confirm-signup',
  templateUrl: './confirm-signup.component.html',
  styleUrls: ['./confirm-signup.component.scss']
})
export class ConfirmSignupComponent {
  public errMsg: string = '';
  public code: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmSignupComponent>
  ) { }


  public onConfirm(code: string) {
    this.dialogRef.close(code);
  }

}
