import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {FormControl} from '@angular/forms';

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
  public userTemplatesCount: numbre = 5;
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
    },
    {
      src: "/assets/explanation-images/explanation-image-3.png",
      caption: "",
      thumb: ""
    }
  ];

  @ViewChild(MatVerticalStepper, { static: false }) stepper: MatVerticalStepper;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadTemplateComponent>,
    public templateService: TemplateService,
    private alert: AlertService,
    private lightbox: Lightbox
  ) { }

  ngOnInit() {
    this.projectId = this.data.projectId;
    this.projectTemplatesCount = this.data.projectTemplatesCount;
    this.userTemplatesCount = this.data.userTemplatesCount;
  }

  public onAccept() {
    this.dialogRef.close(true);
  }

  public onFileSelected(event) {
    if(event.target.files) {
      this.onUploadTemplate(event.target.files[0])
        .subscribe(
          data => {
            this.isUploading = true;
            this.newTemplate.template_data = data.split(",")[1]
            this.onUploadExecute(this.newTemplate);
          }
        );
    }
  }

  private onUploadExecute(config: TemplateConfig) {
    this.errMsg = "";
    this.templateService.create(this.projectId, config)
      .subscribe(
         response => {
            this.isUploading = true;
            this.alert.openSuccessAlert("アップロードに成功しました。");
            this.dialogRef.close(true);
         },
         err => {
            this.isUploading = false;
            console.log("error: " + err);
            if(err.error.error) {
              this.errMsg = "エラー: " + err.error.error.message;
              if(800 <= err.error.error.code && err.error.error.code <= 899) {
                this.errorCode = err.error.error.code - 804;
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

  public onPreviousStep() {
    this.stepper.previous();
  }

  public onResetStep() {
    this.stepper.reset();
  }

  public openExplanationImages(index: number) {
    this.lightbox.open(this.explanationImages, index);
  }

}
