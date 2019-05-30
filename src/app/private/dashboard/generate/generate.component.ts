import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatVerticalStepper } from '@angular/material';

import { Project } from './../projects/project';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { GenerateService } from './../../../shared/services/generate/generate.service';

import { Order } from './order';
import { Template } from './template';
import { Generated } from './generated';
import { Permissions } from './../../../shared/services/projects/action-permissions/permissions/permissions';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit, OnDestroy {
  public currentProject: Project;
  private currentProjectSubscription: Subscription;
  public downloadUrl: string;
  public isProgress: boolean = false;

  public isLinear = false;
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public generateType: string;
  public checked: any;
  public permissions: Permissions = {} as Permissions;

  public order: Order = {
    "type": "",
    "template": "basic_1.xlsx",
    "by_name": true,
    "has_hierarchy": false,
    "force_download": false
  };

  public templates: Template[];

  @ViewChild(MatVerticalStepper) stepper: MatVerticalStepper;

  constructor(
    public projectsService: ProjectsService,
    public generateService: GenerateService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.currentProjectSubscription = this.projectsService.currentProjectSubject
      .subscribe(
        project => {
          if(project) {
            this.currentProject = project;
            this.permissions = this.projectsService.getCurrentPermissions();
          }
        },
        error => {
          console.log(error);
        }
      );

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

    // temp
    this.templates = [{"name": "basic_1.xlsx"}];
  }

  ngOnDestroy() {
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
  }

  public onGenerate(order: Order) {
    let projectId = this.currentProject.project_id;
    this.isProgress = true;

    this.generateService.generate(projectId, order)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         (response: Generated) => {
           this.isProgress = false;
           this.downloadUrl = response.download_url;
         },
         err => {
           this.isProgress = false;
           console.log("error: " + err);
         }
      );
  }

  public onSetGenerateType(type: string) {
    this.order.type = type;
    this.onNext();
  }

  public onNext() {
    this.stepper.selected.completed = true;
    //this.stepper.selected.editable = false;
    this.stepper.next();
  }

  public onPrevious() {
    this.stepper.previous();
  }

  public onReset() {
    this.downloadUrl = "";
    this.stepper.reset();
  }
}
