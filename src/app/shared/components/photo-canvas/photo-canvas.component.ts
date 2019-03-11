import { AfterViewInit, Component, Input, Output, EventEmitter, DoCheck, ViewChild } from '@angular/core';

@Component({
  selector: 'app-photo-canvas',
  templateUrl: './photo-canvas.component.html',
  styleUrls: ['./photo-canvas.component.scss']
})
export class PhotoCanvasComponent implements AfterViewInit, DoCheck {
  @Input() photoSrc: string;
  @Input() compressWidth: number;
  @Input() compressHeight: number;
  @Output() compressed = new EventEmitter();

  private image: any;
  private canvas: any;

  constructor() { }

  context: CanvasRenderingContext2D;

  @ViewChild('viewCanvas') viewCanvas;
  @ViewChild('photoView') photoView;

  ngAfterViewInit() {
    console.log("detected ngAfterViewInit()");
    this.canvas = this.viewCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');

    this.image = this.photoView.nativeElement;

    this.image.onload = () => {
      let ratio: float;
      
      const maxWidth = 1280;
      const maxHeight = 720;

      let width = this.image.naturalWidth;
      let height = this.image.naturalHeight;
      
      if(width >= height) {
        if(width > maxWidth) {
          ratio = width / maxWidth;
        }
      } else {
        if(height > maxHeight) {
          ratio = height / maxHeight;
        }
      }
      width = width * ratio;
      height = height * ratio;
      console.log(ratio);

      this.canvas.width = maxWidth;
      this.canvas.height = maxHeight;
      this.context.drawImage(this.image, 0, 0, this.image.naturalWidth, this.image.naturalHeight, 0, 0, maxWidth, maxHeight);

      // 本来は指定された解像度に圧縮してそれをエミット
      this.compressed.emit(this.canvas.toDataURL("image/jpeg",0.85));
      console.log(this.image.width);
      console.log(this.image.height);
      console.log(this.image.naturalWidth);
      console.log(this.image.naturalHeight);
    }
    this.image.src = this.photoSrc;
  }

}
