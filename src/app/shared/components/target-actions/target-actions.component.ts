import { ChangeDetectionStrategy,ChangeDetectorRef,Component,Inject,OnDestroy,OnInit } from '@angular/core';
import { Observable,ReplaySubject,Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { GuestPermissions } from '../../services/projects/action-permissions/permissions/guest-permissions';

import { MAT_BOTTOM_SHEET_DATA,MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';

import { CautionComponent } from './../caution/caution.component';
import { ConfirmDeleteComponent } from './../confirm-delete/confirm-delete.component';

import { Place } from './../../../private/dashboard/work/place';
import { Target } from './../../../private/dashboard/work/target';
import { AlertService } from './../../services/alert/alert.service';
import { PhotosService } from './../../services/photos/photos.service';
import { PlacesService } from './../../services/places/places.service';
import { Permissions } from './../../services/projects/action-permissions/permissions/permissions';
import { ProjectsService } from './../../services/projects/projects.service';
import { TargetsService } from './../../services/targets/targets.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-target-actions',
  templateUrl: './target-actions.component.html',
  styleUrls: ['./target-actions.component.scss']
})
export class TargetActionsComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new ReplaySubject<void>(1);
  private photoRequest?: Subscription;
  private uploadOperation?: { photo: string; type: 'before' | 'after'; request: Observable<unknown> };
  public selectedPlace!: Place;
  public selectedTarget!: Target;
  public selectedPhotoType: 'before' | 'after' = "before";
  public selectedName: string = '';
  public photoIndex: number = 0;
  public isTarget:boolean = false;
  public isPlace: boolean = false;
  public isRootPlace: boolean = false;
  public isUploading: boolean = false;
  public isLoading: boolean = false;
  public permissions: Permissions = new GuestPermissions();

  //TODO: 要リファクタリング
  public selectedFile:any;
  public takenPhoto:any;
  public compressedPhoto:any;
  public neededPhoto :any;

  public new = {
    "name": "",
    "type": "place",
  }

  public photo: { name: string; type: 'before' | 'after' } = {
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
      this.selectedTarget = {
        ...this.data.selected,
        photos: { ...this.data.selected.photos,
          before: [...this.data.selected.photos.before], after: [...this.data.selected.photos.after] },
      };
      this.isTarget = true;
      this.selectedName = this.selectedTarget.name;

      for (const type of ['after', 'before'] as const) {
        const photos = this.selectedTarget.photos[type];
        if (photos.length) {
          const adoptedIndex = photos.indexOf(this.selectedTarget.photos.adopt[type]);
          if (adoptedIndex >= 0) photos.unshift(...photos.splice(adoptedIndex, 1));
          this.selectedPhotoType = type;
        }
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
    this.projectsService.currentProjectSubject.pipe(takeUntil(this.destroy$)).subscribe(project => {
      if (!project || project.project_id !== this.data.selected.project_id) {
        this.ngOnDestroy();
        this.bottomSheetRef.dismiss();
      } else {
        this.permissions = this.projectsService.getCurrentPermissions();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.photoRequest?.unsubscribe();
  }

  public onCreate(type: string, name: string, placeId: string = "") {
    this.isLoading = true;
    if(type === "place") {
      this.placesService.create(name, placeId)
        .pipe(
           takeUntil(this.destroy$)
        )
        .subscribe(
           _response => {
             this.isLoading = false;
             this.openSuccessAlert("場所の追加");
             this.bottomSheetRef.dismiss(true);
           },
           _err => {
             this.isLoading = false;

            this.openErrorAlert("場所の追加");
           }
        );

    } else if(type === "target") {
      this.targetsService.create(name, placeId)
        .pipe(
           takeUntil(this.destroy$)
        )
        .subscribe(
           _response => {
             this.isLoading = false;
             this.openSuccessAlert("撮影対象の追加");
             this.bottomSheetRef.dismiss(true);
           },
           _err => {
             this.isLoading = false;

             this.openErrorAlert("撮影対象の追加");
           }
        );
    }
  }

  public onUpdateName(name: string) {
    this.isLoading = true;
    let service: PlacesService | TargetsService;
    let id: string; 

    if(this.isPlace) {
      service = this.placesService;
      id = this.selectedPlace.place_id;

    } else if(this.isTarget) {
      service = this.targetsService;
      id = this.selectedTarget.target_id;
    }
    if (!this.isPlace && !this.isTarget) return;
    service!.update_name(id!, name)
      .pipe(
         takeUntil(this.destroy$)
      )
      .subscribe(
         _response => {
           this.isLoading = false;
           this.openSuccessAlert("名前の変更");
           this.bottomSheetRef.dismiss(true);
         },
         _err => {
           this.isLoading = false;

           this.openErrorAlert("名前の変更");
         }
      );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadOperation = undefined;
    this.compressedPhoto = null;
    this.selectedFile = input.files[0];
    this.takenPhoto = this.selectedFile;
    input.value = '';
    this.changeDetectorRef.detectChanges();
  }

  onUpload() {
    if (!this.compressedPhoto || this.isUploading) return;
    this.isUploading = true;
    const targetId = this.selectedTarget.target_id;
    const data = this.compressedPhoto.split(",")[1];
    if (!this.uploadOperation || this.uploadOperation.photo !== data || this.uploadOperation.type !== this.photo.type) {
      this.uploadOperation = { photo: data, type: this.photo.type, request: this.photosService.create(targetId, this.photo.type, data) };
    }
    this.uploadOperation.request
      .pipe(
         takeUntil(this.destroy$)
      )
      .subscribe(
         _response => {
           this.isUploading = false;
           this.openSuccessAlert("写真のアップロード");
           this.bottomSheetRef.dismiss(true);
         },
         _err => {
           this.isUploading = false;

           this.openErrorAlert("写真のアップロード");
         }
      );
  }

  onCompressedPhoto(photo: string) {
    this.compressedPhoto = photo;
  }

  onGetPhoto(type: 'before' | 'after', index: number) {
    this.photoRequest?.unsubscribe();
    this.neededPhoto = null;
    if (!this.isTarget || !this.selectedTarget.photos[type].length) return;
    this.photoIndex = Math.max(0, Math.min(index, this.selectedTarget.photos[type].length - 1));
    const photoId = this.selectedTarget.photos[type][this.photoIndex];
    this.photoRequest = this.photosService.show(this.selectedTarget.target_id, photoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.neededPhoto = 'data:image/jpeg;base64,' + response.data;
          this.changeDetectorRef.detectChanges();
        },
        error: () => this.openErrorAlert('写真の取得'),
      });
  }

  public onAdoptPhoto(type: 'before' | 'after', index: number) {
    if(this.isTarget) {
      const targetId = this.selectedTarget["target_id"];
      const photoId = this.selectedTarget["photos"][type][index];
      this.photosService.adopt(targetId, type, photoId)
        .pipe(
           takeUntil(this.destroy$)
        )
        .subscribe(
           _response => {
             this.openSuccessAlert("写真の採用");
             this.bottomSheetRef.dismiss(true);
           },
           _err => {

             this.openErrorAlert("写真の採用");
           }
        )
    }
  }

  public onDelete() {
    this.isLoading = true;
    let service: PlacesService | TargetsService;
    let id: string; 

    if(this.isPlace) {
      service = this.placesService;
      id = this.selectedPlace.place_id;
      if(Number(this.selectedPlace.photos.required) > 0) {
         this.dialog.open(CautionComponent, { data: { message: "配下に何も存在しない状態でなければ削除できません" } });
         this.isLoading = false;
         return;
      }
    } else if(this.isTarget) {
      service = this.targetsService;
      id = this.selectedTarget.target_id;
    }

    if (!this.isPlace && !this.isTarget) return;
    service!.delete(id!)
      .pipe(
         takeUntil(this.destroy$)
      )
      .subscribe(
         _response => {
           this.isLoading = false;
           this.openSuccessAlert("削除");
           this.bottomSheetRef.dismiss(true);
         },
         _err => {
           this.isLoading = false;

           this.openErrorAlert("削除");
         }
      );
  }

  public onDeletePhoto(type: 'before' | 'after', index: number) {
    if(this.isTarget) {
      const targetId = this.selectedTarget["target_id"];
      const photoId = this.selectedTarget["photos"][type][index];

      this.photosService.delete(targetId, photoId)
        .pipe(
           takeUntil(this.destroy$)
        )
        .subscribe(
           _response => {
             this.openSuccessAlert("写真の削除");
             this.bottomSheetRef.dismiss(true);
           },
           _err => {

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
    return this.photoIndex >= 4 || Object.keys(this.selectedTarget['photos'][this.selectedPhotoType]).length - 1 === this.photoIndex;
  }

  public isPhotoIndexMin() {
    return this.photoIndex === 0;
  }

  finish(event: MouseEvent): void {
    this.ngOnDestroy();
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  private openSuccessAlert(msg: string) {
    this.alert.openSuccessAlert(msg + "に成功しました。");
  }

  private openErrorAlert(msg: string) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

  public openConfirmDeleteDialog(type: 'before' | 'after', index: number) {
    if(this.selectedTarget["photos"][type].length === 1) {
       this.dialog.open(CautionComponent, { data: { message: "1枚しかない写真を削除することはできません。" } });
       return;
    }
    if(this.selectedTarget["photos"][type][index] === this.selectedTarget["photos"]["adopt"][type] ) {
       this.dialog.open(CautionComponent, { data: { message: "採用されている写真を削除することはできません。" } });
       return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteComponent);

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if(result) {
        this.onDeletePhoto(type, index);
      }
    });
  }

  public onValidatePhoto(event: boolean) {
    if(!event) {
      this.takenPhoto = '';
      this.alert.openErrorAlert("有効なJPEG画像ファイルを選択して下さい。");
    }
  }

}
