import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ChangeDetectionStrategy, inject, type AfterViewInit } from '@angular/core';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { CoverageCode } from '@/shared/models/coverage-code.model';
import { ZardCheckboxComponent } from '@/shared/components/checkbox/checkbox.component';

interface iDialogData {
  name: string;
  username: string;
}

@Component({
  selector: 'app-add-coverage-code',
  imports: [
    ZardButtonComponent,
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
export class AddCoverageCode {
  private zData: CoverageCode = inject(Z_MODAL_DATA);

  form = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(4),
    ]),
    description: new FormControl('', [Validators.required, Validators.minLength(1)]),
    active: new FormControl(false),
  });

  ngAfterViewInit(): void {
    if (this.zData) {
      this.form.patchValue(this.zData);
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
      zOnOk: (instance) => {
        console.log('Form submitted:', instance.form.value);
      },
      zWidth: '425px',
    });
  }
}
