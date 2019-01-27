import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-setting-project',
  templateUrl: './setting-project.component.html',
  styleUrls: ['./setting-project.component.scss']
})
export class SettingProjectComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  public users = [
    {
      name: "hoge",
      organization: "株式会社ミライト"
    },
    {
      name: "foo",
      organization: "株式会社ミライト"
    }
  ];

}
