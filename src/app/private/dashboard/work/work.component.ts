import { Component, OnInit } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatTableDataSource } from '@angular/material';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';

import { TargetActionsComponent } from './../../../shared/components/target-actions/target-actions.component';

import { Project } from './../projects/project';
import { Place } from './place';
import { Target } from './target';
import { PlacesService } from './../../../shared/services/places/places.service';
import { TargetsService } from './../../../shared/services/targets/targets.service';
import { ProjectsService } from './../../../shared/services/projects/projects.service';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss']
})
export class WorkComponent implements OnInit {

  public currentProject: Project;
  public currentPlace: Place;
  public places: Place[];
  public targets: Target[];

  public placeDataSource: MatTableDataSource<Place>;
  public targetDataSource:MatTableDataSource<Target>;

  constructor(
    private bottomSheet: MatBottomSheet,
    public placesService: PlacesService,
    public targetsService: TargetsService,
    public projectsService: ProjectsService
  ) { }

  ngOnInit() {
    this.currentProject = this.projectsService.getCurrentProject();
    if(this.currentProject) {
      this.placesService.setProjectId(this.currentProject.project_id);
      this.targetsService.setProjectId(this.currentProject.project_id);

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
      this.placesService.placeHistory.push(place);
      this.getPlaces(this.currentProject.project_id);
      this.targetsService.setPlaceId(place.place_id);
    }
  }

  openBottomSheet(): void {
    const actionRef = this.bottomSheet.open(TargetActionsComponent);
    actionRef.afterDismissed().subscribe(result => {
      console.log("ActionModal result: " + JSON.stringify(result));
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
           console.log(response);
           this.places = response.places;
           this.placeDataSource = new MatTableDataSource(this.places);
           this.targets = response.targets;
           this.targetDataSource = new MatTableDataSource(this.targets);
           
           this.currentProject = this.projectsService.getCurrentProject();
           this.placesService.setProjectId(this.currentProject.project_id);
         },
         err => {
           console.log("error: " + err);
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
}
