import { d3 } from '../assets';

/** The API names 3D art in kebab-case ("wrapped-gift"); the app bundles it as d3.wrappedGift. */
export function artFor(name: string | null | undefined): number {
  const key = (name ?? '').replace(/-([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
  return (d3 as Record<string, number>)[key] ?? d3.wrappedGift;
}
