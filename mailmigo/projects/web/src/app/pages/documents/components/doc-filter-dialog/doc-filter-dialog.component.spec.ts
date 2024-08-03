import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocFilterDialogComponent } from './doc-filter-dialog.component';

describe('DocFilterDialogComponent', () => {
  let component: DocFilterDialogComponent;
  let fixture: ComponentFixture<DocFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocFilterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
