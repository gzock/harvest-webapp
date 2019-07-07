import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatVerticalStepper } from '@angular/material';

import { Project } from './../projects/project';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { GenerateService } from './../../../shared/services/generate/generate.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

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
    "needs_include_hierarchy": false,
    "needs_make_dir": true,
    "needs_all_photos": false,
    "force_download": false,
    "char_enc": "shift_jis"
  };

  public templates: Template[];

  @ViewChild(MatVerticalStepper, { static: false }) stepper: MatVerticalStepper;

  constructor(
    public projectsService: ProjectsService,
    public generateService: GenerateService,
    private alert: AlertService,
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
    this.templates = [{"name": "basic_1.xlsx"}, {"name": "basic_2.xlsx"}];
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
           this.alert.openErrorAlert("生成失敗。原因不明のエラーが発生しました。");
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
