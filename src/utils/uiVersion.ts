export type UiVersion = 'v1' | 'v2';

/** Only an explicit URL opt-in enables V2; no storage or business state is read. */
export function resolveUiVersion(search: string): UiVersion {
  return new URLSearchParams(search).get('ui') === 'v2' ? 'v2' : 'v1';
}
