import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { ZardCardComponent } from '../shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { RouterLink } from '@angular/router';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { CoverageCode } from '../coverage-codes/models/coverage-code.model';
import { MedicalPlan } from '../medical-plans/models/medical-plan.model';

@Component({
  selector: 'app-home',
  imports: [ZardCardComponent, ZardButtonComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly localStorageService = inject(LocalStorageService);

  readonly totalCoverageCodes = signal<number>(0);
  readonly totalMedicalPlans = signal<number>(0);
  readonly isLoading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    await this.loadCounts();
  }

  private async loadCounts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [coverageCodesResponse, medicalPlansResponse] = await Promise.all([
        this.localStorageService.getItem<CoverageCode>('coverage_codes'),
        this.localStorageService.getItem<MedicalPlan>('medical_plans'),
      ]);

      if (coverageCodesResponse.status === 'success') {
        this.totalCoverageCodes.set(coverageCodesResponse.data?.length ?? 0);
      }

      if (medicalPlansResponse.status === 'success') {
        this.totalMedicalPlans.set(medicalPlansResponse.data?.length ?? 0);
      }
    } catch (error) {
      console.error('Failed to load counts', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
