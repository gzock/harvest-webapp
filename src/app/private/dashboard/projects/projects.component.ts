import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  public projects = [
    {
      name: "hoge",
      content: "fuga"
    },
    {
      name: "foo",
      content: "bar"
    }
  ];

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
