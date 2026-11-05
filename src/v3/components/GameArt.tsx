import React from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LucideIcon } from 'lucide-react-native';
import { c, t } from '../theme';

// Celebration "rays" behind C2-06 / C2-07: 12 white 5% wedges (14° wide,
// every 30°) fanning out from the card centre.
export function Rays({ cx = 180, cy = 380, width = 360, height = 800 }: { cx?: number; cy?: number; width?: number; height?: number }) {
  const R = 1000;
  const half = (7 * Math.PI) / 180;
  const d = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const p = (x: number) => `${cx + R * Math.cos(x)},${cy + R * Math.sin(x)}`;
    return `M${cx},${cy} L${p(a - half)} L${p(a + half)} Z`;
  }).join(' ');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Svg width={width} height={height}>
        <Path d={d} fill="#fff" fillOpacity={0.05} />
      </Svg>
    </View>
  );
}

// Progress ring (C2-08 "ring" 112 / C2-10 190): faint full track + arc
// from 12 o'clock, butt caps as in the Figma vector.
export function ProgressRing({
  size,
  stroke,
  value,
  color = c.primary500,
  track = 'rgba(255,255,255,0.15)',
  children,
  style,
}: {
  size: number;
  stroke: number;
  value: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${len * v} ${len}`}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
}

// Rounded pill (Figma "pill": 4/10 padding, r999, Caption/Medium 12).
export function Pill({
  label,
  bg,
  ink,
  icon: Icon,
  art,
  style,
}: {
  label: string;
  bg: string;
  ink: string;
  icon?: LucideIcon;
  art?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      {Icon ? <Icon size={14} color={ink} strokeWidth={2} /> : null}
      {art ? <Image source={art} style={{ width: 14, height: 14 }} /> : null}
      <Text style={[t.cap12Medium, { color: ink }]}>{label}</Text>
    </View>
  );
}

export function Bar({
  value,
  color,
  track,
  height = 6,
  width,
  style,
}: {
  value: number;
  color: string;
  track: string;
  height?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }, width ? { width } : { alignSelf: 'stretch' }, style]}>
      <View style={{ height, borderRadius: height / 2, backgroundColor: color, width: `${v * 100}%`, minWidth: v > 0 ? height : 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
});
