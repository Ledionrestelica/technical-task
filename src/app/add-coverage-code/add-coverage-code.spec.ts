import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoverageCode } from './add-coverage-code';

describe('AddCoverageCode', () => {
  let component: AddCoverageCode;
  let fixture: ComponentFixture<AddCoverageCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCoverageCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCoverageCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
