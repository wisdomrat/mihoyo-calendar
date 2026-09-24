export type UiVersion = 'v1' | 'v2';

/** V2 is the default UI; `?ui=v1` is the explicit URL opt-out. No storage or business state is read. */
export function resolveUiVersion(search: string): UiVersion {
  return new URLSearchParams(search).get('ui') === 'v1' ? 'v1' : 'v2';
}
