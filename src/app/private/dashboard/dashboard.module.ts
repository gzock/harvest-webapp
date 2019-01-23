import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SidenavComponent } from './../../shared/components/sidenav/sidenav.component';
import { ProjectsComponent } from './projects/projects.component';
import { WorkComponent } from './work/work.component';

@NgModule({
  declarations: [
    DashboardComponent,
    SidenavComponent,
    ProjectsComponent,
    WorkComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatTabsModule
  ]
})
export class DashboardModule { }
