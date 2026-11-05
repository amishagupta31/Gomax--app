import { Award, Crown, HardHat, LucideIcon, Medal } from 'lucide-react-native';
import { d3 } from '../assets';
import { c } from '../theme';

// Rank ladder from the Read-me card: Naya Saathi 0 · Kaarigar 500 ·
// Ustaad 2,000 · GoMax Legend 5,000 (client to confirm the Legend limit).
export type RankId = 'naya-saathi' | 'kaarigar' | 'ustaad' | 'legend';

export type Rank = {
  id: RankId;
  name: string;
  min: number;
  color: string;
  tint: string;
  icon?: LucideIcon;
  /** 3D medal shown on the rank & benefits sheet (A3-02 / C3-02). */
  art: number;
  benefits: string[];
};

export const RANKS: Record<RankId, Rank> = {
  'naya-saathi': {
    id: 'naya-saathi', name: 'Naya Saathi', min: 0, color: c.rankNayaSaathi, tint: c.rankNayaSaathi50, icon: HardHat,
    art: d3.sportsMedal, benefits: ['3 free spins a day'],
  },
  kaarigar: {
    id: 'kaarigar', name: 'Kaarigar', min: 500, color: c.rankKaarigar, tint: c.rankKaarigar50, icon: Award,
    art: d3.firstPlaceMedal, benefits: ['4 free spins a day', '+10% runs'],
  },
  ustaad: {
    id: 'ustaad', name: 'Ustaad', min: 2000, color: c.rankUstaad, tint: c.rankUstaad50, icon: Medal,
    art: d3.crown, benefits: ['5 free spins a day', '+20% runs'],
  },
  legend: {
    id: 'legend', name: 'GoMax Legend', min: 5000, color: c.rankLegend, tint: c.rankLegend50, icon: Crown,
    art: d3.gemStone, benefits: ['Benefits: CLIENT to confirm'],
  },
};

export const RANK_ORDER: RankId[] = ['naya-saathi', 'kaarigar', 'ustaad', 'legend'];

export function rankFor(lifetimePoints: number): RankId {
  let r: RankId = 'naya-saathi';
  for (const id of RANK_ORDER) if (lifetimePoints >= RANKS[id].min) r = id;
  return r;
}

export function nextRank(id: RankId): RankId | null {
  const i = RANK_ORDER.indexOf(id);
  return i >= 0 && i < RANK_ORDER.length - 1 ? RANK_ORDER[i + 1] : null;
}
