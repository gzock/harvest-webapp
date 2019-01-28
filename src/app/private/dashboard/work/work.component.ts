import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';

import { TargetActionsComponent } from './../../../shared/components/target-actions/target-actions.component';

export interface PlaceElement {
  name: string;
  action: number;
  before: number;
  after: number;
}

export interface TargetElement {
  name: string;
  before: number;
  after: number;
}

const PLACE_ELEMENT_DATA: PlaceElement[] = [
  {name: '拠点1', before: 10, after: 0, action: 0},
  {name: '拠点2', before: 20, after: 0, action: 0},
  {name: '部屋1', before: 30, after: 0, action: 0},
  {name: '部屋2', before: 40, after: 0, action: 0},
  {name: '1F', before: 50, after: 0, action: 0},
  {name: '2F', before: 60, after: 0, action: 0},
];

const TARGET_ELEMENT_DATA: TargetElement[] = [
  {name: 'AP_1', before: 1, after: 1},
  {name: 'AP_2', before: 2, after: 1},
  {name: 'RT_1', before: 2, after: 1},
  {name: 'RT_2', before: 1, after: 0},
  {name: 'FW_1', before: 2, after: 0},
  {name: 'FW_2', before: 4, after: 0},
];

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss']
})
export class WorkComponent implements OnInit {

  constructor(
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {
  }

  openBottomSheet(): void {
    this.bottomSheet.open(TargetActionsComponent);
  }

  displayedPlaceColumns: string[] = ['name', 'before', 'after', 'action'];
  placeDataSource = new MatTableDataSource(PLACE_ELEMENT_DATA);

  displayedTargetColumns: string[] = ['name', 'before', 'after'];
  targetDataSource = new MatTableDataSource(TARGET_ELEMENT_DATA);
}
