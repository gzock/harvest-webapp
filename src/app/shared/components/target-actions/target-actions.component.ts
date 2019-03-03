import { Component, OnInit, Inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

import { PhotoCanvasComponent } from './../photo-canvas/photo-canvas.component';
import { Project } from './../../../private/dashboard/projects/project';
import { Place } from './../../../private/dashboard/work/place';
import { Target } from './../../../private/dashboard/work/target';
import { PlacesService } from './../../services/places/places.service';
import { TargetsService } from './../../services/targets/targets.service';
import { ProjectsService } from './../../services/projects/projects.service';
import { PhotosService } from './../../services/photos/photos.service';
import { AlertService } from './../../services/alert/alert.service';

@Component({
  selector: 'app-target-actions',
  templateUrl: './target-actions.component.html',
  styleUrls: ['./target-actions.component.scss']
})
export class TargetActionsComponent implements OnInit {

  private currentProject: Project;
  public selectedPlace: Place;
  public selectedTarget: Target;
  public selectedPhotoType: string = "before";
  public photoIndex: number = 0;
  public isTarget:boolean = false;
  public isPlace: boolean = false;

  //TODO: 要リファクタリング
  public selectedFile:any;
  public takenPhoto:any;
  public compressedPhoto:any;
  public neededPhoto :any;

  public new = {
    "name": "",
    "type": "place",
  }

  public photo = {
    "name": "",
    "type": "before",
  }

  constructor(
    private bottomSheetRef: MatBottomSheetRef<TargetActionsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    public placesService: PlacesService,
    public targetsService: TargetsService,
    public projectsService: ProjectsService,
    public photosService: PhotosService,
    private changeDetectorRef: ChangeDetectorRef,
    private alert: AlertService
  ) { }

  ngOnInit() {
    if("target_id" in this.data) {
      this.selectedTarget = this.data;
      this.isTarget = true;

    } else {
      this.selectedPlace = this.data;
      this.isPlace = true;
    }
  }

  public onCreate(type, name, placeId = "") {
    if(type === "place") {
      this.placesService.create(name, placeId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             console.log(response);
             this.bottomSheetRef.dismiss();
           },
           err => {
             console.log("error: " + err);
            this.openErrorAlert("場所の追加")
           }
        );

    } else if(type === "target") {
      this.targetsService.create(name, placeId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             console.log(response);
             this.bottomSheetRef.dismiss();
           },
           err => {
             console.log("error: " + err);
            this.openErrorAlert("撮影対象の追加")
           }
        );
    }
  }

  public onUpdateName(name) {
    let service: any;
    let id: string; 

    if(this.isPlace) {
      service = this.placesService;
      id = this.selectedPlace.place_id;

    } else if(this.isTarget) {
      service = this.targetsService;
      id = this.selectedTarget.target_id;
    }
    console.log(service);
    service.update_name(id, name)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           console.log(response);
           this.bottomSheetRef.dismiss();
         },
         err => {
           console.log("error: " + err);
           this.openErrorAlert("名前の変更")
         }
      );
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
    let fileReader = new FileReader();

    fileReader.onload = () => {
      this.takenPhoto = fileReader.result;
      this.changeDetectorRef.detectChanges();
    }

    fileReader.readAsDataURL(this.selectedFile);
  }

  onUpload() {
    console.log(this.compressedPhoto);
    let targetId = this.targetsService.getCurrentTarget().target_id;
    let data = this.compressedPhoto.split(",")[1];
    this.photosService.create(targetId, this.photo.type, data)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           this.bottomSheetRef.dismiss();
         },
         err => {
           console.log("error: " + err);
           this.openErrorAlert("写真のアップロード")
         }
      );
  }

  onCompressedPhoto(photo) {
    console.log("compressed: " + photo);
    this.compressedPhoto = photo;
  }

  onGetPhoto(type, index) {
    console.log(type);
    console.log(index);
    if(this.isTarget) {
      let targetId = this.selectedTarget["target_id"];
      if(index > this.selectedTarget["photos"][type].length - 1) {
        index = this.selectedTarget["photos"][type].length - 1;
        this.photoIndex = index;
      }
      let photoId = this.selectedTarget["photos"][type][index];
      this.photosService.show(targetId, photoId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             this.neededPhoto = "data:image/jpeg;base64," + response;
             console.log(this.neededPhoto);
           },
           err => {
             console.log("error: " + err);
             this.openErrorAlert("写真の取得")
           }
        )
    }
  }

  public onAdoptPhoto(type, index) {
    if(this.isTarget) {
      let targetId = this.selectedTarget["target_id"];
      let photoId = this.selectedTarget["photos"][type][index];
      this.photosService.adopt(targetId, type, photoId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             console.log(response);
           },
           err => {
             console.log("error: " + err);
             this.openErrorAlert("写真の採用")
           }
        )
    }
  }

  public onDeletePhoto(type, index) {
    if(this.isTarget) {
      let targetId = this.selectedTarget["target_id"];
      let photoId = this.selectedTarget["photos"][type][index];
      this.photosService.delete(targetId, photoId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             console.log(response);
           },
           err => {
             console.log("error: " + err);
           }
        )
    }
  }

  public onGetBackPhoto() {
    this.onGetPhoto(this.selectedPhotoType, this.photoIndex--);
  }

  public onGetNextPhoto() {
    this.onGetPhoto(this.selectedPhotoType, this.photoIndex++);
  }

  public isPhotoIndexMax() {
    return this.photoIndex == 5 || Object.keys(this.selectedTarget['photos'][this.selectedPhotoType]).length - 1 == this.photoIndex;
  }

  public isPhotoIndexMin() {
    return this.photoIndex == 0;
  }

  finish(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

}
