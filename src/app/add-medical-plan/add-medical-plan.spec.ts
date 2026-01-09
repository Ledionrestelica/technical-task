import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMedicalPlan } from './add-medical-plan';

describe('AddMedicalPlan', () => {
  let component: AddMedicalPlan;
  let fixture: ComponentFixture<AddMedicalPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMedicalPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMedicalPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
