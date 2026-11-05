import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock, Download, FileText, MessageCircle, Search, Share2, X } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3, img } from '../../assets';
import { CenterBar, TopBar } from '../../components/Layout';
import { Button } from '../../components/Button';
import { Glow } from '../../components/Glow';
import { JobGlyph, Job } from '../../components/JobGlyph';
import { JOBS, PRODUCTS, Product, productById } from '../../data/products';
import { V3ScreenProps, useV3Nav } from '../../navigation/types';

// TODO(backend): GET /products/{id}/tds → PDF url. Until then, confirm only.
function downloadTds(p: Product) {
  Alert.alert('Data sheet', `${p.name} data sheet (PDF · ${p.tds?.size ?? '1 MB'}) will download when the catalogue is live.`);
}
const shareTds = (p: Product) => Share.share({ message: `${p.name} — technical data sheet (GoMax)` });

// C1-01 Products · list (17:12970)
export function ProductsScreen() {
  const nav = useV3Nav();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [job, setJob] = useState<Job>('all');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const cardW = (width - 32 - 8) / 2;

  const list = useMemo(
    () =>
      PRODUCTS.filter((p) => (job === 'all' || p.jobs.includes(job)) && (!query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase()))),
    [job, query],
  );
  const adhesives = list.filter((p) => p.category === 'adhesive');
  const grouts = list.filter((p) => p.category === 'grout');
  const open = (p: Product) => nav.navigate('ProductDetail', { productId: p.id });

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          {searching ? (
            <View style={styles.searchBox}>
              <Search size={18} color={c.textSecondary} strokeWidth={1.75} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Search products"
                placeholderTextColor={c.textMuted}
                style={styles.searchInput}
              />
              <Pressable
                hitSlop={8}
                onPress={() => {
                  setQuery('');
                  setSearching(false);
                }}
              >
                <X size={18} color={c.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.h1}>Products</Text>
                <Text style={[t.sec13, { color: c.textSecondary }]}>{PRODUCTS.length} products · tap one to see how to use it</Text>
              </View>
              <Pressable style={styles.searchBtn} onPress={() => setSearching(true)} accessibilityLabel="Search">
                <Search size={22} color={c.textPrimary} strokeWidth={1.75} />
              </Pressable>
            </>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jobs}>
          {JOBS.map((j) => {
            const on = j.key === job;
            return (
              <Pressable key={j.key} onPress={() => setJob(j.key)} style={[styles.job, on ? { backgroundColor: c.navy900 } : styles.jobOff]}>
                <JobGlyph job={j.key} color={on ? '#fff' : c.textPrimary} />
                <Text style={[t.sec13Semibold, { color: on ? '#fff' : c.textPrimary }]}>{j.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {adhesives.length ? (
          <View style={{ paddingHorizontal: 16, marginTop: 34, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[t.title18, { color: c.textPrimary, flex: 1 }]}>Tile adhesives</Text>
              <Pressable onPress={() => nav.navigate('ProductCompare')} hitSlop={8}>
                <Text style={[t.sec13Semibold, { color: c.primary700 }]}>Compare</Text>
              </Pressable>
            </View>
            <View style={styles.grid}>
              {adhesives.map((p) => (
                <Pressable key={p.id} style={[styles.pcard, { width: cardW }]} onPress={() => open(p)}>
                  <Glow width={130} color="#FAEDE6" opacity={0.9} style={{ position: 'absolute', left: 14, top: 11 }} />
                  <Image source={p.image} style={styles.pcardPack} resizeMode="contain" />
                  <View style={{ marginTop: 6, gap: 2 }}>
                    <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{p.name}</Text>
                    <Text style={[t.cap12, { color: c.textSecondary }]} numberOfLines={2}>
                      {p.short}
                    </Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={[t.cap12Medium, { color: p.accent }]}>{p.pack}</Text>
                  </View>
                </Pressable>
              ))}
              {job === 'all' && !query ? (
                <Pressable style={[styles.compareCard, { width: cardW }]} onPress={() => nav.navigate('ProductCompare')}>
                  <Image source={PRODUCTS[0].image} style={[styles.cmpPack, { left: 22, top: 18, transform: [{ rotate: '-10deg' }] }]} resizeMode="contain" />
                  <Image source={PRODUCTS[2].image} style={[styles.cmpPack, { left: 76, top: 36, transform: [{ rotate: '10deg' }] }]} resizeMode="contain" />
                  <Image source={PRODUCTS[1].image} style={[styles.cmpPack, { left: 46, top: 18, height: 108, width: 66 }]} resizeMode="contain" />
                  <View style={{ flex: 1 }} />
                  <Text style={[t.body15Semibold, { color: '#fff' }]}>Which one should I use?</Text>
                  <View style={styles.go}>
                    <Text style={[t.cap12Medium, { color: '#fff' }]}>Compare</Text>
                    <ArrowRight size={14} color="#fff" strokeWidth={2} />
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {grouts.length ? (
          <View style={{ paddingHorizontal: 16, marginTop: 28, gap: 12 }}>
            <Text style={[t.title18, { color: c.textPrimary }]}>Grout & waterproofing</Text>
            {grouts.map((p) => (
              <Pressable key={p.id} style={styles.prow} onPress={() => open(p)}>
                <Glow width={120} color="#FAEDE6" opacity={0.9} style={{ position: 'absolute', left: -1, top: 1 }} />
                <View style={{ width: 107, alignItems: 'center' }}>
                  <Image source={p.image} style={{ width: 79, height: 104 }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[t.cap12Semibold, { color: p.accent, letterSpacing: 2.16 }]}>{p.kind}</Text>
                  <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{p.name}</Text>
                  <Text style={[t.cap12, { color: c.textSecondary }]} numberOfLines={1}>
                    {p.short}
                  </Text>
                  <View style={[styles.tag, { position: 'relative', left: 0, top: 0, marginTop: 6 }]}>
                    <Text style={[t.cap12Medium, { color: p.accent }]}>{p.pack}</Text>
                  </View>
                </View>
                <View style={styles.chev}>
                  <ChevronRight size={18} color={c.primary700} strokeWidth={2} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {list.length === 0 ? (
          <Text style={[t.sec13, { color: c.textSecondary, textAlign: 'center', marginTop: 40 }]}>No products match.</Text>
        ) : null}

        <View style={styles.tdsStrip}>
          <Image source={d3.bookmarkTabs} style={{ width: 48, height: 48 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[t.body15Semibold, { color: '#fff' }]}>Need the data sheet (TDS)?</Text>
            <Text style={[t.cap12, { color: '#fff' }]}>Open any product → Download PDF</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// C1-02 Product detail (17:13103)
export function ProductDetailScreen({ navigation, route }: V3ScreenProps<'ProductDetail'>) {
  const insets = useSafeAreaInsets();
  const p = productById(route.params.productId);
  const others = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).map((x) => x.code);

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#faede5', '#fff8f5']} style={styles.hero}>
          <Text style={styles.watermark} numberOfLines={1}>
            {p.code}
          </Text>
          <Glow width={300} color="#ffffff" opacity={0.9} style={{ position: 'absolute', left: '50%', marginLeft: -150, top: 80 }} />
          <Image source={p.image} style={styles.heroPack} resizeMode="contain" />
          <HeroTag text={p.heroTags[0]} style={{ left: 16, top: 138 }} />
          <HeroTag text={p.heroTags[1]} style={{ right: 16, top: 206 }} />
          <HeroTag text={p.heroTags[2]} style={{ left: 16, top: 300 }} />
        </LinearGradient>
        <Pressable style={[styles.heroBack, { top: insets.top + 8 }]} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <ArrowLeft size={22} color={c.textPrimary} strokeWidth={2} />
        </Pressable>

        <View style={styles.body}>
          <View style={{ gap: 6 }}>
            <Text style={[t.cap12Semibold, { color: p.accent, letterSpacing: 2.16 }]}>
              {p.kind} · {p.pack.toUpperCase()}
            </Text>
            <Text style={styles.pname} adjustsFontSizeToFit numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={[t.body15, { color: c.textSecondary }]}>{p.intro}</Text>
            <View style={styles.stds}>
              {p.standards.map((s) => (
                <View key={s} style={styles.std}>
                  <Text style={[t.cap12Medium, { color: c.textPrimary }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {p.facts.map((f) => (
              <View key={f.label} style={styles.fact}>
                <Text style={[t.cap12, { color: c.textSecondary }]}>{f.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                  <Text style={[t.title18, { color: c.textPrimary }]}>{f.value}</Text>
                  {f.unit ? <Text style={[t.cap12Medium, { color: c.textSecondary }]}>{f.unit}</Text> : null}
                </View>
              </View>
            ))}
          </View>

          <View style={{ gap: 12 }}>
            <Text style={[t.title18, { color: c.textPrimary }]}>Where to use</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {p.uses.map((u) => (
                <View key={u.label} style={styles.use}>
                  <JobGlyph job={u.job} size={28} />
                  <Text style={[t.cap12Medium, { color: c.textPrimary }]}>{u.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={[t.title18, { color: c.textPrimary }]}>Why masons like it</Text>
            {p.why.map((w) => (
              <View key={w} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.ck}>
                  <Check size={14} color={c.successText} strokeWidth={2.5} />
                </View>
                <Text style={[t.body15, { color: c.textPrimary, flex: 1 }]}>{w}</Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 12 }}>
            <Text style={[t.title18, { color: c.textPrimary }]}>How to apply</Text>
            <View style={styles.steps}>
              {p.steps.map((s, i) => (
                <View key={s.title} style={[styles.step, i > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}>
                  <View style={styles.n}>
                    <Text style={[t.body15Semibold, { color: '#fff' }]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{s.title}</Text>
                    <Text style={[t.cap12, { color: c.textSecondary }]}>{s.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {p.tds ? (
            <Pressable style={styles.tdsRow} onPress={() => navigation.navigate('TdsViewer', { productId: p.id })}>
              <View style={styles.tdsIcon}>
                <FileText size={20} color={c.primary700} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[t.body15Semibold, { color: c.textPrimary }]}>Technical data sheet</Text>
                <Text style={[t.cap12, { color: c.textSecondary }]}>
                  PDF · {p.tds.size} · updated {p.tds.updated}
                </Text>
              </View>
              <Download size={20} color={c.textPrimary} strokeWidth={1.75} />
            </Pressable>
          ) : null}

          {p.compare ? (
            <Pressable style={styles.cmpLink} onPress={() => navigation.navigate('ProductCompare')}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[t.body15Semibold, { color: c.textPrimary }]}>Compare with {others.join(' and ')}</Text>
                <Text style={[t.cap12, { color: c.textSecondary }]}>See which adhesive fits your job</Text>
              </View>
              <ChevronRight size={20} color={c.primary700} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
      {p.tds ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Pressable style={styles.shareBtn} onPress={() => shareTds(p)} accessibilityLabel="Share">
            <Share2 size={22} color={c.textPrimary} strokeWidth={1.75} />
          </Pressable>
          <Button label="Download data sheet (PDF)" style={{ flex: 1 }} onPress={() => navigation.navigate('TdsViewer', { productId: p.id })} />
        </View>
      ) : null}
    </View>
  );
}

function HeroTag({ text, style }: { text: string; style: object }) {
  return (
    <View style={[styles.heroTag, style]}>
      <View style={styles.heroDot} />
      <Text style={[t.cap12Medium, { color: c.textPrimary }]}>{text}</Text>
    </View>
  );
}

// C1-03 TDS viewer (17:13239)
export function TdsViewerScreen({ navigation, route }: V3ScreenProps<'TdsViewer'>) {
  const insets = useSafeAreaInsets();
  const p = productById(route.params.productId);
  const tds = p.tds!;
  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 24 }}>
        <CenterBar
          title="Data sheet"
          right={
            <Pressable onPress={() => shareTds(p)} hitSlop={8} accessibilityLabel="Share">
              <Share2 size={20} color={c.textPrimary} strokeWidth={1.75} />
            </Pressable>
          }
        />
        <View style={{ gap: 14, paddingTop: 8 }}>
          <Text style={[t.title18, { color: c.textPrimary }]}>{p.name} · Technical data sheet</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={styles.meta}>
              <FileText size={14} color={c.textSecondary} strokeWidth={2} />
              <Text style={[t.cap12Medium, { color: c.textSecondary }]}>PDF · {tds.size}</Text>
            </View>
            <View style={styles.meta}>
              <Clock size={14} color={c.textSecondary} strokeWidth={2} />
              <Text style={[t.cap12Medium, { color: c.textSecondary }]}>Updated {tds.updated}</Text>
            </View>
          </View>
          <View style={styles.pdf}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={img.logoFullNavy} style={{ width: 70, height: 15 }} resizeMode="contain" />
              <View style={{ flex: 1 }} />
              <Text style={[t.cap12Medium, { color: c.textMuted }]}>TDS · {p.code}</Text>
            </View>
            <View style={{ height: 3, backgroundColor: c.primary700 }} />
            <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>{tds.title}</Text>
            {tds.rows.map(([k, v]) => (
              <View key={k}>
                <View style={styles.pdfRow}>
                  <Text style={[t.cap12, { color: c.textSecondary, flex: 1 }]}>{k}</Text>
                  <Text style={[t.cap12Medium, { color: c.textPrimary }]}>{v}</Text>
                </View>
                <View style={{ height: 1, backgroundColor: c.border }} />
              </View>
            ))}
            {[280, 250, 265, 180].map((w, i) => (
              <View key={i} style={[styles.line, { width: `${(w / 280) * 100}%` }]} />
            ))}
          </View>
          <Text style={[t.cap12, { color: c.textMuted, textAlign: 'center' }]}>Page 1 of 2 · pinch to zoom</Text>
        </View>
      </ScrollView>
      <View style={[styles.footerB, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button label="Download PDF" icon={Download} onPress={() => downloadTds(p)} />
        <Button label="Send on WhatsApp" variant="whatsapp" icon={MessageCircle} onPress={() => shareTds(p)} />
      </View>
    </View>
  );
}

// C1-04 Product compare (17:13292)
export function ProductCompareScreen({ navigation }: V3ScreenProps<'ProductCompare'>) {
  const insets = useSafeAreaInsets();
  const items = PRODUCTS.filter((p) => p.compare);
  const rows: { label: string; key: keyof NonNullable<Product['compare']> }[] = [
    { label: 'BEST FOR', key: 'bestFor' },
    { label: 'WHERE', key: 'where' },
    { label: 'STANDARD', key: 'standard' },
    { label: 'FLEXIBLE', key: 'flexible' },
    { label: 'SET TIME', key: 'setTime' },
    { label: '1 BAG COVERS', key: 'covers' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.surfaceCard }} contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}>
      <TopBar title="Compare adhesives" style={{ marginHorizontal: -16, paddingHorizontal: 20 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {items.map((p) => (
          <Pressable key={p.id} style={styles.head3} onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}>
            <Image source={p.image} style={{ width: 64, height: 104 }} resizeMode="contain" />
            <Text style={[t.sec13Semibold, { color: c.textPrimary, textAlign: 'center' }]} numberOfLines={1} adjustsFontSizeToFit>
              {p.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.table}>
        {rows.map((r, i) => (
          <View key={r.key} style={[styles.trow, i > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}>
            <Text style={[t.cap12Semibold, { color: c.textSecondary, letterSpacing: 2.16 }]}>{r.label}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {items.map((p) => {
                const v = p.compare![r.key];
                return (
                  <Text key={p.id} style={[t.sec13Semibold, { flex: 1, color: v === 'Yes' ? c.successText : c.textPrimary }]}>
                    {v}
                  </Text>
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.rule}>
        <Text style={[t.cap12Semibold, { color: '#fff', letterSpacing: 2.16 }]}>Easy rule</Text>
        {[
          ['Ceramic tiles inside', 'Pure Tile P10'],
          ['Vitrified or porcelain', 'Pure Set P40'],
          ['Big tiles, terrace, outside wall', 'Pure Set IS100'],
        ].map(([a, b]) => (
          <View key={a} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[t.sec13, { color: '#fff', flex: 1 }]}>{a}</Text>
            <ArrowRight size={14} color={c.primary500} strokeWidth={2} />
            <Text style={[t.sec13Semibold, { color: '#fff' }]}>{b}</Text>
          </View>
        ))}
      </View>
      <Pressable style={[styles.tdsRow, { marginHorizontal: 4 }]} onPress={() => navigation.navigate('TdsViewer', { productId: items[0].id })}>
        <View style={[styles.tdsIcon, { backgroundColor: c.primary50, borderRadius: 12 }]}>
          <FileText size={20} color={c.primary700} strokeWidth={1.75} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[t.body15Semibold, { color: c.textPrimary }]}>Data sheets of all 3</Text>
          <Text style={[t.cap12, { color: c.textSecondary }]}>3 PDFs · download one by one</Text>
        </View>
        <Download size={20} color={c.textPrimary} strokeWidth={1.75} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, minHeight: 58 },
  h1: { fontFamily: 'Inter_600SemiBold', fontSize: 28, lineHeight: 34, letterSpacing: -0.56, color: c.textPrimary },
  searchBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: c.primary500, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  searchInput: { flex: 1, ...t.body15, color: c.textPrimary, paddingVertical: 0, outlineStyle: 'none' } as object,
  jobs: { gap: 8, paddingHorizontal: 16, marginTop: 16 },
  job: { height: 48, borderRadius: 24, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  jobOff: { backgroundColor: c.surfaceCard, borderWidth: 1, borderColor: c.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, rowGap: 12 },
  pcard: { height: 252, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard, overflow: 'hidden', paddingHorizontal: 11, paddingTop: 13 },
  pcardPack: { width: 81, height: 130, alignSelf: 'center' },
  tag: { position: 'absolute', left: 11, top: 215, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: c.surfaceMuted },
  compareCard: { height: 252, borderRadius: 20, backgroundColor: c.navy900, overflow: 'hidden', padding: 12, gap: 8 },
  cmpPack: { position: 'absolute', width: 60, height: 96 },
  go: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: c.primary700, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  prow: { height: 124, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  chev: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary50, alignItems: 'center', justifyContent: 'center' },
  tdsStrip: { marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 20, backgroundColor: c.navy900, flexDirection: 'row', alignItems: 'center', gap: 12 },

  hero: { height: 350, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  watermark: { position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontFamily: 'BebasNeue_400Regular', fontSize: 230, lineHeight: 240, letterSpacing: -4, color: 'rgba(255,255,255,0.75)' },
  heroPack: { position: 'absolute', left: '50%', marginLeft: -97, top: 66, width: 194, height: 320 },
  heroBack: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  heroTag: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    shadowColor: '#0a1729',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2a8fa8' },
  body: { paddingHorizontal: 16, paddingTop: 24, gap: 18 },
  pname: { fontFamily: 'Inter_700Bold', fontSize: 52, lineHeight: 56, letterSpacing: -1.04, color: c.textPrimary },
  stds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  std: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: c.border },
  fact: { flex: 1, gap: 4, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  use: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4, borderRadius: 16, backgroundColor: '#ddf1f7' },
  ck: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.success50, alignItems: 'center', justifyContent: 'center' },
  steps: { borderRadius: 20, borderWidth: 1, borderColor: c.border, paddingHorizontal: 16, paddingVertical: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  n: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.navy900, alignItems: 'center', justifyContent: 'center' },
  tdsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  tdsIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.primary100, alignItems: 'center', justifyContent: 'center' },
  cmpLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: c.primary100, backgroundColor: c.primary50 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surfaceCard },
  shareBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },

  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.surfaceMuted },
  pdf: { padding: 20, gap: 10, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  pdfRow: { flexDirection: 'row', paddingVertical: 6 },
  line: { height: 8, borderRadius: 4, backgroundColor: c.surfaceMuted },
  footerB: { gap: 10, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surfaceCard },

  head3: { flex: 1, alignItems: 'center', gap: 6, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 6, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  table: { borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  trow: { padding: 12, gap: 6 },
  rule: { padding: 16, borderRadius: 20, backgroundColor: c.navy900, gap: 10 },
});
