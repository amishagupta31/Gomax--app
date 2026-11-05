import { Alert, Linking } from 'react-native';
import { products as productImages } from '../assets/images';
import { shareOnWhatsApp } from './invite';

export type ProductGroup = 'adhesive' | 'grout_waterproofing';
export type UsePlace = 'floor' | 'wall' | 'bathroom' | 'outside';
export type ProductFilter = 'all' | 'floor' | 'wall' | 'big' | 'waterproof';

export type Product = {
  id: string;
  name: string;
  shortName: string;
  group: ProductGroup;
  eyebrow: string;
  eyebrowColor: string;
  pack: string;
  packColor: string;
  cardSubtitle: string;
  description: string;
  image: number;
  filters: ProductFilter[];
  heroChips?: [string, string];
  standards?: string[];
  stats?: { label: string; value: string; unit?: string }[];
  whereToUse?: UsePlace[];
  benefits?: string[];
  steps?: { title: string; sub: string }[];
  tds?: { sizeLabel: string; updated: string; headline: string; rows: [string, string][]; pdfUrl?: string };
};

const ADHESIVE_STEPS = [
  { title: 'Clean the surface', sub: 'No dust, oil or loose plaster' },
  { title: 'Mix with clean water', sub: 'Stir into a smooth paste, no lumps' },
  { title: 'Spread with a notched trowel', sub: 'Cover a small area at a time' },
  { title: 'Press the tile in place', sub: 'Fix tiles within 30 minutes' },
];

// Static catalogue from the C1 design until GET /products exists (dev notes: API needed).
export const PRODUCTS: Product[] = [
  {
    id: 'p10',
    name: 'Pure Tile P10',
    shortName: 'P10',
    group: 'adhesive',
    eyebrow: 'TILE ADHESIVE · 20 KG BAG',
    eyebrowColor: '#146C84',
    pack: '20 kg bag',
    packColor: '#4D6B1F',
    cardSubtitle: 'Ceramic tiles · inside',
    description: 'For ceramic tiles inside the house. Easy to mix, smooth to spread.',
    image: productImages.pureTileP10,
    filters: ['floor', 'wall'],
    heroChips: ['Walls + floors', 'Inside only'],
    standards: ['C1T', 'Type 1'],
    stats: [
      { label: '1 bag covers', value: '45–55', unit: 'sq ft' },
      { label: 'Set time', value: '20', unit: 'min' },
      { label: 'Just add', value: 'Water' },
    ],
    whereToUse: ['floor', 'wall', 'bathroom'],
    steps: ADHESIVE_STEPS,
    tds: {
      sizeLabel: 'PDF · 1.1 MB',
      updated: 'Sep 2026',
      headline: 'PURE TILE P10 — Tile adhesive',
      rows: [
        ['Type', 'C1T'],
        ['Coverage', '45–55 sq ft / 20 kg'],
        ['Open time', '20 min'],
      ],
    },
  },
  {
    id: 'p40',
    name: 'Pure Set P40',
    shortName: 'P40',
    group: 'adhesive',
    eyebrow: 'TILE ADHESIVE · 20 KG BAG',
    eyebrowColor: '#146C84',
    pack: '20 kg bag',
    packColor: '#1A6F86',
    cardSubtitle: 'Vitrified & porcelain · inside and outside',
    description: 'For vitrified, porcelain and ceramic tiles. Strong grip, and tiles do not slip on walls.',
    image: productImages.pureSetP40,
    filters: ['floor', 'wall', 'big'],
    heroChips: ['Walls + floors', 'Inside + outside'],
    standards: ['C2TE · EN 12004', 'Type 2 · IS 15477', 'ISI mark', 'German formula'],
    stats: [
      { label: '1 bag covers', value: '55–70', unit: 'sq ft' },
      { label: 'Set time', value: '30', unit: 'min' },
      { label: 'Just add', value: 'Water' },
    ],
    whereToUse: ['floor', 'wall', 'bathroom', 'outside'],
    benefits: [
      'Tiles do not slip down on walls',
      '30 minutes to set tiles, so less waste',
      'Holds big and heavy vitrified tiles',
      'Works inside and outside the house',
    ],
    steps: ADHESIVE_STEPS,
    tds: {
      sizeLabel: 'PDF · 1.2 MB',
      updated: 'Sep 2026',
      headline: 'PURE SET P40 — Polymer modified tile adhesive',
      rows: [
        ['Type', 'C2TE · EN 12004'],
        ['Coverage', '55–70 sq ft / 20 kg'],
        ['Pot life', '2 hours'],
        ['Open time', '30 min'],
        ['Water', '5.5 – 6 L / bag'],
      ],
    },
  },
  {
    id: 'is100',
    name: 'Pure Set IS100',
    shortName: 'IS100',
    group: 'adhesive',
    eyebrow: 'TILE ADHESIVE · 20 KG BAG',
    eyebrowColor: '#146C84',
    pack: '20 kg bag',
    packColor: '#B4570F',
    cardSubtitle: 'Big tiles · terrace · flexible',
    description: 'For big tiles, terraces and outside walls. Flexible, so tiles stay fixed in heat and rain.',
    image: productImages.pureSetIS100,
    filters: ['floor', 'wall', 'big'],
    heroChips: ['Big tiles', 'Inside + outside'],
    standards: ['C2TES1', 'Type 2'],
    stats: [
      { label: '1 bag covers', value: '50–60', unit: 'sq ft' },
      { label: 'Set time', value: '25', unit: 'min' },
      { label: 'Just add', value: 'Water' },
    ],
    whereToUse: ['floor', 'wall', 'bathroom', 'outside'],
    steps: ADHESIVE_STEPS,
    tds: {
      sizeLabel: 'PDF · 1.3 MB',
      updated: 'Sep 2026',
      headline: 'PURE SET IS100 — Flexible tile adhesive',
      rows: [
        ['Type', 'C2TES1'],
        ['Coverage', '50–60 sq ft / 20 kg'],
        ['Open time', '25 min'],
      ],
    },
  },
  {
    id: 'hg1200',
    name: 'Purepoxy HG 1200',
    shortName: 'HG 1200',
    group: 'grout_waterproofing',
    eyebrow: 'EPOXY GROUT',
    eyebrowColor: '#9A3412',
    pack: '5 kg bucket',
    packColor: '#9A3412',
    cardSubtitle: 'Epoxy grout for tile joints',
    description: 'Epoxy grout for tile joints. Stain-proof and water-proof.',
    image: productImages.purepoxyHG1200,
    filters: ['floor', 'wall'],
  },
  {
    id: 'urp',
    name: 'Purecrete URP',
    shortName: 'URP',
    group: 'grout_waterproofing',
    eyebrow: 'WATERPROOFING',
    eyebrowColor: '#0F2A4E',
    pack: '20 kg can',
    packColor: '#0F2A4E',
    cardSubtitle: 'Waterproofing & repairs',
    description: 'Waterproofing and repairs for roofs, walls and tanks.',
    image: productImages.purecreteURP,
    filters: ['waterproof'],
  },
  {
    id: 'iwl',
    name: 'Pure Proof IWL',
    shortName: 'IWL',
    group: 'grout_waterproofing',
    eyebrow: 'WATERPROOFING',
    eyebrowColor: '#12425A',
    pack: '10 L can',
    packColor: '#0F2A4E',
    cardSubtitle: 'Keeps water out of plaster',
    description: 'Mix into plaster and concrete to keep water out.',
    image: productImages.pureProofIWL,
    filters: ['waterproof', 'wall'],
  },
];

export const ADHESIVE_IDS = ['p10', 'p40', 'is100'];

export const COMPARE_ROWS: { label: string; values: [string, string, string]; highlightYes?: boolean }[] = [
  { label: 'BEST FOR', values: ['Ceramic tiles', 'Vitrified & porcelain', 'Big tiles & terrace'] },
  { label: 'WHERE', values: ['Inside only', 'Inside & outside', 'Inside & outside'] },
  { label: 'STANDARD', values: ['C1T · Type 1', 'C2TE · Type 2', 'C2TES1 · Type 2'] },
  { label: 'FLEXIBLE', values: ['—', '—', 'Yes'], highlightYes: true },
  { label: 'SET TIME', values: ['20 min', '30 min', '25 min'] },
  { label: '1 BAG COVERS', values: ['45–55 sq ft', '55–70 sq ft', '50–60 sq ft'] },
];

export const EASY_RULES: [string, string][] = [
  ['Ceramic tiles inside', 'Pure Tile P10'],
  ['Vitrified or porcelain', 'Pure Set P40'],
  ['Big tiles, terrace, outside wall', 'Pure Set IS100'],
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function downloadDataSheet(product: Product) {
  if (product.tds?.pdfUrl) return Linking.openURL(product.tds.pdfUrl);
  Alert.alert('Data sheet coming soon', `The ${product.name} PDF has not been uploaded yet.`);
}

export function shareDataSheet(product: Product) {
  const link = product.tds?.pdfUrl ? `\n${product.tds.pdfUrl}` : '';
  return shareOnWhatsApp(`${product.name} · Technical data sheet${link}`);
}
