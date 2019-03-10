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

  private image = new Image();
  private canvas: any;
  //private compressRatio: float;

  constructor() { }

  context: CanvasRenderingContext2D;

  @ViewChild('viewCanvas') viewCanvas;

  ngAfterViewInit() {
    console.log("detected ngAfterViewInit()");
    this.canvas = this.viewCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');

    //this.compressCanvas = this.compressCanvas.nativeElement;
    //this.compressCtx = this.compressCanvas.getContext('2d');

    // 元画像の横と縦でどちらが大きいか？
    // 圧縮予定の横と縦でどちらが大きいか？
    // 大きいほ
    //if(this.compressWidth > this.compressHeight) {
    //  this.compressRatio = this.compressWidth / this.compressHeight;
    //} else {
    //  this.compressRatio = this.compressHeight / this.compresswidth;
    //}

    this.image.onload = () => {
      let w = this.viewCanvas.nativeElement.offsetWidth;
      let ratio = w / this.image.width;
      let h = this.image.height * ratio;

      const height = this.viewCanvas.nativeElement.offsetHeight;
      const width = this.viewCanvas.nativeElement.offsetWidth;
      console.log(width);
      console.log(height);
      console.log(ratio);

      this.canvas.width = w;
      this.canvas.height = h;
      this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, w, h);
      //this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, 1280, 720);

      // 本来は指定された解像度に圧縮してそれをエミット
      this.compressed.emit(this.canvas.toDataURL("image/jpeg",0.85));
      console.log(w);
      console.log(h);
    }
    this.image.src = this.photoSrc;
  }

  ngDoCheck() {
    console.log("detected ngDoCheck");
    this.image.src = this.photoSrc;
    this.image.onload = () => {
      let w = this.viewCanvas.nativeElement.offsetWidth;
      let ratio = w / this.image.width;
      let h = this.image.height * ratio;

      this.canvas.width = w;
      this.canvas.height = h;
      this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, w, h);
      console.log(this.image.width);
      console.log(this.image.height);
      //this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, 1280, 720);

      // 本来は指定された解像度に圧縮してそれをエミット
      this.compressed.emit(this.canvas.toDataURL("image/jpeg",0.85));
    }
  }
}
