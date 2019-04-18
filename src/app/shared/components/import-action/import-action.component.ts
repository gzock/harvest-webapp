import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";

import { ProjectsService } from './../../services/projects/projects.service';
import { AlertService } from './../../services/alert/alert.service';

@Component({
  selector: 'app-import-action',
  templateUrl: './import-action.component.html',
  styleUrls: ['./import-action.component.scss']
})
export class ImportActionComponent implements OnInit {
  public errMsg: string;
  public code: string;
  private selectedFile: any;
  public fileSize: number;
  public isImporting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ImportActionComponent>,
    public projectsService: ProjectsService,
    private alert: AlertService
  ) { }

  ngOnInit() {
  }

  public onAccept() {
    this.dialogRef.close(true);
  }

  public onFileSelected(event) {
    if(event.target.files) {
      this.onInputCsv(event.target.files[0])
        .subscribe(
          data => {
            this.isImporting = true;
            let csv = data.split(",")[1]
            this.onImportExecute(csv);
          }
        );
    }
  }

  private onImportExecute(csv) {
    this.projectsService.import(csv)
      .subscribe(
         response => {
            this.isImporting = false;
            this.alert.openSucccessAlert("インポートに成功しました。");
            this.dialogRef.close(true);
         },
         err => {
            this.isImporting = false;
            console.log("error: " + err);
            if(err.error.error) {
              this.errMsg = "エラー: " + err.error.error.message;
            } else {
              this.errMsg = "エラー: タイムアウト";
            }
            this.alert.openErrorAlert("インポートに失敗しました。CSVファイルの内容をご確認ください。");
         }
      )
  }

  private onInputCsv(file): Observable<any> {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    return Observable.create(observer => {
      reader.onload = data => {
        observer.next(reader.result.toString());
      }
      reader.onerror = error => observer.error(error);
    });
  }

}
