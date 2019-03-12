import { AfterViewInit, Component, Input, Output, EventEmitter, DoCheck, ViewChild } from '@angular/core';

@Component({
  selector: 'app-photo-canvas',
  templateUrl: './photo-canvas.component.html',
  styleUrls: ['./photo-canvas.component.scss']
})
export class PhotoCanvasComponent implements AfterViewInit {
  @Input() photoSrc: string;
  @Input() compressWidth: number;
  @Input() compressHeight: number;
  @Output() compressed = new EventEmitter();

  private image: any;
  private canvas: any;
  private ratio: number = 1.0;
  private maxWidth:number = 1280;
  private maxHeight:number = 720;


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
      let width = this.image.naturalWidth;
      let height = this.image.naturalHeight;
      
      if(width >= height) {
        if(width > this.maxWidth) {
          this.ratio = width / this.maxWidth;
        }
      } else {
        if(height > this.maxHeight) {
          this.ratio = height / this.maxHeight;
        }
      }
      width = width * this.ratio;
      height = height * this.ratio;
      console.log(this.ratio);

      this.canvas.width = width;
      this.canvas.height = height;
      this.context.drawImage(
          this.image, 
          0, 0, this.image.naturalWidth, this.image.naturalHeight, 
          0, 0, width, height
      );

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
