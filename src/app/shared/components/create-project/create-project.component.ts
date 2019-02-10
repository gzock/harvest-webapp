import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit {

  public new_project = {
    "name": ""
  }

  constructor() { }

  ngOnInit() {
  }

}
