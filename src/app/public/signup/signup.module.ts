import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';


import { ConfirmSignupComponent } from './../../shared/components/confirm-signup/confirm-signup.component';
import { AlertService } from './../../shared/services/alert/alert.service';
import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';

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
    ],})
export class SignupModule {
}
