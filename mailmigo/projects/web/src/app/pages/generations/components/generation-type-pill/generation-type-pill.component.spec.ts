import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationTypePillComponent } from './generation-type-pill.component';

describe('GenerationTypePillComponent', () => {
  let component: GenerationTypePillComponent;
  let fixture: ComponentFixture<GenerationTypePillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationTypePillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationTypePillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
