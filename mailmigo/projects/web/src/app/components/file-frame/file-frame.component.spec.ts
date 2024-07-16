import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileFrameComponent } from './file-frame.component';

describe('FileFrameComponent', () => {
  let component: FileFrameComponent;
  let fixture: ComponentFixture<FileFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileFrameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
