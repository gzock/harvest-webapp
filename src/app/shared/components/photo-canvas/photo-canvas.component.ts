import { AfterViewInit, Component, Input, Output, EventEmitter, DoCheck, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import * as loadImage from 'blueimp-load-image';

@Component({
  selector: 'app-photo-canvas',
  templateUrl: './photo-canvas.component.html',
  styleUrls: ['./photo-canvas.component.scss']
})
export class PhotoCanvasComponent implements AfterViewInit {
  @Input() photoSrc: Blob;
  @Input() output: boolen = false;
  //@Input() compressWidth: number;
  //@Input() compressHeight: number;
  @Output() compressed = new EventEmitter();

  private image: string;
  //private canvas: any;
  //private ratio: number = 1.0;
  private maxWidth:number = 1280;
  private maxHeight:number = 720;

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  //context: CanvasRenderingContext2D;

  //@ViewChild('viewCanvas') viewCanvas;
  //@ViewChild('photoView') photoView;

  ngAfterViewInit() {
    this.image = "";
    console.log("detected ngAfterViewInit()");
    //console.log(this.photoSrc);
    //this.canvas = this.viewCanvas.nativeElement;
    //this.context = this.canvas.getContext('2d');

    //this.image = this.photoView.nativeElement;

    if(this.output) {
      loadImage.parseMetaData(this.photoSrc, (data) => {
        const options = {
          orientation: null,
          canvas: true,
          maxWidth: 1280
        };
        if (data.exif) {
          options.orientation = data.exif.get('Orientation');
        }
        this.getDataUrl(this.photoSrc, options)
        .then(result => {
          this.image = result;
          this.compressed.emit(result);
        });
      });
    } else {
      this.image = this.photoSrc;
    }
    this.changeDetectorRef.detectChanges();
  }

  getDataUrl(blobImage: Blob, options: Object): Promise<any> {
    return new Promise((resolve) => {
      loadImage(blobImage, (canvas) => {
        resolve(canvas.toDataURL("image/jpeg",0.85));
      }, options);
    });
  }

}
