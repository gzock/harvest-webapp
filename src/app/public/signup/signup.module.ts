import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule, MatIconModule, MatInputModule } from '@angular/material';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import { ConfirmSignupComponent } from './../../shared/components/confirm-signup/confirm-signup.component';
import { AlertService } from './../../shared/services/alert/alert.service';

@NgModule({
    imports: [
      CommonModule,
      SignupRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      MatCheckboxModule,
      MatCardModule,
      MatFormFieldModule,
      MatButtonModule,
      MatIconModule,
      MatInputModule,
      MatRadioModule,
      MatDialogModule,
    MatSnackBarModule
    ],
    declarations: [
      SignupComponent,
      ConfirmSignupComponent
    ],
    providers: [ 
      AlertService
    ],
    entryComponents: [
      ConfirmSignupComponent
    ]
})
export class SignupModule {
}
