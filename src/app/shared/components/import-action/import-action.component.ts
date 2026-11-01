import { ChangeDetectionStrategy,Component,OnDestroy } from '@angular/core';
import { finalize,ReplaySubject,switchMap,takeUntil } from 'rxjs';
import { readDataUrl } from '../../utils/file';

import { MatDialogRef } from '@angular/material/dialog';


import { AlertService } from './../../services/alert/alert.service';
import { ProjectsService } from './../../services/projects/projects.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-import-action',
  templateUrl: './import-action.component.html',
  styleUrls: ['./import-action.component.scss']
})
export class ImportActionComponent implements OnDestroy {
  private readonly destroy$ = new ReplaySubject<void>(1);
  public errMsg: string = '';
  public code: string = '';
  public fileSize: number = 0;
  public isImporting: boolean = false;
  public errorCode: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ImportActionComponent>,
    public projectsService: ProjectsService,
    private alert: AlertService
  ) { }


  public onAccept() {
    this.dialogRef.close(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || this.isImporting) return;
    this.isImporting = true;
    this.errMsg = '';
    this.errorCode = 0;
    readDataUrl(input.files[0]).pipe(
      switchMap(data => this.projectsService.import(data.split(',')[1])),
      takeUntil(this.destroy$),
      finalize(() => { this.isImporting = false; }),
    ).subscribe({
      next: () => {
        this.alert.openSuccessAlert('インポートに成功しました。');
        this.dialogRef.close(true);
      },
      error: error => {
        const detail = error?.error?.error;
        this.errMsg = typeof detail?.message === 'string' ? detail.message : 'ファイルを読み込めないか、通信に失敗しました。再度お試しください。';
        if (typeof detail?.code === 'number' && detail.code >= 701 && detail.code <= 799) this.errorCode = detail.code - 701;
        this.alert.openErrorAlert('インポートに失敗しました。CSVファイルの内容をご確認ください。');
      },
    });
  }
}
