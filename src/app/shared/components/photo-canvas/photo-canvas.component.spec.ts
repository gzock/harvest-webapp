import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoCanvasComponent } from './photo-canvas.component';

describe('PhotoCanvasComponent', () => {
  let component: PhotoCanvasComponent;
  let fixture: ComponentFixture<PhotoCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
