import {
  Component,
  signal,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { isInvalid, hasError } from '@/shared/utils/helpers';

import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardCheckboxComponent } from '@/shared/components/checkbox/checkbox.component';
import { LocalStorageService } from '@/shared/services/local-storage.service';
import { toast } from 'ngx-sonner';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { CoverageSummary, MedicalPlan } from '@/shared/models/medical-plan.model';

@Component({
  selector: 'app-add-medical-plan',
  imports: [ZardInputDirective, ZardCheckboxComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './add-medical-plan.html',
  styleUrl: './add-medical-plan.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AddMedicalPlan implements OnInit {
  private zData: MedicalPlan | null = inject(Z_MODAL_DATA, { optional: true }) ?? null;
  private cdr = inject(ChangeDetectorRef);

  readonly coverageSummaryOptions: CoverageSummary[] = [
    'Major Medical',
    'Hospitalization',
    'Prescription',
    'Dental',
    'Vision',
    'Other',
    'Waiver Plan',
    'Self Insured',
  ];

  form = new FormGroup({
    planCode: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(4),
    ]),
    planName: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(30),
    ]),
    coverageSummary: new FormControl<MedicalPlan['coverageSummary']>([]),
    active: new FormControl(false),
  });

  formInvalid = signal<boolean>(this.form.invalid);

  constructor() {
    this.form.statusChanges.subscribe(() => {
      this.formInvalid.set(this.form.invalid);
    });

    this.form.valueChanges.subscribe(() => {
      this.formInvalid.set(this.form.invalid);
    });
  }

  ngOnInit(): void {
    if (this.zData) {
      this.form.patchValue({
        planCode: this.zData.code,
        planName: this.zData.name,
        coverageSummary: this.zData.coverageSummary,
        active: this.zData.active,
      });
    }

    this.cdr.detectChanges();
  }

  isInvalid(controlName: string): boolean {
    return isInvalid(this.form, controlName);
  }

  hasError(controlName: string, errorType: string): boolean {
    return hasError(this.form, controlName, errorType);
  }

  isCoverageSelected(option: string): boolean {
    const currentValue = this.form.get('coverageSummary')?.value || [];
    return currentValue.includes(option as CoverageSummary);
  }

  isCoverageDisabled(option: string): boolean {
    const currentValue = this.form.get('coverageSummary')?.value || [];
    const hasWaiverPlan = currentValue.includes('Waiver Plan' as CoverageSummary);
    const isWaiverPlan = option === 'Waiver Plan';
    const hasOtherOptions = currentValue.some((item: CoverageSummary) => item !== 'Waiver Plan');

    if (hasWaiverPlan && !isWaiverPlan) {
      return true;
    }

    if (hasOtherOptions && isWaiverPlan) {
      return true;
    }

    return false;
  }

  onCoverageChange(option: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentValue = this.form.get('coverageSummary')?.value || [];
    let newValue: MedicalPlan['coverageSummary'];

    if (checkbox.checked) {
      if (option === 'Waiver Plan') {
        newValue = ['Waiver Plan'] as CoverageSummary[];
      } else {
        newValue = [
          ...currentValue.filter((item: CoverageSummary) => item !== 'Waiver Plan'),
          option as CoverageSummary,
        ];
      }
    } else {
      newValue = currentValue.filter(
        (item: CoverageSummary) => item !== (option as CoverageSummary)
      );
    }

    this.form.patchValue({ coverageSummary: newValue });
    this.cdr.detectChanges();
  }
}

@Component({
  selector: 'app-add-medical-plan-dialog',
  imports: [ZardButtonComponent],
  template: `
    <button type="button" z-button zType="outline" (click)="openDialog()">Add Medical Plan</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AddMedicalPlanDialogComponent {
  private dialogService = inject(ZardDialogService);
  private localStorageService = inject(LocalStorageService);

  @Output() saved = new EventEmitter<void>();

  isSaving = signal<boolean>(false);

  openDialog() {
    this.dialogService.create({
      zTitle: 'Add Medical Plan',
      zDescription: `Add a new medical plan to the system.`,
      zContent: AddMedicalPlan,
      zData: {
        code: '',
        name: '',
        active: true,
      } as MedicalPlan,
      zOkText: 'Save changes',
      zOnOk: async (instance: AddMedicalPlan) => {
        if (instance.form.invalid) {
          instance.form.markAllAsTouched();
          return false;
        }

        if (this.isSaving()) {
          return false;
        }

        this.isSaving.set(true);
        try {
          const formValue = instance.form.value;

          const newPlan: MedicalPlan = {
            id: crypto.randomUUID(),
            code: formValue.planCode ?? '',
            name: formValue.planName ?? '',
            coverageSummary: (formValue.coverageSummary as MedicalPlan['coverageSummary']) || [],
            active: formValue.active ?? false,
          };

          const response = await this.localStorageService.setItemWithCodeCheck<MedicalPlan>(
            'medical_plans',
            [newPlan]
          );

          if (response.status === 'success') {
            toast.success(response.message);
            this.saved.emit();
          } else {
            toast.error(response.message);
          }
          return true;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          this.isSaving.set(false);
        }
      },
      zWidth: '425px',
      zOkDisabled: (instance: AddMedicalPlan) => {
        return this.isSaving() || instance.formInvalid();
      },
      zOnCancel: () => {
        console.log('cancel');
      },
    });
  }
}
