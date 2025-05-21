export function asserts(arg: boolean, message: string): asserts arg {
  if (!arg) throw new Error(message);
}
