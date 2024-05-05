export function roundNumber(num: number, decimals: number) {
  let rounded = num.toFixed(decimals);
  // Remove trailing zeros
  rounded = rounded.replace(/\.?0+$/, '');
  return rounded;
}
