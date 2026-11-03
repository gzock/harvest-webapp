import { ChangeDetectionStrategy,Component,Inject,OnDestroy,OnInit,ViewChild } from '@angular/core';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { readDataUrl } from '../../utils/file';

import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { ImageViewerService } from '../image-viewer/image-viewer.component';

import { ReplaySubject,finalize,switchMap,takeUntil } from "rxjs";

import { TemplateConfig } from './../../../private/dashboard/generate/template-config';
import { AlertService } from './../../services/alert/alert.service';
import { TemplateService } from './../../services/template/template.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-upload-template',
  templateUrl: './upload-template.component.html',
  styleUrls: ['./upload-template.component.scss']
})
export class UploadTemplateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new ReplaySubject<void>(1);
  private projectId: string = '';
  public errMsg: string = '';
  public code: string = '';
  public fileSize: number = 0;
  public isUploading: boolean = false;
  public errorCode: number = 0;
  public newTemplate: TemplateConfig = {
    template_type: "",
    template_data: "",
    name: "",
    description: "",
    property_title: false,
    property_hierarchy: false,
    property_date: false
  };
  public projectTemplatesCount: number = 5;
  public userTemplatesCount: number = 5;
  private explanationImages = [
    {
      src: "/assets/explanation-images/explanation-image-1.png",
      caption: "",
      thumb: ""
    },
    {
      src: "/assets/explanation-images/explanation-image-2.png",
      caption: "",
      thumb: ""
    }
  ];
  public firstFormGroup!: FormGroup;
  public secondFormGroup!: FormGroup;

  @ViewChild(MatStepper, { static: false }) stepper!: MatStepper;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadTemplateComponent>,
    public templateService: TemplateService,
    private alert: AlertService,
    private lightbox: ImageViewerService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.projectId = this.data.projectId;
    this.projectTemplatesCount = this.data.projectTemplatesCount;
    this.userTemplatesCount = this.data.userTemplatesCount;
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
      thirdCtrl: ['', Validators.required]
    });
  }

  public onAccept() {
    this.dialogRef.close(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.firstFormGroup.valid || !this.secondFormGroup.valid || this.isUploading) return;
    const config = { ...this.newTemplate,
      template_type: this.firstFormGroup.controls['firstCtrl'].value,
      name: this.secondFormGroup.controls['secondCtrl'].value,
      description: this.secondFormGroup.controls['thirdCtrl'].value,
    };
    this.isUploading = true;
    this.errMsg = '';
    readDataUrl(input.files[0]).pipe(
      switchMap(data => this.templateService.create(this.projectId, { ...config, template_data: data.split(',')[1] })),
      takeUntil(this.destroy$),
      finalize(() => { this.isUploading = false; }),
    ).subscribe({
      next: () => {
        this.alert.openSuccessAlert('アップロードに成功しました。');
        this.dialogRef.close(true);
      },
      error: error => {
        const detail = error?.error?.error;
        const message = typeof detail?.message === 'string' ? detail.message : '';
        const explanations: Record<number, string> = {
          804: '同じ名前のテンプレートをアップロードすることはできません。',
          805: '必要なプロパティが不足しています。テンプレートの設定とセルを確認してください。',
          806: '設定されている改ページの数が多いです。改ページは0または1つに設定してください。',
          807: '印刷エリアが設定されていません。',
          808: '各プロパティは1つだけ入力してください。',
          809: '指定されたプロパティが印刷エリアまたは改ページ内に存在しません。',
        };
        this.errMsg = explanations[detail?.code] || message || 'ファイルを読み込めないか、通信に失敗しました。再度お試しください。';
        this.alert.openErrorAlert('アップロードに失敗しました。エクセルファイルの内容をご確認ください。');
      },
    });
  }

  public onNextStep() {
    if (this.stepper.selected) this.stepper.selected.completed = true;
    //this.stepper.selected.editable = false;
    this.stepper.next();
  }

  public openExplanationImages(index: number) {
    this.lightbox.open(this.explanationImages, index);
  }

}
