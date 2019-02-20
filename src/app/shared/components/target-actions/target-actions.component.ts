import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';

import { PhotoCanvasComponent } from './../photo-canvas/photo-canvas.component';
import { Project } from './../../../private/dashboard/projects/project';
import { Place } from './../../../private/dashboard/work/place';
import { Target } from './../../../private/dashboard/work/target';
import { PlacesService } from './../../services/places/places.service';
import { TargetsService } from './../../services/targets/targets.service';
import { ProjectsService } from './../../services/projects/projects.service';
import { PhotosService } from './../../services/photos/photos.service';

//export interface PlaceElement {
//  name: string;
//  action: number;
//  before: number;
//  after: number;
//}

@Component({
  selector: 'app-target-actions',
  templateUrl: './target-actions.component.html',
  styleUrls: ['./target-actions.component.scss']
})
export class TargetActionsComponent implements OnInit {

  private currentProject: Project;
  private currentPlace: Place;

  //TODO: 要リファクタリング
  public selectedFile:any;
  public takenPhoto:any;
  public compressedPhoto:any;

  public new = {
    "name": "",
    "type": "",
  }

  public photo = {
    "name": "",
    "type": "before",
  }

  constructor(
    private bottomSheetRef: MatBottomSheetRef<TargetActionsComponent>,
    public placesService: PlacesService,
    public targetsService: TargetsService,
    public projectsService: ProjectsService,
    public photosService: PhotosService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentPlace = this.placesService.getCurrentPlace();
    //if(this.currentPlace) {
    //  this. = this.projectsService.getCurrentProject();
    //  this.currentPlace = 
    //}
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
           }
        );
    }
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
    let fileReader = new FileReader();

    fileReader.onload = () => {
      this.takenPhoto = fileReader.result;
      this.changeDetectorRef.detectChanges();
    }

    fileReader.readAsDataURL(this.selectedFile);

    //let genDataUrl = Observable.create(observer => {
    //  fileReader.onloadend = () => {
    //    observer.next(fileReader.result);
    //    observer.complete();
    //  };
    //});

    //genDataUrl.subscribe((img) => {
    //  //this.takenPhoto = fileReader.result;
    //  this.takenPhoto = img;
    //  console.log(img);
    //  this.changeDetectorRef.detectChanges();
    //});

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
           console.log(response);
           //this.bottomSheetRef.dismiss();
         },
         err => {
           console.log("error: " + err);
         }
      );
  }

  onCompressedPhoto(photo) {
    console.log("compressed: " + photo);
    this.compressedPhoto = photo;
  }

  finish(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
