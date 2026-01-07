import { Component, inject } from '@angular/core';
import { ZardInputDirective } from '../shared/components/input/input.directive';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { FormControl, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ZardFormImports } from '../shared/components/form/form.imports';

@Component({
  selector: 'app-form-page',
  imports: [ZardInputDirective, ReactiveFormsModule, ZardButtonComponent, ZardFormImports],
  templateUrl: './form-page.html',
  standalone: true,
})
export class FormPage {
  private formBuilder = inject(FormBuilder);

  email = new FormControl('', Validators.required);
  profileForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
  });

  onSubmit() {
    console.log(JSON.stringify(this.profileForm.value, null, 2));
  }

  get name() {
    return this.profileForm.get('name');
  }

  isInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.hasError(errorType) && (control.touched || control.dirty));
  }
}
