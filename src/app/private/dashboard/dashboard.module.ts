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
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlJa } from './../../shared/classes/mat-paginator-intl-ja/mat-paginator-intl-ja';
import { MatSortModule } from '@angular/material/sort';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LightboxModule } from 'ngx-lightbox';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SidenavComponent } from './../../shared/components/sidenav/sidenav.component';
import { ProjectsComponent } from './projects/projects.component';
import { WorkComponent } from './work/work.component';
import { CreateProjectComponent } from './../../shared/components/create-project/create-project.component';
import { SettingProjectComponent } from './../../shared/components/setting-project/setting-project.component';
import { JoinProjectComponent } from './../../shared/components/join-project/join-project.component';
import { TargetActionsComponent } from './../../shared/components/target-actions/target-actions.component';
import { PhotoCanvasComponent } from './../../shared/components/photo-canvas/photo-canvas.component';
import { ConfirmDeleteComponent } from './../../shared/components/confirm-delete/confirm-delete.component';
import { CautionComponent } from './../../shared/components/caution/caution.component';
import { ImportActionComponent } from './../../shared/components/import-action/import-action.component';
import { UploadTemplateComponent } from './../../shared/components/upload-template/upload-template.component';

import { ProjectsService } from './../../shared/services/projects/projects.service';
import { PlacesService } from './../../shared/services/places/places.service';
import { TargetsService } from './../../shared/services/targets/targets.service';
import { PhotosService } from './../../shared/services/photos/photos.service';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';

import { AuthService } from './../../shared/services/auth/auth.service';
import { AuthInterceptor } from './../../shared/services/auth/auth.interceptor';
import { AlertService } from './../../shared/services/alert/alert.service';

import { GenerateComponent } from './generate/generate.component';
import { GenerateService } from './../../shared/services/generate/generate.service';
import { TemplateService } from './../../shared/services/template/template.service';

import { UserComponent } from './user/user.component';
import { NotificationsComponent } from './notifications/notifications.component';

@NgModule({
  declarations: [
    DashboardComponent,
    SidenavComponent,
    ProjectsComponent,
    WorkComponent,
    CreateProjectComponent,
    SettingProjectComponent,
    JoinProjectComponent,
    TargetActionsComponent,
    PhotoCanvasComponent,
    GenerateComponent,
    UserComponent,
    NotificationsComponent,
    ConfirmDeleteComponent,
    CautionComponent,
    ImportActionComponent,
    UploadTemplateComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSortModule,
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
    NgbModule,
    LightboxModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },
    ProjectsService,
    PlacesService,
    TargetsService,
    NotificationsService,
    PhotosService,
    AlertService,
    GenerateService,
    TemplateService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  exports: [
  ],
  entryComponents: [
    CreateProjectComponent,
    SettingProjectComponent,
    JoinProjectComponent,
    TargetActionsComponent,
    ConfirmDeleteComponent,
    CautionComponent,
    ImportActionComponent,
    UploadTemplateComponent
  ]
})
export class DashboardModule { }
