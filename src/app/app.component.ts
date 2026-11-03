import { ChangeDetectionStrategy,Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'harvest-webapp';
  updateReady = false;
  constructor(updates: SwUpdate) {
    if (updates.isEnabled) {
      updates.versionUpdates.pipe(takeUntilDestroyed()).subscribe(event => {
        if (event.type === 'VERSION_READY') this.updateReady = true;
      });
    }
  }
  reloadForUpdate(): void {
    if (window.confirm('更新すると入力中の内容は失われます。保存やアップロードが完了したことを確認して更新してください。')) {
      window.location.reload();
    }
  }
}
