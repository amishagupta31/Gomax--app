// Product catalogue (C1). Information only — no points, no prices, no dealer.
// GET /products?category · GET /products/{id}/tds. Copy for P40 is from
// Figma; the rest follows the same shape — CLIENT to share final list.
import type { Job } from '../components/JobGlyph';

export type Product = {
  id: string;
  code: string; // big watermark on the hero (Bebas Neue)
  name: string;
  short: string;
  category: 'adhesive' | 'grout';
  kind: string; // "TILE ADHESIVE", "EPOXY GROUT"…
  pack: string;
  accent: string; // tag + eyebrow colour
  image: number;
  jobs: Job[];
  heroTags: [string, string, string];
  intro: string;
  standards: string[];
  facts: { label: string; value: string; unit?: string }[];
  uses: { job: Job; label: string }[];
  why: string[];
  steps: { title: string; sub: string }[];
  tds?: { size: string; updated: string; title: string; rows: [string, string][] };
  compare?: { bestFor: string; where: string; standard: string; flexible: string; setTime: string; covers: string };
};

const img = {
  p10: require('../../../assets/v3/products/pure-tile-p10.png'),
  p40: require('../../../assets/v3/products/pure-set-p40.png'),
  is100: require('../../../assets/v3/products/pure-set-is100.png'),
  hg1200: require('../../../assets/v3/products/purepoxy-hg1200.png'),
  urp: require('../../../assets/v3/products/purecrete-urp.png'),
  iwl: require('../../../assets/v3/products/pure-proof-iwl.png'),
};

const STEPS_ADHESIVE = [
  { title: 'Clean the surface', sub: 'No dust, oil or loose plaster' },
  { title: 'Mix with clean water', sub: 'Stir into a smooth paste, no lumps' },
  { title: 'Spread with a notched trowel', sub: 'Cover a small area at a time' },
  { title: 'Press the tile in place', sub: 'Fix tiles within 30 minutes' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p10',
    code: 'P10',
    name: 'Pure Tile P10',
    short: 'Ceramic tiles · inside',
    category: 'adhesive',
    kind: 'TILE ADHESIVE',
    pack: '20 kg bag',
    accent: '#4f6b12',
    image: img.p10,
    jobs: ['floor', 'wall'],
    heroTags: ['Walls + floors', 'Inside only', '20 min to set tiles'],
    intro: 'For ceramic tiles on inside walls and floors. Easy to mix and spread.',
    standards: ['C1T · EN 12004', 'Type 1 · IS 15477', 'ISI mark'],
    facts: [
      { label: '1 bag covers', value: '45–55', unit: 'sq ft' },
      { label: 'Set time', value: '20', unit: 'min' },
      { label: 'Just add', value: 'Water' },
    ],
    uses: [
      { job: 'floor', label: 'Floor' },
      { job: 'wall', label: 'Wall' },
      { job: 'bathroom', label: 'Bathroom' },
    ],
    why: ['Good grip for ceramic tiles', 'Smooth, easy to spread', 'No need to soak tiles'],
    steps: STEPS_ADHESIVE,
    tds: {
      size: '1.0 MB',
      updated: 'Sep 2026',
      title: 'PURE TILE P10 — Cement based tile adhesive',
      rows: [
        ['Type', 'C1T · EN 12004'],
        ['Coverage', '45–55 sq ft / 20 kg'],
        ['Pot life', '2 hours'],
        ['Open time', '20 min'],
        ['Water', '5 – 5.5 L / bag'],
      ],
    },
    compare: { bestFor: 'Ceramic tiles', where: 'Inside only', standard: 'C1T · Type 1', flexible: '—', setTime: '20 min', covers: '45–55 sq ft' },
  },
  {
    id: 'p40',
    code: 'P40',
    name: 'Pure Set P40',
    short: 'Vitrified & porcelain · inside and outside',
    category: 'adhesive',
    kind: 'TILE ADHESIVE',
    pack: '20 kg bag',
    accent: '#0e6a82',
    image: img.p40,
    jobs: ['floor', 'wall', 'bathroom'],
    heroTags: ['Walls + floors', 'Inside + outside', '30 min to set tiles'],
    intro: 'For vitrified, porcelain and ceramic tiles. Strong grip, and tiles do not slip on walls.',
    standards: ['C2TE · EN 12004', 'Type 2 · IS 15477', 'ISI mark', 'German formula'],
    facts: [
      { label: '1 bag covers', value: '55–70', unit: 'sq ft' },
      { label: 'Set time', value: '30', unit: 'min' },
      { label: 'Just add', value: 'Water' },
    ],
    uses: [
      { job: 'floor', label: 'Floor' },
      { job: 'wall', label: 'Wall' },
      { job: 'bathroom', label: 'Bathroom' },
      { job: 'outside', label: 'Outside' },
    ],
    why: ['Tiles do not slip down on walls', '30 minutes to set tiles, so less waste', 'Holds big and heavy vitrified tiles', 'Works inside and outside the house'],
    steps: STEPS_ADHESIVE,
    tds: {
      size: '1.2 MB',
      updated: 'Sep 2026',
      title: 'PURE SET P40 — Polymer modified tile adhesive',
      rows: [
        ['Type', 'C2TE · EN 12004'],
        ['Coverage', '55–70 sq ft / 20 kg'],
        ['Pot life', '2 hours'],
        ['Open time', '30 min'],
        ['Water', '5.5 – 6 L / bag'],
      ],
    },
    compare: { bestFor: 'Vitrified & porcelain', where: 'Inside & outside', standard: 'C2TE · Type 2', flexible: '—', setTime: '30 min', covers: '55–70 sq ft' },
  },
  {
    id: 'is100',
    code: 'IS100',
    name: 'Pure Set IS100',
    short: 'Big tiles · terrace · flexible',
    category: 'adhesive',
    kind: 'TILE ADHESIVE',
    pack: '20 kg bag',
    accent: '#9a4a06',
    image: img.is100,
    jobs: ['floor', 'wall', 'big', 'outside', 'roof'],
    heroTags: ['Big tiles + stone', 'Terrace + outside', 'Flexible'],
    intro: 'Flexible adhesive for big tiles, stone and terraces that move with heat.',
    standards: ['C2TES1 · EN 12004', 'Type 2 · IS 15477', 'ISI mark'],
    facts: [
      { label: '1 bag covers', value: '50–60', unit: 'sq ft' },
      { label: 'Set time', value: '25', unit: 'min' },
      { label: 'Just add', value: 'Water' },
    ],
    uses: [
      { job: 'big', label: 'Big tiles' },
      { job: 'wall', label: 'Wall' },
      { job: 'roof', label: 'Terrace' },
      { job: 'outside', label: 'Outside' },
    ],
    why: ['Bends a little, so tiles do not crack', 'Holds big slabs and stone', 'Good for terrace and outside walls'],
    steps: STEPS_ADHESIVE,
    tds: {
      size: '1.3 MB',
      updated: 'Sep 2026',
      title: 'PURE SET IS100 — Flexible tile adhesive',
      rows: [
        ['Type', 'C2TES1 · EN 12004'],
        ['Coverage', '50–60 sq ft / 20 kg'],
        ['Pot life', '2 hours'],
        ['Open time', '25 min'],
        ['Water', '5.5 – 6 L / bag'],
      ],
    },
    compare: { bestFor: 'Big tiles & terrace', where: 'Inside & outside', standard: 'C2TES1 · Type 2', flexible: 'Yes', setTime: '25 min', covers: '50–60 sq ft' },
  },
  {
    id: 'hg1200',
    code: 'HG',
    name: 'Purepoxy HG 1200',
    short: 'Epoxy grout for tile joints',
    category: 'grout',
    kind: 'EPOXY GROUT',
    pack: '5 kg bucket',
    accent: '#8e3a20',
    image: img.hg1200,
    jobs: ['joints', 'bathroom', 'floor'],
    heroTags: ['Tile joints', 'Stain proof', 'Many colours'],
    intro: 'Epoxy grout that fills tile joints, stays clean and does not let water in.',
    standards: ['RG · EN 13888', 'Food safe'],
    facts: [
      { label: '1 bucket fills', value: '80–100', unit: 'sq ft' },
      { label: 'Work time', value: '45', unit: 'min' },
      { label: 'Mix', value: 'A + B' },
    ],
    uses: [
      { job: 'joints', label: 'Joints' },
      { job: 'bathroom', label: 'Bathroom' },
      { job: 'floor', label: 'Kitchen' },
    ],
    why: ['Joints stay clean, no black lines', 'Water and stain proof', 'Strong, does not crack'],
    steps: [
      { title: 'Clean the joints', sub: 'Remove dust and extra adhesive' },
      { title: 'Mix part A and B', sub: 'Mix fully for 2–3 minutes' },
      { title: 'Fill joints with a float', sub: 'Press in at an angle' },
      { title: 'Clean the tile face', sub: 'Wipe within 30 minutes' },
    ],
    tds: { size: '0.9 MB', updated: 'Aug 2026', title: 'PUREPOXY HG 1200 — Epoxy grout', rows: [['Type', 'RG · EN 13888'], ['Coverage', '80–100 sq ft / 5 kg'], ['Work time', '45 min']] },
  },
  {
    id: 'urp',
    code: 'URP',
    name: 'Purecrete URP',
    short: 'Waterproofing & repairs',
    category: 'grout',
    kind: 'WATERPROOFING',
    pack: '20 kg can',
    accent: '#001e42',
    image: img.urp,
    jobs: ['roof', 'bathroom', 'outside'],
    heroTags: ['Roof + terrace', 'Repairs', 'Mix with cement'],
    intro: 'Mix with cement for waterproof plaster and repairs on roofs and walls.',
    standards: ['IS 2645'],
    facts: [
      { label: 'Use', value: '200', unit: 'ml / bag' },
      { label: 'Cure', value: '7', unit: 'days' },
      { label: 'Mix with', value: 'Cement' },
    ],
    uses: [
      { job: 'roof', label: 'Roof' },
      { job: 'bathroom', label: 'Bathroom' },
      { job: 'outside', label: 'Outside' },
    ],
    why: ['Stops leaks in plaster', 'Better grip for repairs', 'Easy to mix on site'],
    steps: [
      { title: 'Clean and wet the surface', sub: 'Remove loose plaster' },
      { title: 'Mix with cement and water', sub: 'As per bag ratio' },
      { title: 'Apply plaster or slurry', sub: '2 coats for roofs' },
      { title: 'Cure with water', sub: 'For 7 days' },
    ],
  },
  {
    id: 'iwl',
    code: 'IWL',
    name: 'Pure Proof IWL',
    short: 'Keeps water out of plaster',
    category: 'grout',
    kind: 'WATERPROOFING',
    pack: '10 L can',
    accent: '#0f3a52',
    image: img.iwl,
    jobs: ['wall', 'outside', 'bathroom'],
    heroTags: ['Walls', 'Inside + outside', 'Liquid'],
    intro: 'Integral liquid waterproofing for plaster and concrete.',
    standards: ['IS 2645'],
    facts: [
      { label: 'Use', value: '200', unit: 'ml / bag' },
      { label: 'Cure', value: '7', unit: 'days' },
      { label: 'Mix with', value: 'Water' },
    ],
    uses: [
      { job: 'wall', label: 'Wall' },
      { job: 'outside', label: 'Outside' },
      { job: 'bathroom', label: 'Bathroom' },
    ],
    why: ['No damp patches on walls', 'Plaster stays strong', 'Easy to add to the mix'],
    steps: [
      { title: 'Add to mixing water', sub: '200 ml per cement bag' },
      { title: 'Mix plaster as usual', sub: 'No change in method' },
      { title: 'Apply and finish', sub: 'Normal plaster work' },
      { title: 'Cure with water', sub: 'For 7 days' },
    ],
    tds: { size: '0.8 MB', updated: 'Aug 2026', title: 'PURE PROOF IWL — Integral waterproofing liquid', rows: [['Dosage', '200 ml / 50 kg cement'], ['Pack', '10 L can']] },
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[1];

export const JOBS: { key: Job; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'floor', label: 'Floor' },
  { key: 'wall', label: 'Wall' },
  { key: 'big', label: 'Big tiles' },
  { key: 'bathroom', label: 'Bathroom' },
  { key: 'roof', label: 'Roof' },
  { key: 'joints', label: 'Tile joints' },
];
