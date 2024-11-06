import { Stringutil } from './stringutil';

export class StringVal {
  public val: string;
  public type: string;

  public constructor(val: string, type?: string) {
    this.val = val;
    this.type = type;
  }

  public cleanName(allowUnderscores = false): string {
    return Stringutil.cleanName(this.val, allowUnderscores);
  }
  public isNameCleaned(): boolean {
    return !this.val || this.val === this.cleanName();
  }
}
