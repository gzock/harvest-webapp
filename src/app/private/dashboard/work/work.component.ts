import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, merge, throwError, Subject, BehaviorSubject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatTableDataSource } from '@angular/material';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { MatDialog } from '@angular/material';
import { Platform } from '@angular/cdk/platform';

import { TargetActionsComponent } from './../../../shared/components/target-actions/target-actions.component';
import { ImportActionComponent } from './../../../shared/components/import-action/import-action.component';

import { Project } from './../projects/project';
import { Place } from './place';
import { Target } from './target';
import { PlacesService } from './../../../shared/services/places/places.service';
import { TargetsService } from './../../../shared/services/targets/targets.service';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { PhotosService } from './../../../shared/services/photos/photos.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss']
})
export class WorkComponent implements OnInit, OnDestroy {

  public currentProject: Project;
  public currentProjectSubscription: Subscription;
  public places: Place[] = [];
  public targets: Target[] = [];
  public isMobile: boolean = false;

  public placeDataSource: MatTableDataSource<Place>;
  public targetDataSource:MatTableDataSource<Target>;

  constructor(
    private bottomSheet: MatBottomSheet,
    public placesService: PlacesService,
    public targetsService: TargetsService,
    public projectsService: ProjectsService,
    public photosService: PhotosService,
    private alert: AlertService,
    public dialog: MatDialog,
    private platform: Platform
  ) { }

  ngOnInit() {
    if(this.platform.ANDROID || this.platform.IOS) {
      this.isMobile = true;
    }
    this.currentProjectSubscription = this.projectsService.currentProjectSubject
      .subscribe(
        project => {
          if(project) {
            this.currentProject = project;
            this.placesService.setProjectId(this.currentProject.project_id);
            this.targetsService.setProjectId(this.currentProject.project_id);
            this.photosService.setProjectId(this.currentProject.project_id);

            let place = {
              project_id: this.currentProject.project_id,
              place_id: this.currentProject.project_id,
              name: this.currentProject.name,
              parent_place_id: this.currentProject.project_id,
              hierarchy: "",
              photos: {
                required: 0,
                results: {
                  before: 0,
                  after: 0
                }
              },
              created_at: "",
              updated_at: ""
            }
            this.placesService.select(place);
            this.placesService.placeHistory = [];
            this.placesService.placeHistory.push(place);
            this.getPlaces(this.currentProject.project_id);
            this.targetsService.setPlaceId(place.place_id);
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  ngOnDestroy() {
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
  }

  openBottomSheet(selected, defaultType = 'place'): void {
    this.targetsService.select(selected);
    const actionRef = this.bottomSheet.open(TargetActionsComponent, { data: { selected: selected , defaultType: defaultType } });
    actionRef.afterDismissed().subscribe(result => {
      //console.log("ActionModal result: " + JSON.stringify(result));
      this.getPlaces(this.placesService.getCurrentPlace().place_id);
    });
  }

  displayedPlaceColumns: string[] = ['name', 'photos.required', 'photos.results.before', 'photos.results.after'];
  displayedTargetColumns: string[] = ['name', 'before', 'after'];

  public getPlaces(placeId) {
    this.placesService.list(placeId)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           //console.log(response);
           this.places = response.places;
           this.placeDataSource = new MatTableDataSource(this.places);
           this.targets = response.targets;
           this.targetDataSource = new MatTableDataSource(this.targets);
           
           this.currentProject = this.projectsService.getCurrentProject();
           this.placesService.setProjectId(this.currentProject.project_id);
         },
         err => {
           console.log("error: " + err);
           this.openErrorAlert("場所の取得");
           //this.showAlert("Error: " + err.message, "danger", 10000);
           //if (err.status == 401) {
           //  localStorage.removeItem('isLoggedin');
           //  this.router.navigate(["/login"]);
           //}
           //else if (err.status == 400) {
           //  this.errMsg = "Error: " + err.error.message;
           //}
         }
      );
  }

  public forwardPlace(place) {
    this.placesService.select(place);
    this.placesService.placeHistory.push(place);
    this.getPlaces(place.place_id);
    this.targetsService.setPlaceId(place.place_id);
  }

  public backwardPlace() {
    this.placesService.placeHistory.pop();
    let place = this.placesService.placeHistory[this.placesService.placeHistory.length - 1]
    this.placesService.select(place);
    this.getPlaces(place.place_id);
    this.targetsService.setPlaceId(place.place_id);
  }

  public goHome() {
    this.placesService.placeHistory = [this.placesService.placeHistory[0]];
    let place = this.placesService.placeHistory[0];
    this.placesService.select(place);
    this.getPlaces(place.place_id);
    this.targetsService.setPlaceId(place.place_id);
  }
  public refresh() {
    this.getPlaces(this.placesService.getCurrentPlace().place_id);
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

  public floor(num: number) {
    return Math.floor(num);
  }

  openImportActionDialog() {
    const dialogRef = this.dialog.open(ImportActionComponent, { width: '600px' });

    dialogRef.afterClosed().subscribe(result => {
      //console.log("Dialog result: " + JSON.stringify(result));
      if(result) {
        //this.onCreateProject(result);
        console.log(result);
      }
    });
  }

}
