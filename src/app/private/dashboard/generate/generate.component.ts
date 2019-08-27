import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, merge, throwError, timer, Subject, Subscription, TimeoutError } from "rxjs";
import { timeout, filter, map, concatMap, tap, catchError } from "rxjs/operators";

import { MatVerticalStepper } from '@angular/material';
import { MatDialog } from '@angular/material';

import { Project } from './../projects/project';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { GenerateService } from './../../../shared/services/generate/generate.service';
import { TemplateService } from './../../../shared/services/template/template.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

import { Order } from './order';
import { Template } from './template';
import { TemplateConfig } from './template-config';
import { Generated } from './generated';
import { Permissions } from './../../../shared/services/projects/action-permissions/permissions/permissions';
import { CautionComponent } from './../../../shared/components/caution/caution.component';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit, OnDestroy {
  public currentProject: Project;
  private subscriptions: Subscription[] = [];
  public downloadUrl: string;
  public isProgress: boolean = false;

  public isLinear = false;
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public generateType: string;
  public checked: any;
  public permissions: Permissions = {} as Permissions;
  public defaultTemplates: TemplateConfig;
  public userTemplates: TemplateConfig;
  public projectTemplates: TemplateConfig;
  public isUploading: boolean = false;
  public generatedFiles: any = [];

  public order: Order = {
    "title": "",
    "type": "",
    "template": "basic_1.xlsx",
    "by_name": true,
    "needs_include_hierarchy": false,
    "needs_make_dir": true,
    "needs_all_photos": false,
    "needs_date": false,
    "force_download": false,
    "char_enc": "shift_jis"
  };

  public templates: Template[];

  @ViewChild(MatVerticalStepper, { static: false }) stepper: MatVerticalStepper;

  constructor(
    public projectsService: ProjectsService,
    public generateService: GenerateService,
    public templateService: TemplateService,
    private alert: AlertService,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.projectsService.currentProjectSubject
      .subscribe(
        project => {
          if(project) {
            this.currentProject = project;
            this.permissions = this.projectsService.getCurrentPermissions();
            this.order.title = project.name;
          }
        },
        error => {
          console.log(error);
        }
      )
    )

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

    // temp
    this.templates = [{"name": "basic_1.xlsx"}, {"name": "basic_2.xlsx"}, {"name": "basic_3.xlsx"}];
    this.onListTemplates();
    this.onListGeneratedFiles();
  }

  ngOnDestroy() {
    for(const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  public onGenerate(order: Order) {
    let projectId = this.currentProject.project_id;
    this.isProgress = true;

    this.generateService.generate(projectId, order)
      .pipe(
        timeout(20000),
         catchError(error => throwError(error))
      )
      .subscribe(
         (response: Generated) => {
           this.isProgress = false;
           this.downloadUrl = response.download_url;
         },
         err => {
           if(err instanceof TimeoutError) {
             this.onProcessingTooLongCaution();
           } else {
             this.alert.openErrorAlert("生成失敗。原因不明のエラーが発生しました。");
           }
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
    this.order.needs_include_hierarchy = false;
    this.order.needs_make_dir = true;
    this.order.needs_all_photos = false;
    this.order.needs_date = false;
    this.stepper.reset();
  }

  public onListTemplates() {
    const projectId = this.currentProject.project_id;
    this.templateService.list(projectId)
      .subscribe(
        templates => {
          console.log(templates);
          //this.defaultTemplates = templates.default;
          //this.userTemplates = templates.user;
          //this.projectTemplates = templates.project;
        },
        err => {
           console.log("error: " + err);
           this.alert.openErrorAlert("テンプレート一覧の取得に失敗しました。");
        }
      );
  }

  private onInputExcelTemplate(file): Observable<any> {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    return Observable.create(observer => {
      reader.onload = data => {
        observer.next(reader.result.toString());
      }
      reader.onerror = error => observer.error(error);
    });
  }

  public onFileSelected(event) {
    if(event.target.files) {
      this.onInputExcelTemplate(event.target.files[0])
        .subscribe(
          data => {
            this.isUploading = true;
            this.onUpload( data.split(",")[1] );
          }
        );
    }
  }

  private onUpload(file) {
    let projectId = this.currentProject.project_id;
    this.templateService.create(projectId, file)
      .subscribe(
         response => {
            this.isUploading = false;
            this.alert.openSuccessAlert("インポートに成功しました。");
         },
         err => {
            this.isUploading = false;
            console.log("error: " + err);
            //if(err.error.error) {
            //  this.errMsg = "エラー: " + err.error.error.message;
            //  if(700 <= err.error.error.code && err.error.error.code <= 799) {
            //    this.errorCode = err.error.error.code - 701;
            //  }
            //} else {
            //  this.errMsg = "エラー: タイムアウト";
            //}
            this.alert.openErrorAlert("アップロードに失敗しました。");
         }
      )
  }

  public onListGeneratedFiles() {
    this.isProgress = true;
    let projectId = this.currentProject.project_id;
    this.subscriptions.push(timer(3000, 30000)
      .subscribe(
          () => {
            this.generateService.list(projectId)
              .subscribe(
                 res => {
                   this.generatedFiles = res;
                   this.isProgress = false;
                 },
                 err => {
                   this.isProgress = false;
                   console.log("error: " + err);
                   this.alert.openErrorAlert("生成失敗。原因不明のエラーが発生しました。");
                 }
              )
          }
      )
    );
  }

  public onDownload(filename) {
    this.isProgress = true;
    let projectId = this.currentProject.project_id;
    this.generateService.generateDownloadUrl(projectId, filename)
      .subscribe(
         (res: Generated) => {
           if(res.download_url) {
             let a = document.createElement('a');
             document.body.appendChild(a);
             a.setAttribute('style', 'display: none');
             a.href = res.download_url;
             a.setAttribute('download', '');
             a.click();
           }
          this.isProgress = false;
         },
         err => {
          this.isProgress = false;
          console.log("error: " + err);
          this.alert.openErrorAlert("生成失敗。原因不明のエラーが発生しました。");
         }
      );
  }

  private onProcessingTooLongCaution() {
    this.dialog.open(
      CautionComponent, 
      { data: { message: "現在、生成処理を実行していますが、時間がかかっています。数分後、履歴からダウンロードしてください。" } }
    );
  }

  public formatDate(date: string) {
    if(date) {
      let _date: Date = new Date(date);
      _date.setTime(_date.getTime() + 1000 * 60 * 60 * 9);
      return _date.getFullYear() + "/" + (_date.getMonth() + 1) + "/" + _date.getDate() + " " + _date.getHours() + ":" + _date.getMinutes();
    }
  }
}
