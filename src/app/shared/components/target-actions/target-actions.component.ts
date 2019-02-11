import { Component, OnInit } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';

import { Project } from './../../../private/dashboard/projects/project';
import { Place } from './../../../private/dashboard/work/place';
import { Target } from './../../../private/dashboard/work/target';
import { PlacesService } from './../../services/places/places.service';
import { TargetsService } from './../../services/targets/targets.service';
import { ProjectsService } from './../../services/projects/projects.service';

export interface PlaceElement {
  name: string;
  action: number;
  before: number;
  after: number;
}

@Component({
  selector: 'app-target-actions',
  templateUrl: './target-actions.component.html',
  styleUrls: ['./target-actions.component.scss']
})
export class TargetActionsComponent implements OnInit {

  private currentProject: Project;
  private currentPlace: Place;

  public new = {
    "name": "",
    "type": "",
  }

  constructor(
    private bottomSheetRef: MatBottomSheetRef<TargetActionsComponent>,
    public placesService: PlacesService,
    public targetsService: TargetsService,
    public projectsService: ProjectsService
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

  finish(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
