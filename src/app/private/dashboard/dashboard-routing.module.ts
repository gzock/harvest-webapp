import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { WorkComponent } from './work/work.component';
import { GenerateComponent } from './generate/generate.component';
import { UserComponent } from './user/user.component';
import { NotificationsComponent } from './notifications/notifications.component';

import { AuthGuard } from './../../shared/guards/auth/auth.guard';

const routes: Routes = [
    {
        path: '', component: DashboardComponent,
        children: [
            { 
              path: 'user', component: UserComponent,
              canActivate: [AuthGuard]
            },
            { 
              path: 'notifications', component: NotificationsComponent,
              canActivate: [AuthGuard]
            },
            { 
              path: 'projects', component: ProjectsComponent,
              canActivate: [AuthGuard]
            },
            {
              path: 'work', component: WorkComponent,
              canActivate: [AuthGuard]
            },
            { 
              path: 'generate', component: GenerateComponent,
              canActivate: [AuthGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
