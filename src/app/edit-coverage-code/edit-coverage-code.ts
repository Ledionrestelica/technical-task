import {
  Component,
  signal,
  OnInit,
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

import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { CoverageCode } from '@/shared/models/coverage-code.model';
import { ZardCheckboxComponent } from '@/shared/components/checkbox/checkbox.component';
import { LocalStorageService } from '@/shared/services/local-storage.service';
import { LucideAngularModule, Pencil } from 'lucide-angular';

@Component({
  selector: 'app-edit-coverage-code',
  imports: [
    ZardInputDirective,
    ZardCheckboxComponent,
    ZardDialogModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  templateUrl: './edit-coverage-code.html',
  styleUrl: './edit-coverage-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class EditCoverageCode implements OnInit {
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
        code: this.zData.code ?? '',
        description: this.zData.description ?? '',
        active: this.zData.active ?? false,
      });
    }
  }
}

@Component({
  selector: 'app-edit-coverage-code-dialog',
  imports: [ZardDialogModule, LucideAngularModule],
  template: `
    <lucide-angular (click)="openDialog()" [img]="pencil" class="size-4 cursor-pointer" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class EditCoverageCodeDialogComponent {
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
        console.log(instance.form.value);
      },
      zWidth: '425px',
      zOnCancel: () => {
        console.log('cancel');
      },
    });
  }
}
