import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
//import { LoginService } from './login.service';

@NgModule({
    imports: [
        CommonModule,
        LoginRoutingModule,
        FormsModule
    ],
    declarations: [LoginComponent],
//    providers: [ LoginService ]
})
export class LoginModule {
}
