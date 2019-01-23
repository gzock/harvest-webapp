import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { WorkComponent } from './work/work.component';

const routes: Routes = [
    {
        path: '', component: DashboardComponent,
        children: [
            { path: 'blank-page', loadChildren: './blank-page/blank-page.module#BlankPageModule' },
            { path: 'projects', component: ProjectsComponent },
            { path: 'work', component: WorkComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
