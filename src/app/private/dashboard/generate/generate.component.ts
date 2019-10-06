import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, merge, throwError, timer, Subject, Subscription, TimeoutError } from "rxjs";
import { timeout, filter, map, concatMap, tap, catchError } from "rxjs/operators";

import { MatVerticalStepper } from '@angular/material';
import { MatDialog } from '@angular/material';
import { Lightbox } from 'ngx-lightbox';

import { Project } from './../projects/project';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { GenerateService } from './../../../shared/services/generate/generate.service';
import { TemplateService } from './../../../shared/services/template/template.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

import { Order } from './order';
import { Template } from './template';
import { TemplateConfig } from './template-config';
import { AvailableTemplates } from './available-templates';
import { Generated } from './generated';
import { Permissions } from './../../../shared/services/projects/action-permissions/permissions/permissions';
import { CautionComponent } from './../../../shared/components/caution/caution.component';
import { UploadTemplateComponent } from './../../../shared/components/upload-template/upload-template.component';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit, OnDestroy {
  public currentProject: Project;
  private subscriptions: Subscription[] = [];
  public generatedFile: Generated;
  public isProgress: boolean = false;
  public isLoading: boolean = false;

  public isLinear = false;
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public generateType: string;
  public checked: any;
  public permissions: Permissions = {} as Permissions;
  public defaultTemplates: TemplateConfig[] = [] as TemplateConfig[];
  public userTemplates: TemplateConfig[] = [] as TemplateConfig[];
  public projectTemplates: TemplateConfig[] = [] as TemplateConfig[];
  public isUploading: boolean = false;
  public generatedFiles: any = [];

  public order: Order = {
    "title": "",
    "type": "",
    "template_id": "basic_1.xlsx",
    "by_name": true,
    "needs_include_hierarchy": false,
    "needs_make_dir": true,
    "needs_all_photos": false,
    "needs_date": false,
    "needs_print_settings": true,
    "force_download": false,
    "char_enc": "shift_jis"
  };
  public selectTemplate: TemplateConfig = {} as TemplateConfig;
  public templates: TemplateConfig[];
  private explanationImages = [
    {
      src: "/assets/explanation-images/explanation-image-0.png",
      caption: "",
      thumb: ""
    }
  ]

  @ViewChild(MatVerticalStepper, { static: false }) stepper: MatVerticalStepper;

  constructor(
    public projectsService: ProjectsService,
    public generateService: GenerateService,
    public templateService: TemplateService,
    private alert: AlertService,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private lightbox: Lightbox
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.projectsService.currentProjectSubject
      .subscribe(
        project => {
          if(project) {
            this.currentProject = project;
            this.permissions = this.projectsService.getCurrentPermissions();
            this.order.title = project.name;
            this.onListTemplates();
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
    this.order.template_id = this.selectTemplate.template_id

    this.generateService.generate(projectId, order)
      .pipe(
        timeout(28000),
        catchError(error => throwError(error))
      )
      .subscribe(
         (response: Generated) => {
           this.isProgress = false;
           this.generatedFile = response;
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
    this.order.title = this.currentProject.name;
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
    this.generatedFile = null;
    this.order.needs_include_hierarchy = false;
    this.order.needs_make_dir = true;
    this.order.needs_all_photos = false;
    this.order.needs_date = false;
    this.order.needs_print_settings = true;
    this.order.title = this.currentProject.name;
    this.stepper.reset();
  }

  openUploadTemplateDialog() {
    const dialogRef = this.dialog.open(
      UploadTemplateComponent, 
      { 
        data: { 
          projectId: this.currentProject.project_id,
          projectTemplatesCount: this.projectTemplates.length,
          userTemplatesCount: this.userTemplates.length,
        },
        disableClose: true, 
        width: '600px' 
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.onListTemplates()
      }
    });
  }

  public onListTemplates() {
    this.isLoading = true;
    const projectId = this.currentProject.project_id;
    this.templateService.list(projectId)
      .subscribe(
        (templates: AvailableTemplates) => {
          this.defaultTemplates = templates.default;
          this.userTemplates = templates.user;
          this.projectTemplates = templates.project;
          this.templates = [...this.defaultTemplates, ...this.userTemplates, ...this.projectTemplates]
          this.selectTemplate = this.templates[0];
          this.isLoading = false;
        },
        err => {
           console.log("error: " + err);
           this.alert.openErrorAlert("テンプレート一覧の取得に失敗しました。");
           this.isLoading = false;
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

  public onDeleteTemplate(templateId: string) {
    this.isLoading = true;
    const projectId = this.currentProject.project_id;
    this.templateService.delete(projectId, templateId)
      .subscribe(
        res => {
          console.log(res);
          this.alert.openSuccessAlert("テンプレートの削除に成功しました。");
          this.onListTemplates();
          this.isLoading = false;
        },
        err => {
           console.log("error: " + err);
           this.alert.openErrorAlert("テンプレート一覧の取得に失敗しました。");
          this.isLoading = false;
        }
      );
  }

  public onListGeneratedFiles() {
    this.isLoading = true;
    let projectId = this.currentProject.project_id;
    this.subscriptions.push(timer(3000, 60000)
      .subscribe(
          () => {
            this.generateService.list(projectId)
              .subscribe(
                 res => {
                   this.generatedFiles = res;
                   this.isLoading = false;
                 },
                 err => {
                   this.isLoading = false;
                   console.log("error: " + err);
                   this.alert.openErrorAlert("履歴の取得に失敗。原因不明のエラーが発生しました。");
                 }
              )
          }
      )
    );
  }

  public onDownload(generatedFileId) {
    this.isLoading = true;
    let projectId = this.currentProject.project_id;
    this.generateService.generateDownloadUrl(projectId, generatedFileId)
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
          this.isLoading = false;
         },
         err => {
          this.isLoading = false;
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

  public openExplanationImages(index: number) {
    this.lightbox.open(this.explanationImages, index);
  }

}
