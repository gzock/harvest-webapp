import { ChangeDetectionStrategy,Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMsg = '';
  email = '';
  password = '';
  newPassword = '';
  isSaveEmail = true;
  isDisplayPassword = false;
  formType = 'password';
  isLoading = false;
  requiresNewPassword = false;

  constructor(public router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    this.authService.isAuthenticated().subscribe(authenticated => {
      if (authenticated) this.navigateAfterSignIn();
    });
  }
  onLoggedIn(email: string, password: string): void {
    if (this.isLoading) return;
    this.errorMsg = '';
    this.isLoading = true;
    if (this.isSaveEmail) localStorage.setItem('email', email);
    else localStorage.removeItem('email');
    const request = this.requiresNewPassword
      ? this.authService.completeNewPassword(this.newPassword)
      : this.authService.signIn(email, password);
    request.pipe(finalize(() => this.isLoading = false)).subscribe({
      next: result => {
        if (result.isSignedIn) {
          this.password = '';
          this.newPassword = '';
          this.navigateAfterSignIn();
        } else if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          this.requiresNewPassword = true;
        } else {
          this.errorMsg = '追加の認証が必要です。管理者にお問い合わせください。';
        }
      },
      error: () => this.errorMsg = this.requiresNewPassword
        ? 'パスワードを変更できませんでした。要件を確認して再度お試しください。'
        : 'ログインに失敗しました。メールアドレスとパスワードをご確認ください。',
    });
  }
  onSwitchDisplayPassword(): void {
    this.formType = this.isDisplayPassword ? 'password' : 'text';
  }
  private navigateAfterSignIn(): void {
    this.authService.isCorporationUser().subscribe(corporation => {
      void this.router.navigate([corporation ? '/corporation' : '/dashboard/projects']);
    });
  }
}
