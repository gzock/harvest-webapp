import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material';
import { CreateProjectComponent } from './../../../shared/components/create-project/create-project.component';
import { SettingProjectComponent } from './../../../shared/components/setting-project/setting-project.component';

export interface PeriodicElement {
  name: string;
  position: number;
  start: string;
  deadline: string;
  complete: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'project_1', start: "2018/10/01", deadline: '2018/12/31', complete: "2018/12/24"},
  {position: 1, name: 'project_2', start: "2018/11/01", deadline: '2018/11/31', complete: "2018/12/24"},
  {position: 1, name: 'project_3', start: "2018/02/01", deadline: '2018/03/31', complete: "2018/12/24"},
  {position: 1, name: 'project_4', start: "2018/05/01", deadline: '2018/12/31', complete: "2018/12/24"},
  {position: 1, name: 'project_5', start: "2018/06/01", deadline: '2018/12/31', complete: "2018/12/24"},
  {position: 1, name: 'project_6', start: "2019/01/01", deadline: '2018/12/31', complete: "2018/12/24"},
];

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  displayedColumns: string[] = ['position', 'name', 'start', 'deadline', 'complete'];
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


  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  openSettingProjectDialog() {
    const dialogRef = this.dialog.open(SettingProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
