import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatVerticalStepper } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { Lightbox } from 'ngx-lightbox';

import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";

import { TemplateService } from './../../services/template/template.service';
import { TemplateConfig } from './../../../private/dashboard/generate/template-config';
import { AlertService } from './../../services/alert/alert.service';

@Component({
  selector: 'app-upload-template',
  templateUrl: './upload-template.component.html',
  styleUrls: ['./upload-template.component.scss']
})
export class UploadTemplateComponent implements OnInit {
  private projectId: string;
  public errMsg: string;
  public code: string;
  private selectedFile: any;
  public fileSize: number;
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
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;

  @ViewChild(MatVerticalStepper, { static: false }) stepper: MatVerticalStepper;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadTemplateComponent>,
    public templateService: TemplateService,
    private alert: AlertService,
    private lightbox: Lightbox,
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

  public onFileSelected(event) {
    if(event.target.files) {
      this.onUploadTemplate(event.target.files[0])
        .subscribe(
          data => {
            this.newTemplate.template_data = data.split(",")[1]
            this.onUploadExecute(this.newTemplate);
          }
        );
    }
  }

  private onUploadExecute(config: TemplateConfig) {
    this.isUploading = true;
    this.errMsg = "";
    this.templateService.create(this.projectId, config)
      .subscribe(
         response => {
            this.isUploading = false;
            this.alert.openSuccessAlert("アップロードに成功しました。");
            this.dialogRef.close(true);
         },
         err => {
            this.isUploading = false;
            console.log("error: " + err);

            if(err.error.error) {
              this.errMsg = "エラー: " + err.error.error.message;
              switch(err.error.error.code) {
                case 804:
                  this.errMsg = `同じ名前のテンプレートをアップロードすることはできません。`;
                  break;
                case 805:
                  const requiredStr: string = err.error.error.message.split(":")[1];
                  this.errMsg = `必要なプロパティ設定が足りません。エクセル内のどこかのセルに必ず"${requiredStr}"という文字列を入力しておく必要があります。`;
                  break;
                case 806:
                  this.errMsg = `設定されている改ページの数が多いです。改ページは"0"あるいは"1"つに設定してください。`;
                  break;
                case 807:
                  this.errMsg = `印刷エリアが設定されていません。`;
                  break;
                case 808:
                  const property: string = err.error.error.message.match(/^.*:\s(.*),\s.*$/)[1];
                  const count: string = err.error.error.message.split(":")[2];
                  this.errMsg = `各プロパティは1つだけ入力してください。"${property}"というプロパティが${count}個存在しています。`;
                  break;
                case 809:
                  this.errMsg = `指定されたプロパティが印刷エリアまたは改ページ内に存在しません。`;
                  break;
              }
            } else {
              this.errMsg = "エラー: タイムアウト";
            }
            this.alert.openErrorAlert("アップロードに失敗しました。エクセルファイルの内容をご確認ください。");
         }
      )
  }

  private onUploadTemplate(file): Observable<any> {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    return Observable.create(observer => {
      reader.onload = data => {
        observer.next(reader.result.toString());
      }
      reader.onerror = error => observer.error(error);
    });
  }

  public onNextStep() {
    this.stepper.selected.completed = true;
    //this.stepper.selected.editable = false;
    this.stepper.next();
  }

  public openExplanationImages(index: number) {
    this.lightbox.open(this.explanationImages, index);
  }

}
