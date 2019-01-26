import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'project_1', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'project_2', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'project_3', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'project_4', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'project_5', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'project_6', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'project_7', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'project_8', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'project_9', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'project_10', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
