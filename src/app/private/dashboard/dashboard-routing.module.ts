import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { WorkComponent } from './work/work.component';
import { GenerateComponent } from './generate/generate.component';
import { UserComponent } from './user/user.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
    {
        path: '', component: DashboardComponent,
        children: [
            { path: 'blank-page', loadChildren: './blank-page/blank-page.module#BlankPageModule' },
            { path: 'user', component: UserComponent },
            { path: 'notifications', component: NotificationsComponent },
            { path: 'projects', component: ProjectsComponent },
            { path: 'work', component: WorkComponent },
            { path: 'generate', component: GenerateComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
