import { Component, OnInit, Inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatDialog, MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

import { PhotoCanvasComponent } from './../photo-canvas/photo-canvas.component';
import { ConfirmDeleteComponent } from './../confirm-delete/confirm-delete.component';
import { CautionComponent } from './../caution/caution.component';

import { Project } from './../../../private/dashboard/projects/project';
import { Place } from './../../../private/dashboard/work/place';
import { Target } from './../../../private/dashboard/work/target';
import { PlacesService } from './../../services/places/places.service';
import { TargetsService } from './../../services/targets/targets.service';
import { ProjectsService } from './../../services/projects/projects.service';
import { PhotosService } from './../../services/photos/photos.service';
import { AlertService } from './../../services/alert/alert.service';
import { Permissions } from './../../services/projects/action-permissions/permissions/permissions';

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
  public selectedName: string;
  public photoIndex: number = 0;
  public isTarget:boolean = false;
  public isPlace: boolean = false;
  public isRootPlace: boolean = false;
  public isUploading: boolean = false;
  public isLoading: boolean = false;
  public permissions: Permissions = {} as Permissions;

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
    private alert: AlertService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    if("target_id" in this.data.selected) {
      this.selectedTarget = this.data.selected;
      this.isTarget = true;
      this.selectedName = this.selectedTarget.name;

      //TODO: 要リファクタリング
      if(this.selectedTarget.photos.after.length > 0) {
        this.selectedTarget.photos.after.splice(
          this.selectedTarget.photos.after.indexOf(this.selectedTarget.photos.adopt.after), 1
        )
        this.selectedTarget.photos.after.unshift(this.selectedTarget.photos.adopt.after);
        this.selectedPhotoType = 'after';
      }

      if(this.selectedTarget.photos.before.length > 0) {
        this.selectedTarget.photos.before.splice(
          this.selectedTarget.photos.before.indexOf(this.selectedTarget.photos.adopt.before), 1
        )
        this.selectedTarget.photos.before.unshift(this.selectedTarget.photos.adopt.before);
        this.selectedPhotoType = 'before';
      }

    } else {
      this.selectedPlace = this.data.selected;
      this.new.type = this.data.defaultType;
      this.selectedName = this.selectedPlace.name;
      this.isPlace = true;
      if(this.selectedPlace.project_id === this.selectedPlace.place_id) {
        this.isRootPlace = true;
      }
    }
    this.permissions = this.projectsService.getCurrentPermissions();
    console.log(this.permissions);
  }

  public onCreate(type, name, placeId = "") {
    this.isLoading = true;
    if(type === "place") {
      this.placesService.create(name, placeId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             this.isLoading = false;
             this.openSuccessAlert("場所の追加");
             this.bottomSheetRef.dismiss(true);
           },
           err => {
             this.isLoading = false;
             console.log("error: " + err);
            this.openErrorAlert("場所の追加");
           }
        );

    } else if(type === "target") {
      this.targetsService.create(name, placeId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             this.isLoading = false;
             this.openSuccessAlert("撮影対象の追加");
             this.bottomSheetRef.dismiss(true);
           },
           err => {
             this.isLoading = false;
             console.log("error: " + err);
             this.openErrorAlert("撮影対象の追加");
           }
        );
    }
  }

  public onUpdateName(name) {
    this.isLoading = true;
    let service: any;
    let id: string; 

    if(this.isPlace) {
      service = this.placesService;
      id = this.selectedPlace.place_id;

    } else if(this.isTarget) {
      service = this.targetsService;
      id = this.selectedTarget.target_id;
    }
    service.update_name(id, name)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           this.isLoading = false;
           this.openSuccessAlert("名前の変更");
           this.bottomSheetRef.dismiss(true);
         },
         err => {
           this.isLoading = false;
           console.log("error: " + err);
           this.openErrorAlert("名前の変更");
         }
      );
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
    this.takenPhoto = this.selectedFile;
    this.changeDetectorRef.detectChanges();
  }

  onUpload() {
    //console.log(this.compressedPhoto);
    this.isUploading = true;
    let targetId = this.targetsService.getCurrentTarget().target_id;
    let data = this.compressedPhoto.split(",")[1];
    this.photosService.create(targetId, this.photo.type, data)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           this.isUploading = false;
           this.openSuccessAlert("写真のアップロード");
           this.bottomSheetRef.dismiss(true);
         },
         err => {
           this.isUploading = false;
           console.log("error: " + err);
           this.openErrorAlert("写真のアップロード");
         }
      );
  }

  onCompressedPhoto(photo) {
    //console.log("compressed: " + photo);
    this.compressedPhoto = photo;
  }

  onGetPhoto(type, index) {
    this.neededPhoto = null;
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
             this.neededPhoto = "data:image/jpeg;base64," + response.data;
             this.changeDetectorRef.detectChanges();
           },
           err => {
             console.log("error: " + err);
             this.openErrorAlert("写真の取得");
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
             this.openSuccessAlert("写真の採用");
             this.bottomSheetRef.dismiss(true);
           },
           err => {
             console.log("error: " + err);
             this.openErrorAlert("写真の採用");
           }
        )
    }
  }

  public onDelete() {
    this.isLoading = true;
    let service: any;
    let id: string; 

    if(this.isPlace) {
      service = this.placesService;
      id = this.selectedPlace.place_id;
      if(Number(this.selectedPlace.photos.required) > 0) {
         this.dialog.open(CautionComponent, { data: { message: "配下に何も存在しない状態でなければ削除できません" } });
         return;
      }
    } else if(this.isTarget) {
      service = this.targetsService;
      id = this.selectedTarget.target_id;
    }

    service.delete(id)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           this.isLoading = false;
           this.openSuccessAlert("削除");
           this.bottomSheetRef.dismiss(true);
         },
         err => {
           this.isLoading = false;
           console.log("error: " + err);
           this.openErrorAlert("削除");
         }
      );
  }

  public onDeletePhoto(type: string, index: number) {
    if(this.isTarget) {
      let targetId = this.selectedTarget["target_id"];
      let photoId = this.selectedTarget["photos"][type][index];

      this.photosService.delete(targetId, photoId)
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             this.openSuccessAlert("写真の削除");
             this.bottomSheetRef.dismiss(true);
           },
           err => {
             console.log("error: " + err);
             this.openErrorAlert("写真の削除");
           }
        )
    }
  }

  public onGetBackPhoto() {
    this.onGetPhoto(this.selectedPhotoType, --this.photoIndex);
  }

  public onGetNextPhoto() {
    this.onGetPhoto(this.selectedPhotoType, ++this.photoIndex);
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

  private openSuccessAlert(msg) {
    this.alert.openSuccessAlert(msg + "に成功しました。");
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

  public openConfirmDeleteDialog(type: string, index: number) {
    if(this.selectedTarget["photos"][type].length == 1) {
       this.dialog.open(CautionComponent, { data: { message: "1枚しかない写真を削除することはできません。" } });
       return;
    }
    if(this.selectedTarget["photos"][type][index] === this.selectedTarget["photos"]["adopt"][type] ) {
       this.dialog.open(CautionComponent, { data: { message: "採用されている写真を削除することはできません。" } });
       return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.onDeletePhoto(type, index);
      }
    });
  }

  public onValidatePhoto(event) {
    if(!event) {
      this.takenPhoto = '';
      this.alert.openErrorAlert("有効なJPEG画像ファイルを選択して下さい。");
    }
  }

}
