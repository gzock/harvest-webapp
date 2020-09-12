import { AfterViewInit, Component, Input, Output, EventEmitter, DoCheck, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import * as loadImage from 'blueimp-load-image';

@Component({
  selector: 'app-photo-canvas',
  templateUrl: './photo-canvas.component.html',
  styleUrls: ['./photo-canvas.component.scss']
})
export class PhotoCanvasComponent implements AfterViewInit {
  @Input() photoSrc: any;
  @Input() output: boolean = false;
  @Output() compressed = new EventEmitter();
  @Output() validatePhoto = new EventEmitter();

  public image: string;
  private maxWidth:number = 1280;
  private maxHeight:number = 720;

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    this.image = "";

    if(this.output) {
      loadImage.parseMetaData(this.photoSrc, (data) => {
        if (!data.imageHead) {
          this.validatePhoto.emit(false);
        } else {
          this.validatePhoto.emit(true);
          const options = {
            orientation: null,
            canvas: true,
            maxHeight: 1280,
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
        }
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
