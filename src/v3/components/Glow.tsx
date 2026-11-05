import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

// Figma "soft-glow" / "floor-shadow" layers are blurred ellipses; rendered
// here as radial gradients (blur filters aren't reliable on native).
export function Glow({
  width,
  height = width,
  color = '#C05336',
  opacity = 0.2,
  style,
}: {
  width: number;
  height?: number;
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const id = `g${color.replace('#', '')}${Math.round(opacity * 100)}${width}x${height}`;
  return (
    <View pointerEvents="none" style={[{ width, height }, style]}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.75} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
