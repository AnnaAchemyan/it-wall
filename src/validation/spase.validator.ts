import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
@ValidatorConstraint()
export class Empty implements ValidatorConstraintInterface {
  validate(value: any): Promise<boolean> | boolean {
    return value && value.toString().trim().length > 1;
  }
}