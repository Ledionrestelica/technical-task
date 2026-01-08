import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ZardTableComponent } from '../shared/components/table/table.component';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { CoverageCode } from '@/shared/models/coverage-code.model';
import { EditCoverageCodeDialogComponent } from '../edit-coverage-code/edit-coverage-code';
import { signal } from '@angular/core';
import {
  LucideAngularModule,
  CircleCheck,
  CircleX,
  LoaderCircle,
  Trash,
  Loader,
} from 'lucide-angular';
import { AddCoverageCodeDialogComponent } from '../add-coverage-code/add-coverage-code';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-coverage-codes',
  imports: [
    ZardTableComponent,
    LucideAngularModule,
    AddCoverageCodeDialogComponent,
    EditCoverageCodeDialogComponent,
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
  readonly trash = Trash;
  readonly loader = Loader;

  readonly coverageCodes = signal<CoverageCode[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly deletingId = signal<string | null>(null);

  constructor(private readonly localStorageService: LocalStorageService) {
    this.loadCoverageCodes();
  }

  async deleteCoverageCode(id: string): Promise<void> {
    this.deletingId.set(id);
    const response = await this.localStorageService.deleteItem('coverage_codes', id);
    if (response.status === 'success') {
      toast.success(response.message);
      this.coverageCodes.update((prev) => prev.filter((code) => code.id !== id));
      this.deletingId.set(null);
    } else {
      toast.error(response.message);
      this.deletingId.set(null);
    }
  }

  isDeleting(id: string): boolean {
    return this.deletingId() === id;
  }

  async loadCoverageCodes(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.localStorageService.getItem('coverage_codes');
      if (response.status === 'success') {
        this.coverageCodes.set(response.data ?? []);
      } else {
        toast.error(response.message);
        this.coverageCodes.set([]);
      }
    } catch (error) {
      toast.error('Failed to load coverage codes');
      this.coverageCodes.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSaved(): void {
    this.loadCoverageCodes();
  }
}
