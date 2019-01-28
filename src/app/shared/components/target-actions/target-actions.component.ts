import { Component, OnInit } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'app-target-actions',
  templateUrl: './target-actions.component.html',
  styleUrls: ['./target-actions.component.scss']
})
export class TargetActionsComponent implements OnInit {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<TargetActionsComponent>
  ) { }

  ngOnInit() {
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
