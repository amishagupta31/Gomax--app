import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type IconProps = { size?: number; color: string };

const STROKE = 1.8;

export function GridIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE}>
      <Rect x={3.5} y={3.5} width={7} height={7} rx={1.5} />
      <Rect x={13.5} y={3.5} width={7} height={7} rx={1.5} />
      <Rect x={3.5} y={13.5} width={7} height={7} rx={1.5} />
      <Rect x={13.5} y={13.5} width={7} height={7} rx={1.5} />
    </Svg>
  );
}

export function FloorIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE} strokeLinejoin="round">
      <Path d="M7 5h10l4.5 14h-19z" />
      <Line x1={4.6} y1={12.5} x2={19.4} y2={12.5} />
      <Line x1={12} y1={5} x2={12} y2={19} />
    </Svg>
  );
}

export function WallIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE}>
      <Rect x={3} y={4.5} width={18} height={15} rx={1.5} />
      <Line x1={3} y1={9.5} x2={21} y2={9.5} />
      <Line x1={3} y1={14.5} x2={21} y2={14.5} />
      <Line x1={9} y1={4.5} x2={9} y2={9.5} />
      <Line x1={15} y1={9.5} x2={15} y2={14.5} />
      <Line x1={9} y1={14.5} x2={9} y2={19.5} />
    </Svg>
  );
}

export function TruckIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE} strokeLinejoin="round">
      <Path d="M2.5 6.5h11v9h-11z" />
      <Path d="M13.5 9.5h4l3 3v3h-7" />
      <Circle cx={6.5} cy={17} r={1.8} />
      <Circle cx={16.5} cy={17} r={1.8} />
    </Svg>
  );
}

export function BigTileIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE}>
      <Rect x={3.5} y={3.5} width={17} height={17} rx={2} />
      <Line x1={3.5} y1={12} x2={20.5} y2={12} />
    </Svg>
  );
}
