import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorporationComponent } from './corporation.component';

import { AuthGuard } from './../../shared/guards/auth/auth.guard';
import { CorporationAuthGuard } from './../../shared/guards/auth/corporation-auth.guard';

const routes: Routes = [
    {
        path: '', component: CorporationComponent,
        canActivate: [CorporationAuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CorporationRoutingModule { }
