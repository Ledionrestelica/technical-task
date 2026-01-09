import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCoverageCode } from './edit-coverage-code';

describe('EditCoverageCode', () => {
  let component: EditCoverageCode;
  let fixture: ComponentFixture<EditCoverageCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCoverageCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCoverageCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
