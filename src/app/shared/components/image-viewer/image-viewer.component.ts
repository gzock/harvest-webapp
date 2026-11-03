import { CommonModule } from '@angular/common';
import { Component,Inject,Injectable } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA,MatDialog,MatDialogModule } from '@angular/material/dialog';

export interface ViewerImage { src: string; caption?: string; }
@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>参考画像</h2>
    <mat-dialog-content><img [src]="data.images[index].src" [alt]="data.images[index].caption || 'テンプレート設定の説明'" style="max-width:100%;height:auto"></mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="index = index - 1" [disabled]="index === 0">前へ</button>
      <button mat-button (click)="index = index + 1" [disabled]="index >= data.images.length - 1">次へ</button>
      <button mat-button mat-dialog-close cdkFocusInitial>閉じる</button>
    </mat-dialog-actions>`,
})
export class ImageViewerComponent {
  index: number;
  constructor(@Inject(MAT_DIALOG_DATA) public data: { images: ViewerImage[]; index: number }) {
    this.index = data.index;
  }
}
@Injectable({ providedIn: 'root' })
export class ImageViewerService {
  constructor(private dialog: MatDialog) {}
  open(images: ViewerImage[], index = 0): void {
    if (!images.length) return;
    this.dialog.open(ImageViewerComponent, { data: { images, index: Math.max(0, Math.min(index, images.length - 1)) }, maxWidth: '95vw', width: '1000px' });
  }
}
