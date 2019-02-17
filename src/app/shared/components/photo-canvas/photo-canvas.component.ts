import { AfterViewInit, Component, Input, DoCheck, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-photo-canvas',
  templateUrl: './photo-canvas.component.html',
  styleUrls: ['./photo-canvas.component.scss']
})
export class PhotoCanvasComponent implements AfterViewInit, DoCheck {
  @Input() photoSrc: string;
  public image = new Image();
  public canvas: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  context: CanvasRenderingContext2D;

  @ViewChild('myCanvas') myCanvas;

  ngAfterViewInit() {
    this.canvas= this.myCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');

    this.image.onload = () => {
      let w = this.myCanvas.nativeElement.offsetWidth;
      let ratio = w / this.image.width;
      let h = this.image.height * ratio;
      //h = this.myCanvas.nativeElement.offsetHeight * ratio;

      const height = this.myCanvas.nativeElement.offsetHeight;
      const width = this.myCanvas.nativeElement.offsetWidth;
      console.log(width);
      console.log(height);
      console.log(ratio);

      this.canvas.width = w;
      this.canvas.height = h;
      this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, w, h);
      console.log(w);
      console.log(h);
      //this.context = this.rectColor;
      this.changeDetectorRef.detectChanges();
    }
    this.image.src = this.photoSrc;
  }

  ngDoCheck() {
    this.image.onload = () => {
      let w = this.myCanvas.nativeElement.offsetWidth;
      let ratio = w / this.image.width;
      let h = this.image.height * ratio;
      //h = this.myCanvas.nativeElement.offsetHeight;

      this.canvas.width = w;
      this.canvas.height = h;
      this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, w, h);
      //this.context = this.rectColor;
      this.changeDetectorRef.detectChanges();
    }
  }
}
