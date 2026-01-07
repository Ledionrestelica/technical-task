import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ZardTableComponent } from '../shared/components/table/table.component';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { CoverageCode } from '@/shared/models/coverage-code.model';
import { signal } from '@angular/core';
import { LucideAngularModule, CircleCheck, CircleX, LoaderCircle } from 'lucide-angular';
import { AddCoverageCodeDialogComponent } from '../add-coverage-code/add-coverage-code';

@Component({
  selector: 'app-coverage-codes',
  imports: [
    ZardTableComponent,
    LucideAngularModule,
    AddCoverageCodeDialogComponent,
  ],
  templateUrl: './coverage-codes.html',
  styleUrl: './coverage-codes.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverageCodesComponent {
  readonly circleCheck = CircleCheck;
  readonly circleX = CircleX;
  readonly loaderCircle = LoaderCircle;

  readonly coverageCodes = signal<CoverageCode[]>([]);
  readonly isLoading = signal<boolean>(true);

  constructor(private readonly localStorageService: LocalStorageService) {
    this.loadCoverageCodes();
  }

  loadCoverageCodes(): void {
    this.isLoading.set(true);
    this.localStorageService.getItem('coverage_codes').then((coverageCodes) => {
      this.coverageCodes.set(coverageCodes ?? []);
      this.isLoading.set(false);
    });
  }

  onSaved(): void {
    this.loadCoverageCodes();
  }
}
