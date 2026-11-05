import { getMyTier } from './wallet';

export type Rank = { name: string; minPoints: number; perks: string };

// Rank names/thresholds from the C3 design; the backend's tier_bands table still
// uses Bronze/Silver/Gold/Platinum, so only lifetime points are read from it.
export const RANKS: Rank[] = [
  { name: 'Naya Saathi', minPoints: 0, perks: '3 spins a day' },
  { name: 'Kaarigar', minPoints: 500, perks: '4 spins · +10% runs' },
  { name: 'Ustaad', minPoints: 2000, perks: '5 spins · +20% runs · gift first' },
  { name: 'GoMax Legend', minPoints: 5000, perks: 'benefits coming soon' },
];

export type MyRank = {
  lifetimePoints: number;
  currentIndex: number;
  current: Rank;
  next: Rank | null;
  pointsToNext: number;
  progress: number;
};

export function rankForPoints(lifetimePoints: number): MyRank {
  let currentIndex = 0;
  RANKS.forEach((r, i) => {
    if (lifetimePoints >= r.minPoints) currentIndex = i;
  });
  const current = RANKS[currentIndex];
  const next = RANKS[currentIndex + 1] ?? null;
  const pointsToNext = next ? next.minPoints - lifetimePoints : 0;
  const progress = next ? (lifetimePoints - current.minPoints) / (next.minPoints - current.minPoints) : 1;
  return { lifetimePoints, currentIndex, current, next, pointsToNext, progress };
}

export async function getMyRank(): Promise<MyRank> {
  const tier = await getMyTier();
  return rankForPoints(tier.lifetimePoints);
}
