import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { CoverageCode } from '@/coverage-codes/models/coverage-code.model';
import { LocalStorageService } from '@/shared/services/local-storage.service';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-coverage-code',
  imports: [FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './edit-coverage-code.html',
  styleUrl: './edit-coverage-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class EditCoverageCode implements OnInit, OnDestroy {
  private zData: CoverageCode | null = inject(Z_MODAL_DATA, { optional: true }) ?? null;
  private subscriptions = new Subscription();

  form = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(4),
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(30),
    ]),
    active: new FormControl(false),
  });

  formDirty = signal(false);

  private checkIfDirty(): void {
    if (!this.zData) {
      this.formDirty.set(this.form.dirty);
      return;
    }

    const currentValues = this.form.value;
    const isDirty =
      currentValues.code !== (this.zData.code ?? '') ||
      currentValues.description !== (this.zData.description ?? '') ||
      currentValues.active !== (this.zData.active ?? false);

    this.formDirty.set(isDirty);
  }

  ngOnInit(): void {
    if (this.zData) {
      this.form.patchValue({
        code: this.zData.code ?? '',
        description: this.zData.description ?? '',
        active: this.zData.active ?? false,
      });
      this.form.markAsPristine();
    }

    this.subscriptions.add(
      this.form.valueChanges.subscribe(() => {
        this.checkIfDirty();
      })
    );
    this.checkIfDirty();
  }

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upperValue = input.value.toUpperCase();
    this.form.patchValue({ code: upperValue }, { emitEvent: false });
    input.value = upperValue;
    this.checkIfDirty();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

@Component({
  selector: 'app-edit-coverage-code-dialog',
  imports: [LucideAngularModule],
  template: `
    <lucide-angular (click)="openDialog()" [img]="pencil" class="size-4 cursor-pointer" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class EditCoverageCodeDialogComponent {
  isSaving = signal<boolean>(false);
  @Input() coverageCode!: CoverageCode;
  @Output() saved = new EventEmitter<void>();

  private dialogService = inject(ZardDialogService);
  private localStorageService = inject(LocalStorageService);
  readonly pencil = Pencil;

  openDialog() {
    if (!this.coverageCode) {
      return;
    }

    this.dialogService.create({
      zTitle: 'Edit Coverage Code',
      zDescription: `Edit the coverage code.`,
      zContent: EditCoverageCode,
      zData: {
        id: this.coverageCode.id,
        code: this.coverageCode.code,
        description: this.coverageCode.description,
        active: this.coverageCode.active,
      },
      zOkText: 'Save changes',
      zOnOk: async (instance: EditCoverageCode) => {
        this.isSaving.set(true);

        try {
          const formValue = instance.form.value;
          const response = await this.localStorageService.updateItemWithCodeCheck<CoverageCode>(
            'coverage_codes',
            this.coverageCode.id,
            formValue as CoverageCode
          );

          if (response.status === 'success') {
            toast.success(response.message);
            this.saved.emit();
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          console.error(error);
        } finally {
          this.isSaving.set(false);
        }
      },
      zOkDisabled: (instance: EditCoverageCode) => {
        return this.isSaving() || !instance.formDirty();
      },
      zWidth: '425px',
      zOnCancel: () => {
        console.log('cancel');
      },
    });
  }
}
