import { Component, signal, OnInit, inject, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { CoverageCode } from '@/shared/models/coverage-code.model';
import { ZardCheckboxComponent } from '@/shared/components/checkbox/checkbox.component';
import { LocalStorageService } from '@/shared/services/local-storage.service';
import { toast } from 'ngx-sonner';
import { ZardButtonComponent } from '@/shared/components/button/button.component';

@Component({
  selector: 'app-add-coverage-code',
  imports: [
    ZardInputDirective,
    ZardCheckboxComponent,
    ZardDialogModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-coverage-code.html',
  styleUrl: './add-coverage-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AddCoverageCode implements OnInit {
  private zData: CoverageCode | null = inject(Z_MODAL_DATA);

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

  ngOnInit(): void {
    if (this.zData) {
      this.form.patchValue({
        code: this.zData.code,
        description: this.zData.description,
        active: this.zData.active,
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.hasError(errorType) && (control.touched || control.dirty));
  }
}

@Component({
  selector: 'app-add-coverage-code-dialog',
  imports: [ZardButtonComponent, ZardDialogModule],
  template: `
    <button type="button" z-button zType="outline" (click)="openDialog()">Add Coverage Code</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AddCoverageCodeDialogComponent {
  private dialogService = inject(ZardDialogService);
  private localStorageService = inject(LocalStorageService);

  @Output() saved = new EventEmitter<void>();

  isSaving = signal<boolean>(false);

  openDialog() {
    this.dialogService.create({
      zTitle: 'Add Coverage Code',
      zDescription: `Add a new coverage code to the system.`,
      zContent: AddCoverageCode,
      zData: {
        code: '',
        description: '',
        active: true,
      } as CoverageCode,
      zOkText: 'Save changes',
      zOnOk: async (instance: AddCoverageCode) => {
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

          const newCode: CoverageCode = {
            id: crypto.randomUUID(),
            code: formValue.code ?? '',
            description: formValue.description ?? '',
            active: formValue.active ?? false,
          };

          const response = await this.localStorageService.setItem('coverage_codes', [newCode]);

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
    });
  }
}
