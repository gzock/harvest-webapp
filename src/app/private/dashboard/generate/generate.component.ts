import { ChangeDetectionStrategy,Component,OnDestroy,OnInit,ViewChild } from '@angular/core';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { Observable,Subscription,timer } from "rxjs";
import { GuestPermissions } from '../../../shared/services/projects/action-permissions/permissions/guest-permissions';
import { formatJapanDate } from '../../../shared/utils/date';

import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ImageViewerService } from '../../../shared/components/image-viewer/image-viewer.component';

import { AlertService } from './../../../shared/services/alert/alert.service';
import { GenerateService,GenerationJob } from './../../../shared/services/generate/generate.service';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { TemplateService } from './../../../shared/services/template/template.service';
import { Project } from './../projects/project';

import { UploadTemplateComponent } from './../../../shared/components/upload-template/upload-template.component';
import { Permissions } from './../../../shared/services/projects/action-permissions/permissions/permissions';
import { AvailableTemplates } from './available-templates';
import { Generated } from './generated';
import { Order } from './order';
import { TemplateConfig } from './template-config';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit, OnDestroy {
  public currentProject: Project | null = null;
  private generationRequest?: Subscription;
  private generationOperation?: { key: string; request: Observable<GenerationJob> };
  public generationStatus = '';
  public templatesLoading = false;
  private templatesRequest?: Subscription;
  private historyRequest?: Subscription;
  private subscriptions: Subscription[] = [];
  public generatedFile: Generated | null = null;
  public isProgress: boolean = false;
  public isLoading: boolean = false;

  public isLinear = false;
  public firstFormGroup!: FormGroup;
  public secondFormGroup!: FormGroup;
  public generateType: string = '';
  public checked: any;
  public permissions: Permissions = new GuestPermissions();
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
    "needs_sort": false,
    "force_download": false,
    "char_enc": "shift_jis"
  };
  public selectTemplate: TemplateConfig = {} as TemplateConfig;
  public templates: TemplateConfig[] = [];
  private explanationImages = [
    {
      src: "/assets/explanation-images/explanation-image-0.png",
      caption: "",
      thumb: ""
    }
  ]

  @ViewChild(MatStepper, { static: false }) stepper!: MatStepper;

  constructor(
    public projectsService: ProjectsService,
    public generateService: GenerateService,
    public templateService: TemplateService,
    private alert: AlertService,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private lightbox: ImageViewerService
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.projectsService.currentProjectSubject
      .subscribe(
        project => {
          this.generationRequest?.unsubscribe();
          this.generationOperation = undefined;
          this.isProgress = false;
          this.generationStatus = '';
          this.templatesRequest?.unsubscribe();
          this.historyRequest?.unsubscribe();
          this.currentProject = project;
          this.generatedFiles = [];
          this.generatedFile = null;
          this.templates = [];
          this.selectTemplate = {} as TemplateConfig;
          this.order.template_id = 'basic_1.xlsx';
          this.templatesLoading = false;
          this.defaultTemplates = [];
          this.userTemplates = [];
          this.projectTemplates = [];
          this.permissions = this.projectsService.getCurrentPermissions();
          if(project) {
            this.currentProject = project;
            this.permissions = this.projectsService.getCurrentPermissions();
            this.order.title = project.name;
            this.onListTemplates();
          }
        },
        _error => {

        }
      )
    )

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

    this.onListGeneratedFiles();
  }

  ngOnDestroy() {
    this.generationRequest?.unsubscribe();
    this.templatesRequest?.unsubscribe();
    this.historyRequest?.unsubscribe();
    for(const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  public onGenerate(order: Order) {
    if (!this.currentProject || this.isProgress || this.templatesLoading || !this.order.type ||
      (this.order.type === 'excel' && !this.selectTemplate.template_id)) return;
    const projectId = this.currentProject.project_id;
    this.isProgress = true;
    this.generatedFile = null;
    this.generationStatus = '受付中';
    this.order.template_id = this.selectTemplate?.template_id || this.order.template_id;
    const requestOrder = { ...order, template_id: this.order.template_id };
    const operationKey = JSON.stringify([projectId, requestOrder]);
    if (this.generationOperation?.key !== operationKey) {
      this.generationOperation = { key: operationKey, request: this.generateService.generate(projectId, requestOrder) };
    }
    this.generationRequest = this.generationOperation.request.subscribe({
      next: job => {
        this.generationStatus = job.status === 'queued' ? '処理待ち' : '生成中';
        if (job.status === 'succeeded') {
          this.generatedFile = job.result || null;
          this.isProgress = false;
          this.generationStatus = '完了';
          if (!job.result?.download_url) this.alert.openSuccessAlert('生成が完了しました。履歴からダウンロードしてください。');
        } else if (job.status === 'failed') {
          this.generationOperation = undefined;
          this.isProgress = false;
          this.generationStatus = '生成失敗';
          this.alert.openErrorAlert('生成に失敗しました。設定を確認して再度お試しください。');
        }
      },
      error: () => {
        this.isProgress = false;
        this.generationStatus = '状態の確認に失敗';
        this.alert.openErrorAlert('生成状態を確認できません。処理が完了している場合は履歴からダウンロードできます。');
      },
    });
  }

  public onSetGenerateType(type: string) {
    if (!this.currentProject) return;
    this.order.title = this.currentProject.name;
    this.order.type = type;
    this.onNext();
  }

  public onNext() {
    if (this.stepper.selected) this.stepper.selected.completed = true;
    //this.stepper.selected.editable = false;
    this.stepper.next();
  }

  public onPrevious() {
    this.stepper.previous();
  }

  public resetOrderProperty() {
    this.order.needs_include_hierarchy = false;
    this.order.needs_make_dir = true;
    this.order.needs_all_photos = false;
    this.order.needs_date = false;
    this.order.needs_print_settings = true;
    this.order.needs_sort = false;
  }

  public onReset() {
    this.generationRequest?.unsubscribe();
    this.generationOperation = undefined;
    this.isProgress = false;
    if (!this.currentProject) return;
    this.generatedFile = null;
    this.resetOrderProperty();
    this.order.title = this.currentProject.name;
    this.stepper.reset();
  }

  openUploadTemplateDialog() {
    if (!this.currentProject) return;
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
    if (!this.currentProject) return;
    this.templatesRequest?.unsubscribe();
    this.templatesLoading = true;
    this.isLoading = true;
    const projectId = this.currentProject.project_id;
    this.templatesRequest = this.templateService.list(projectId)
      .subscribe(
        (templates: AvailableTemplates) => {
          this.defaultTemplates = templates.default;
          this.userTemplates = templates.user;
          this.projectTemplates = templates.project;
          this.templates = [...this.defaultTemplates, ...this.userTemplates, ...this.projectTemplates]
          this.selectTemplate = this.templates[0] || {} as TemplateConfig;
          this.templatesLoading = false;
          this.isLoading = false;
        },
        _err => {

           this.templatesLoading = false;
           this.alert.openErrorAlert("テンプレート一覧の取得に失敗しました。");
           this.isLoading = false;
        }
      );
  }



  public onDeleteTemplate(templateId: string | undefined) {
    if (!templateId) return;
    if (!this.currentProject) return;
    this.isLoading = true;
    const projectId = this.currentProject.project_id;
    this.templateService.delete(projectId, templateId)
      .subscribe(
        _res => {

          this.alert.openSuccessAlert("テンプレートの削除に成功しました。");
          this.onListTemplates();
          this.isLoading = false;
        },
        _err => {

           this.templatesLoading = false;
           this.alert.openErrorAlert("テンプレート一覧の取得に失敗しました。");
          this.isLoading = false;
        }
      );
  }

  public onListGeneratedFiles() {
    this.subscriptions.push(timer(3000, 60000)
      .subscribe(
          () => {
            if (!this.currentProject) return;
            this.historyRequest?.unsubscribe();
            this.isLoading = true;
            const projectId = this.currentProject.project_id;
            this.historyRequest = this.generateService.list(projectId)
              .subscribe(
                 res => {
                   this.generatedFiles = res;
                   this.isLoading = false;
                 },
                 _err => {
                   this.isLoading = false;

                   this.alert.openErrorAlert("履歴の取得に失敗。原因不明のエラーが発生しました。");
                 }
              )
          }
      )
    );
  }

  public onDownload(generatedFileId: string) {
    if (!this.currentProject) return;
    this.isLoading = true;
    const projectId = this.currentProject.project_id;
    this.generateService.generateDownloadUrl(projectId, generatedFileId)
      .subscribe(
         (res: Generated) => {
           if(res.download_url) {
             const a = document.createElement('a');
             document.body.appendChild(a);
             a.setAttribute('style', 'display: none');
             a.href = res.download_url;
             a.setAttribute('download', '');
             a.click();
             a.remove();
           }
          this.isLoading = false;
         },
         _err => {
          this.isLoading = false;

          this.alert.openErrorAlert("生成失敗。原因不明のエラーが発生しました。");
         }
      );
  }



  public formatDate(date: string) {
    return formatJapanDate(date, true);
  }

  public openExplanationImages(index: number) {
    this.lightbox.open(this.explanationImages, index);
  }

}
