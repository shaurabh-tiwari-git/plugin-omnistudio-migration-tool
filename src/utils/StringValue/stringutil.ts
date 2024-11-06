export class Stringutil {
  public static cleanName(name: string, allowUnderscores = false): string {
    if (!name) return '';
    return allowUnderscores ? name.replace(/[^a-z0-9_]+/gi, '') : name.replace(/[^a-z0-9]+/gi, '');
  }
}
