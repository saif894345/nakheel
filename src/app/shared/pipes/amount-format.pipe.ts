import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'amountFormat', standalone: false })
export class AmountFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, maxFractionDigits = 0): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: maxFractionDigits,
    }).format(value);
  }
}

/** Compact form for large numbers, e.g. 19,577,502,739 -> 19.6 مليار */
export function compactAmount(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + ' مليار';
  }
  if (abs >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + ' مليون';
  }
  if (abs >= 1_000) {
    return (value / 1_000).toFixed(1) + ' ألف';
  }
  return new Intl.NumberFormat('en-US').format(value);
}
