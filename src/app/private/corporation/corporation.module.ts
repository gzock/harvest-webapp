import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatNativeDateModule, MatInputModule, MAT_DATE_LOCALE } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CorporationRoutingModule } from './corporation-routing.module';
import { CorporationService } from './../../shared/services/corporation/corporation.service';

import { AuthService } from './../../shared/services/auth/auth.service';
import { AuthInterceptor } from './../../shared/services/auth/auth.interceptor';
import { AlertService } from './../../shared/services/alert/alert.service';

import { CreateUserComponent } from './../../shared/components/create-user/create-user.component';

import { CorporationComponent } from './corporation.component';

@NgModule({
  declarations: [
    CorporationComponent,
    CreateUserComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CorporationRoutingModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatTableModule,
    MatRadioModule,
    MatDialogModule,
    MatBottomSheetModule,
    MatDividerModule,
    MatBadgeModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    NgbModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    AlertService,
    CorporationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  exports: [
  ],
  entryComponents: [
    CreateUserComponent
  ]
})
export class CorporationModule { }
