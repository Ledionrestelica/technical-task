import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  effect,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@/shared/services/local-storage.service';
import {
  MedicalPlan,
  MedicalPlanDetail,
  CoverageSummary,
  CoverageConfiguration,
  CoverageRate,
  PlanContribution,
} from '@/shared/models/medical-plan.model';
import { CoverageCode } from '@/shared/models/coverage-code.model';
import { toast } from 'ngx-sonner';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCheckboxComponent } from '@/shared/components/checkbox/checkbox.component';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import { LucideAngularModule, Plus, Trash } from 'lucide-angular';

@Component({
  selector: 'app-medical-plan-detail',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCheckboxComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    LucideAngularModule,
  ],
  templateUrl: './medical-plan-detail.component.html',
  styleUrl: './medical-plan-detail.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalPlanDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly localStorageService = inject(LocalStorageService);

  readonly medicalPlan = signal<MedicalPlanDetail | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly coverageCodes = signal<CoverageCode[]>([]);
  readonly isSaving = signal<boolean>(false);
  private readonly isFormInitialized = signal<boolean>(false);
  private readonly activeValueSignal = signal<boolean>(false);

  readonly plus = Plus;
  readonly trash = Trash;

  readonly planId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: null,
  });

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

  readonly planContributionOptions: PlanContribution[] = [
    'Ch. 44',
    'Ch. 44-GSHP',
    'Ch. 78',
    'None',
  ];

  form = new FormGroup({
    code: new FormControl<string>('', [Validators.required, Validators.maxLength(4)]),
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(30)]),
    active: new FormControl<boolean>(false, [Validators.required]),
    coverageConfiguration: new FormArray<FormGroup>([]),
    coverageRates: new FormArray<FormGroup>([]),
    planContribution: new FormControl<PlanContribution>('None', [Validators.required]),
  });

  readonly isFormDisabled = computed(() => {
    if (!this.isFormInitialized()) {
      return false;
    }
    return !this.activeValueSignal();
  });

  constructor() {
    this.form.enable({ emitEvent: false });

    effect(() => {
      const id = this.planId();
      if (id) {
        this.loadMedicalPlan(id);
      }
    });

    this.loadCoverageCodes();
    this.initializeCoverageConfiguration();
    this.setupFormDisabling();
  }

  private setupFormDisabling(): void {
    this.form.get('active')?.valueChanges.subscribe((isActive) => {
      this.activeValueSignal.set(isActive ?? false);
      if (!this.isFormInitialized()) {
        return;
      }
      this.setFormDisabledState(isActive ?? false);
    });
  }

  private initializeCoverageConfiguration(): void {
    this.coverageSummaryOptions.forEach((type) => {
      const configGroup = new FormGroup({
        type: new FormControl<CoverageSummary>(type),
        employee: new FormControl<boolean>(false),
        dependent: new FormControl<boolean>(false),
      });
      this.coverageConfigurationFormArray.push(configGroup);
    });
  }

  get coverageConfigurationFormArray(): FormArray {
    return this.form.get('coverageConfiguration') as FormArray;
  }

  get coverageRatesFormArray(): FormArray {
    return this.form.get('coverageRates') as FormArray;
  }

  isCoverageConfigDisabled(type: CoverageSummary): boolean {
    const configs = this.coverageConfigurationFormArray.value as CoverageConfiguration[];
    const hasWaiverPlan = configs.some(
      (config) => config.type === 'Waiver Plan' && (config.employee || config.dependent)
    );
    const isWaiverPlan = type === 'Waiver Plan';
    const hasOtherOptions = configs.some(
      (config) => config.type !== 'Waiver Plan' && (config.employee || config.dependent)
    );

    if (hasWaiverPlan && !isWaiverPlan) {
      return true;
    }

    if (hasOtherOptions && isWaiverPlan) {
      return true;
    }

    return false;
  }

  hasSelfInsured(): boolean {
    const configs = this.coverageConfigurationFormArray.value as CoverageConfiguration[];
    return configs.some(
      (config) => config.type === 'Self Insured' && (config.employee || config.dependent)
    );
  }

  addCoverageRate(): void {
    const rateGroup = this.createCoverageRateFormGroup();
    this.coverageRatesFormArray.push(rateGroup);
  }

  private createCoverageRateFormGroup(rate?: CoverageRate): FormGroup {
    const rateGroup = new FormGroup({
      coverageCodeId: new FormControl<string>(rate?.coverageCodeId || '', [Validators.required]),
      rate: new FormControl<number | null>(rate?.rate || null, [
        Validators.required,
        Validators.min(0),
      ]),
      projectedRate: new FormControl<number | null>(rate?.projectedRate || null, [
        Validators.min(0),
      ]),
      districtPortionDollar: new FormControl<number | null>(rate?.districtPortionDollar || null),
      districtPortionPercent: new FormControl<number | null>(rate?.districtPortionPercent || null),
    });

    this.setupCoverageCodeValidation(rateGroup);
    this.setupDistrictPortionSync(rateGroup);

    return rateGroup;
  }

  private setupCoverageCodeValidation(rateGroup: FormGroup): void {
    const coverageCodeControl = rateGroup.get('coverageCodeId');
    if (!coverageCodeControl) return;

    coverageCodeControl.addValidators((control) => {
      if (!control.value) {
        return null;
      }

      const selectedCodeId = control.value;
      const otherRates = this.coverageRatesFormArray.controls.filter((rg) => rg !== control.parent);

      const isDuplicate = otherRates.some(
        (rg) => rg.get('coverageCodeId')?.value === selectedCodeId
      );

      return isDuplicate ? { duplicateCoverageCode: true } : null;
    });

    coverageCodeControl.valueChanges.subscribe(() => {
      this.validateAllCoverageCodes();
    });
  }

  private validateAllCoverageCodes(): void {
    this.coverageRatesFormArray.controls.forEach((rateGroup) => {
      rateGroup.get('coverageCodeId')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private setupDistrictPortionSync(rateGroup: FormGroup): void {
    const dollarControl = rateGroup.get('districtPortionDollar');
    const percentControl = rateGroup.get('districtPortionPercent');
    const rateControl = rateGroup.get('rate');

    if (!dollarControl || !percentControl || !rateControl) return;

    dollarControl.valueChanges.subscribe((dollar) => {
      const rate = rateControl.value;
      if (this.canCalculatePercent(dollar, rate)) {
        const percent = (dollar / rate) * 100;
        percentControl.setValue(percent, { emitEvent: false });
      }
    });

    percentControl.valueChanges.subscribe((percent) => {
      const rate = rateControl.value;
      if (this.canCalculateDollar(percent, rate)) {
        const dollar = (rate * percent) / 100;
        dollarControl.setValue(dollar, { emitEvent: false });
      }
    });
  }

  private canCalculatePercent(dollar: number | null, rate: number | null): boolean {
    return dollar !== null && dollar !== undefined && rate !== null && rate > 0;
  }

  private canCalculateDollar(percent: number | null, rate: number | null): boolean {
    return percent !== null && percent !== undefined && rate !== null && rate > 0;
  }

  removeCoverageRate(index: number): void {
    this.coverageRatesFormArray.removeAt(index);
  }

  getCoverageCodeDescription(id: string): string {
    const code = this.coverageCodes().find((coverageCode) => coverageCode.id === id);
    return code ? `${code.code} - ${code.description}` : '';
  }

  getCoverageConfigGroup(index: number): FormGroup {
    return this.coverageConfigurationFormArray.at(index) as FormGroup;
  }

  getCoverageRateGroup(index: number): FormGroup {
    return this.coverageRatesFormArray.at(index) as FormGroup;
  }

  getCoverageConfigType(index: number): CoverageSummary {
    const group = this.getCoverageConfigGroup(index);
    return group.get('type')?.value;
  }

  getEmployeeControl(index: number): FormControl<boolean> {
    return this.getCoverageConfigGroup(index).get('employee') as FormControl<boolean>;
  }

  getDependentControl(index: number): FormControl<boolean> {
    return this.getCoverageConfigGroup(index).get('dependent') as FormControl<boolean>;
  }

  getCoverageCodeIdControl(index: number): FormControl<string> {
    return this.getCoverageRateGroup(index).get('coverageCodeId') as FormControl<string>;
  }

  getRateControl(index: number): FormControl<number | null> {
    return this.getCoverageRateGroup(index).get('rate') as FormControl<number | null>;
  }

  getProjectedRateControl(index: number): FormControl<number | null> {
    return this.getCoverageRateGroup(index).get('projectedRate') as FormControl<number | null>;
  }

  getDistrictPortionDollarControl(index: number): FormControl<number | null> {
    return this.getCoverageRateGroup(index).get('districtPortionDollar') as FormControl<
      number | null
    >;
  }

  getDistrictPortionPercentControl(index: number): FormControl<number | null> {
    return this.getCoverageRateGroup(index).get('districtPortionPercent') as FormControl<
      number | null
    >;
  }

  async loadCoverageCodes(): Promise<void> {
    try {
      const response = await this.localStorageService.getItem<CoverageCode>('coverage_codes');
      if (response.status === 'success' && response.data) {
        this.coverageCodes.set(response.data.filter((coverageCode) => coverageCode.active));
      }
    } catch (error) {
      console.error('Failed to load coverage codes', error);
    }
  }

  async loadMedicalPlan(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.localStorageService.getItem<MedicalPlan>('medical_plans');
      if (response.status !== 'success' || !response.data) {
        toast.error(response.message || 'Failed to load medical plan');
        this.router.navigate(['/medical-plans']);
        return;
      }

      const plan = response.data.find((medicalPlan) => medicalPlan.id === id);
      if (!plan) {
        toast.error('Medical plan not found');
        this.router.navigate(['/medical-plans']);
        return;
      }

      const planDetail = this.convertToMedicalPlanDetail(plan);
      this.medicalPlan.set(planDetail);
      this.populateForm(planDetail);
    } catch (error) {
      toast.error('Failed to load medical plan');
      this.router.navigate(['/medical-plans']);
    } finally {
      this.isLoading.set(false);
    }
  }

  private convertToMedicalPlanDetail(plan: MedicalPlan): MedicalPlanDetail {
    const coverageConfiguration = this.buildCoverageConfiguration(plan);
    return {
      ...plan,
      coverageConfiguration,
      coverageRates: (plan as any).coverageRates || [],
      planContribution: (plan as any).planContribution || 'None',
    };
  }

  private buildCoverageConfiguration(plan: MedicalPlan): CoverageConfiguration[] {
    if ((plan as any).coverageConfiguration) {
      return (plan as any).coverageConfiguration;
    }

    return this.coverageSummaryOptions.map((type) => ({
      type,
      employee: plan.coverageSummary.includes(type),
      dependent: plan.coverageSummary.includes(type),
    }));
  }

  private populateForm(planDetail: MedicalPlanDetail): void {
    this.populateCoverageConfiguration(planDetail.coverageConfiguration);
    this.populateCoverageRates(planDetail.coverageRates);
    this.populatePlanDetails(planDetail);
    this.setFormDisabledState(planDetail.active);
    this.form.markAsPristine();
    this.isFormInitialized.set(true);
  }

  private populateCoverageConfiguration(configurations: CoverageConfiguration[]): void {
    this.clearFormArray(this.coverageConfigurationFormArray);

    this.coverageSummaryOptions.forEach((type) => {
      const existing = configurations.find((config) => config.type === type);
      const configGroup = new FormGroup({
        type: new FormControl<CoverageSummary>(type),
        employee: new FormControl<boolean>(existing?.employee || false),
        dependent: new FormControl<boolean>(existing?.dependent || false),
      });
      this.coverageConfigurationFormArray.push(configGroup);
    });
  }

  private populateCoverageRates(rates: CoverageRate[]): void {
    this.clearFormArray(this.coverageRatesFormArray);

    rates.forEach((rate) => {
      const rateGroup = this.createCoverageRateFormGroup(rate);
      this.coverageRatesFormArray.push(rateGroup);
    });
  }

  private populatePlanDetails(planDetail: MedicalPlanDetail): void {
    this.form.patchValue(
      {
        code: planDetail.code,
        name: planDetail.name,
        active: planDetail.active,
        planContribution: planDetail.planContribution,
      },
      { emitEvent: false }
    );
    this.activeValueSignal.set(planDetail.active);
  }

  private setFormDisabledState(isActive: boolean): void {
    if (!isActive) {
      this.form.disable({ emitEvent: false });
      this.form.get('active')?.enable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });

      this.coverageConfigurationFormArray.controls.forEach((control) => {
        control.enable({ emitEvent: false });
      });

      this.coverageRatesFormArray.controls.forEach((control) => {
        control.enable({ emitEvent: false });
      });
    }

    this.coverageConfigurationFormArray.controls.forEach((control) => {
      control.get('employee')?.updateValueAndValidity({ emitEvent: false });
      control.get('dependent')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private clearFormArray(formArray: FormArray): void {
    while (formArray.length > 0) {
      formArray.removeAt(0);
    }
  }

  validateCoverageConfiguration(): boolean {
    const configs = this.coverageConfigurationFormArray.value as CoverageConfiguration[];
    const hasSelection = configs.some((config) => config.employee || config.dependent);
    if (!hasSelection) {
      this.form.get('coverageConfiguration')?.setErrors({ required: true });
      return false;
    }
    this.form.get('coverageConfiguration')?.setErrors(null);
    return true;
  }

  async save(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);
    try {
      const planDetail = this.medicalPlan();
      if (!planDetail) {
        toast.error('Medical plan not found');
        return;
      }

      if (!(await this.isPlanCodeUnique(planDetail.id))) {
        return;
      }

      const planToSave = this.buildPlanToSave(planDetail);
      await this.updateMedicalPlan(planDetail.id, planToSave);
    } catch (error) {
      toast.error('Failed to save medical plan');
      console.error(error);
    } finally {
      this.isSaving.set(false);
    }
  }

  private isFormValid(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (!this.validateCoverageConfiguration()) {
        toast.error('Please select at least one coverage option');
      }
      return false;
    }

    if (!this.validateCoverageConfiguration()) {
      toast.error('Please select at least one coverage option');
      return false;
    }

    return true;
  }

  private async isPlanCodeUnique(currentPlanId: string): Promise<boolean> {
    const formValue = this.form.value;
    const allPlansResponse = await this.localStorageService.getItem<MedicalPlan>('medical_plans');

    if (allPlansResponse.status !== 'success' || !allPlansResponse.data) {
      return true;
    }

    const existingPlan = allPlansResponse.data.find(
      (medicalPlan) => medicalPlan.code === formValue.code && medicalPlan.id !== currentPlanId
    );

    if (existingPlan) {
      toast.error('Plan Code must be unique');
      this.isSaving.set(false);
      return false;
    }

    return true;
  }

  private buildPlanToSave(planDetail: MedicalPlanDetail): MedicalPlanDetail {
    const formValue = this.form.getRawValue();
    const configs = (formValue.coverageConfiguration as CoverageConfiguration[]) || [];
    const coverageSummary: CoverageSummary[] = configs
      .filter((config) => config.employee || config.dependent)
      .map((c) => c.type);

    return {
      ...planDetail,
      code: formValue.code || '',
      name: formValue.name || '',
      active: formValue.active || false,
      coverageSummary,
      coverageConfiguration: configs,
      coverageRates: (formValue.coverageRates as CoverageRate[]) || [],
      planContribution: formValue.planContribution || 'None',
    };
  }

  private async updateMedicalPlan(planId: string, planToSave: MedicalPlanDetail): Promise<void> {
    const response = await this.localStorageService.updateItem<MedicalPlan>(
      'medical_plans',
      planId,
      planToSave
    );

    if (response.status === 'success') {
      toast.success('Medical plan updated successfully');
      this.form.markAsPristine();
      this.medicalPlan.set(planToSave);
    } else {
      toast.error(response.message || 'Failed to update medical plan');
    }
  }
}
