import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { c } from '../theme';

// Figma "Engage/Spin Wheel" (6:11801…): 8 × 45° segments clockwise from the
// top, white / primary-100 alternating, the 100 segment in primary-700, a
// terracotta gradient rim, navy hub with "SPIN" and a navy pointer on top.
export type WheelSegment = { value: string; unit: string; fill: string; ink: string; unitInk: string };

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { value: '10', unit: 'runs', fill: '#ffffff', ink: c.navy700, unitInk: c.textSecondary },
  { value: '20', unit: 'runs', fill: c.primary100, ink: c.navy700, unitInk: c.textSecondary },
  { value: '5', unit: 'runs', fill: '#ffffff', ink: c.navy700, unitInk: c.textSecondary },
  { value: '50', unit: 'runs', fill: c.primary100, ink: c.navy700, unitInk: c.textSecondary },
  { value: '10', unit: 'runs', fill: '#ffffff', ink: c.navy700, unitInk: c.textSecondary },
  { value: '100', unit: 'runs', fill: c.primary700, ink: '#ffffff', unitInk: '#ffffff' },
  { value: '5', unit: 'runs', fill: '#ffffff', ink: c.navy700, unitInk: c.textSecondary },
  { value: 'Scratch', unit: 'card', fill: c.primary100, ink: c.navy700, unitInk: c.textSecondary },
];

const BASE = 138.889; // segment diameter in the Figma component

function wedge(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`;
}

/**
 * @param size  diameter of the segment disc (rim adds ~5% each side)
 * @param rotation  wheel rotation in degrees (pointer stays fixed on top)
 */
export function SpinWheel({
  size = BASE,
  rotation = 0,
  hideHub,
  segments = WHEEL_SEGMENTS,
}: {
  size?: number;
  rotation?: number;
  hideHub?: boolean;
  segments?: WheelSegment[];
}) {
  const s = size / BASE;
  const rimR = 73.148 * s;
  const pad = 12 * s;
  const W = rimR * 2 + pad * 2;
  const cx = W / 2;
  const cy = W / 2;
  const r = size / 2;
  const step = (Math.PI * 2) / segments.length;

  return (
    <View style={{ width: W, height: W + 6 * s }}>
      <Svg width={W} height={W + 6 * s}>
        <Defs>
          <LinearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#C05336" />
            <Stop offset="1" stopColor="#E07A62" />
          </LinearGradient>
        </Defs>
        {/* soft terracotta drop shadow */}
        <Circle cx={cx} cy={cy + 4.6 * s} r={rimR + 1.5 * s} fill="#C05336" opacity={0.18} />
        <Circle cx={cx} cy={cy} r={rimR} fill="url(#rim)" />
        <G rotation={rotation} origin={`${cx}, ${cy}`}>
          {segments.map((seg, i) => {
            const a0 = -step / 2 + i * step;
            const a1 = a0 + step;
            const mid = (a0 + a1) / 2;
            const deg = (mid * 180) / Math.PI;
            const isScratch = seg.value === 'Scratch';
            const vr = r * 0.72;
            const ur = r * (isScratch ? 0.6 : 0.58);
            const vx = cx + vr * Math.sin(mid);
            const vy = cy - vr * Math.cos(mid);
            const ux = cx + ur * Math.sin(mid);
            const uy = cy - ur * Math.cos(mid);
            return (
              <G key={i}>
                <Path d={wedge(cx, cy, r, a0, a1)} fill={seg.fill} stroke="#ffffff" strokeWidth={1.85 * s} />
                <SvgText
                  x={vx}
                  y={vy}
                  fill={seg.ink}
                  fontSize={(isScratch ? 6.02 : 8.33) * s}
                  fontFamily="Inter_600SemiBold"
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  rotation={deg}
                  origin={`${vx}, ${vy}`}
                >
                  {seg.value}
                </SvgText>
                <SvgText
                  x={ux}
                  y={uy}
                  fill={seg.unitInk}
                  fontSize={5.56 * s}
                  fontFamily="Inter_500Medium"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  rotation={deg}
                  origin={`${ux}, ${uy}`}
                >
                  {seg.unit}
                </SvgText>
              </G>
            );
          })}
        </G>
        {hideHub ? null : (
          <>
            <Circle cx={cx} cy={cy} r={16.667 * s} fill={c.navy900} stroke="#ffffff" strokeWidth={1.85 * s} />
            <SvgText
              x={cx}
              y={cy}
              fill="#ffffff"
              fontSize={6.02 * s}
              fontFamily="Inter_600SemiBold"
              fontWeight="600"
              letterSpacing={0.6 * s}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              SPIN
            </SvgText>
          </>
        )}
        {/* pointer — navy triangle pointing down onto the rim */}
        <Path
          d={`M${cx - 5.6 * s},${cy - rimR - 2 * s} L${cx + 5.6 * s},${cy - rimR - 2 * s} L${cx},${cy - rimR + 6.4 * s} Z`}
          fill={c.navy900}
          stroke="#ffffff"
          strokeWidth={1.39 * s}
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// The small "wheel-illustration" used on the "Spin & scratch" tile.
export function MiniWheel({ size = 66 }: { size?: number }) {
  const k = size / 66.176;
  return (
    <Svg width={79.6 * k} height={79.6 * k} viewBox="0 0 79.6351 79.6352">
      <Circle cx="39.8176" cy="39.8" r="33.0878" fill="#C05336" opacity={0.18} />
      <Circle cx="39.8176" cy="36.4527" r="33.0878" fill="#C05336" />
      <Path d="M70.1012 36.4525C70.1012 41.7684 68.7019 46.9907 66.0439 51.5944C63.386 56.1981 59.563 60.021 54.9593 62.679L39.8174 36.4525H70.1012Z" fill="white" />
      <Path d="M54.9593 62.679C50.3556 65.337 45.1333 66.7363 39.8174 66.7363C34.5015 66.7363 29.2792 65.337 24.6755 62.679L39.8174 36.4525L54.9593 62.679Z" fill="#F6C344" />
      <Path d="M24.6755 62.679C20.0718 60.021 16.2488 56.1981 13.5908 51.5944C10.9329 46.9906 9.53359 41.7684 9.53359 36.4525L39.8174 36.4525L24.6755 62.679Z" fill="white" />
      <Path d="M9.53359 36.4525C9.53359 31.1366 10.9329 25.9143 13.5908 21.3106C16.2488 16.7069 20.0718 12.8839 24.6755 10.2259L39.8174 36.4525L9.53359 36.4525Z" fill="#E8805F" />
      <Path d="M24.6755 10.2259C29.2792 7.56798 34.5015 6.16868 39.8174 6.16868C45.1333 6.16868 50.3556 7.56798 54.9593 10.2259L39.8174 36.4525L24.6755 10.2259Z" fill="white" />
      <Path d="M54.9593 10.2259C59.563 12.8839 63.386 16.7069 66.0439 21.3106C68.7019 25.9143 70.1012 31.1366 70.1012 36.4525L39.8174 36.4525L54.9593 10.2259Z" fill="#F6C344" />
      <Circle cx="39.8179" cy="36.453" r="8.60284" fill="#0A1628" />
      <Path d="M39.8177 8.97318L36.418 3.92588L43.2175 3.92588L39.8177 8.97318Z" fill="#0A1628" />
    </Svg>
  );
}
