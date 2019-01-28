import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetActionsComponent } from './target-actions.component';

describe('TargetActionsComponent', () => {
  let component: TargetActionsComponent;
  let fixture: ComponentFixture<TargetActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
