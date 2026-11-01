import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DATE_LOCALE,MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl,MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorIntlJa } from './../../shared/classes/mat-paginator-intl-ja/mat-paginator-intl-ja';



import { CautionComponent } from './../../shared/components/caution/caution.component';
import { ConfirmDeleteComponent } from './../../shared/components/confirm-delete/confirm-delete.component';
import { CreateProjectComponent } from './../../shared/components/create-project/create-project.component';
import { ImportActionComponent } from './../../shared/components/import-action/import-action.component';
import { JoinProjectComponent } from './../../shared/components/join-project/join-project.component';
import { PhotoCanvasComponent } from './../../shared/components/photo-canvas/photo-canvas.component';
import { SettingProjectComponent } from './../../shared/components/setting-project/setting-project.component';
import { SidenavComponent } from './../../shared/components/sidenav/sidenav.component';
import { TargetActionsComponent } from './../../shared/components/target-actions/target-actions.component';
import { UploadTemplateComponent } from './../../shared/components/upload-template/upload-template.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { WorkComponent } from './work/work.component';



import { GenerateComponent } from './generate/generate.component';

import { NotificationsComponent } from './notifications/notifications.component';
import { UserComponent } from './user/user.component';

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


  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlJa },








  ],
  exports: [
  ],})
export class DashboardModule { }
