import { ChangeDetectionStrategy,ChangeDetectorRef,Component,EventEmitter,Input,OnChanges,OnDestroy,Output } from '@angular/core';
import loadImage from 'blueimp-load-image';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-photo-canvas',
  templateUrl: './photo-canvas.component.html',
  styleUrls: ['./photo-canvas.component.scss']
})
export class PhotoCanvasComponent implements OnChanges, OnDestroy {
  @Input() photoSrc: Blob | string = '';
  @Input() output = false;
  @Output() compressed = new EventEmitter<string>();
  @Output() validatePhoto = new EventEmitter<boolean>();
  image = '';
  private generation = 0;
  constructor(private changeDetectorRef: ChangeDetectorRef) {}
  ngOnChanges(): void { void this.render(); }
  ngOnDestroy(): void { this.generation++; }
  private async render(): Promise<void> {
    const generation = ++this.generation;
    this.image = '';
    if (!this.photoSrc) return;
    if (!this.output) { this.image = String(this.photoSrc); return; }
    try {
      const file = this.photoSrc;
      if (!(file instanceof Blob) || file.size > 25 * 1024 * 1024) throw new Error('Invalid image');
      const header = new Uint8Array(await file.slice(0, 3).arrayBuffer());
      if (header[0] !== 0xff || header[1] !== 0xd8 || header[2] !== 0xff) throw new Error('Not JPEG');
      const image = await this.getDataUrl(file);
      if (generation !== this.generation) return;
      this.image = image;
      this.validatePhoto.emit(true);
      this.compressed.emit(image);
      this.changeDetectorRef.markForCheck();
    } catch {
      if (generation !== this.generation) return;
      this.validatePhoto.emit(false);
      this.changeDetectorRef.markForCheck();
    }
  }
  async getDataUrl(blobImage: Blob): Promise<string> {
    const result = await loadImage(blobImage, { canvas: true, orientation: true, maxWidth: 1280, maxHeight: 1280 });
    if (!(result.image instanceof HTMLCanvasElement)) throw new Error('Image decode failed');
    return result.image.toDataURL('image/jpeg', 0.85);
  }
}
