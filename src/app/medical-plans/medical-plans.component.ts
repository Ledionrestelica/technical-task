import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ZardTableComponent } from '../shared/components/table/table.component';
import { AddMedicalPlanDialogComponent } from '../add-medical-plan/add-medical-plan';
import { LocalStorageService } from '../shared/services/local-storage.service';
import {
  MedicalPlan,
  MedicalPlanDetail,
  CoverageConfiguration,
} from '../shared/models/medical-plan.model';
import { toast } from 'ngx-sonner';
import { LucideAngularModule, Trash, Loader, Pencil } from 'lucide-angular';
import { ZardDialogService } from '../shared/components/dialog/dialog.service';

@Component({
  selector: 'app-medical-plans',
  imports: [ZardTableComponent, AddMedicalPlanDialogComponent, LucideAngularModule],
  templateUrl: './medical-plans.html',
  styleUrl: './medical-plans.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalPlansComponent {
  private readonly router = inject(Router);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dialogService = inject(ZardDialogService);

  readonly medicalPlans = signal<MedicalPlan[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly deletingId = signal<string | null>(null);

  readonly trash = Trash;
  readonly loader = Loader;
  readonly pencil = Pencil;

  constructor() {
    this.loadMedicalPlans();
  }

  async loadMedicalPlans(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.localStorageService.getItem<MedicalPlan>('medical_plans');
      if (response.status === 'success') {
        this.medicalPlans.set(response.data ?? []);
      } else {
        toast.error(response.message);
        this.medicalPlans.set([]);
      }
    } catch (error) {
      toast.error('Failed to load medical plans');
      this.medicalPlans.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSaved(): void {
    this.loadMedicalPlans();
  }

  editMedicalPlan(id: string): void {
    this.router.navigate(['/medical-plans', id]);
  }

  async deleteMedicalPlan(id: string): Promise<void> {
    const isAssignedToEmployees = await this.checkIfAssignedToEmployees(id);

    if (isAssignedToEmployees) {
      toast.error('Cannot delete plan. Plan is assigned to employees.');
      return;
    }

    const dialogRef = this.dialogService.create({
      zTitle: 'Delete Medical Plan',
      zDescription:
        'Are you sure you want to delete this medical plan? This action cannot be undone.',
      zContent: '',
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: async () => {
        this.deletingId.set(id);
        const response = await this.localStorageService.deleteItem<MedicalPlan>(
          'medical_plans',
          id
        );
        if (response.status === 'success') {
          toast.success(response.message);
          this.medicalPlans.update((prev) => prev.filter((plan) => plan.id !== id));
          this.deletingId.set(null);
        } else {
          toast.error(response.message);
          this.deletingId.set(null);
        }
        return true;
      },
      zWidth: '400px',
    });
  }

  private async checkIfAssignedToEmployees(planId: string): Promise<boolean> {
    try {
      const response = await this.localStorageService.getItem<MedicalPlan>('medical_plans');
      if (response.status !== 'success' || !response.data) {
        return false;
      }

      const plan = response.data.find((plan) => plan.id === planId);
      if (!plan) {
        return false;
      }

      const planDetail = plan as MedicalPlanDetail;
      const coverageConfiguration =
        planDetail.coverageConfiguration || (plan as any).coverageConfiguration;

      if (!coverageConfiguration || !Array.isArray(coverageConfiguration)) {
        return false;
      }

      return coverageConfiguration.some(
        (config: CoverageConfiguration) => config.employee === true
      );
    } catch (error) {
      console.error('Error checking if plan is assigned to employees', error);
      return false;
    }
  }
}
