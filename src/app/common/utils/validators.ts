import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noWhitespaceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value == null || value === '') return null;
  const isWhitespace = typeof value === 'string' && value.trim().length === 0;
  return isWhitespace ? { whitespace: true } : null;
};
