import { FormGroup } from '@angular/forms';

export function isInvalid(form: FormGroup, controlName: string): boolean {
  const control = form.get(controlName);
  return !!(control && control.invalid && (control.touched || control.dirty));
}

export function hasError(form: FormGroup, controlName: string, errorType: string): boolean {
  const control = form.get(controlName);
  return !!(control && control.hasError(errorType) && (control.touched || control.dirty));
}
