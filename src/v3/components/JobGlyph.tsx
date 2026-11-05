import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export type Job = 'all' | 'floor' | 'wall' | 'big' | 'bathroom' | 'roof' | 'joints' | 'outside';

// The C1 "job" glyphs (20×20 viewBox, 1.46 stroke) used on filter pills and
// the "Where to use" tiles.
export function JobGlyph({ job, size = 20, color = '#0A1628' }: { job: Job; size?: number; color?: string }) {
  const p = { stroke: color, strokeWidth: 1.45833, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      {job === 'all' ? (
        <>
          <Rect x="2.5" y="2.5" width="5.83" height="5.83" rx="0.83" {...p} />
          <Rect x="11.67" y="2.5" width="5.83" height="5.83" rx="0.83" {...p} />
          <Rect x="2.5" y="11.67" width="5.83" height="5.83" rx="0.83" {...p} />
          <Rect x="11.67" y="11.67" width="5.83" height="5.83" rx="0.83" {...p} />
        </>
      ) : job === 'floor' ? (
        <>
          <Path d="M1.66667 16.6667L5 6.66667H15L18.3333 16.6667H1.66667Z" {...p} />
          <Path d="M10 6.66667V16.6667" {...p} />
          <Path d="M3.33333 11.6667H16.6667" {...p} />
        </>
      ) : job === 'wall' ? (
        <>
          <Rect x="2.5" y="3.33" width="15" height="13.33" rx="0.83" {...p} />
          <Path d="M2.5 7.75H17.5M2.5 12.1667H17.5M7.5 3.33333V7.75M12.5 7.75V12.1667M7.5 12.1667V16.6667" {...p} />
        </>
      ) : job === 'big' ? (
        <>
          <Rect x="2.5" y="2.5" width="15" height="15" rx="1.25" {...p} />
          <Path d="M2.5 10H17.5" {...p} />
        </>
      ) : job === 'bathroom' ? (
        <Path
          d="M10 18.3333C11.5471 18.3333 13.0308 17.7188 14.1248 16.6248C15.2188 15.5308 15.8333 14.0471 15.8333 12.5C15.8333 10.8333 15 9.25 13.3333 7.91667C11.6667 6.58333 10.4167 4.58333 10 2.5C9.58333 4.58333 8.33333 6.58333 6.66667 7.91667C5 9.25 4.16667 10.8333 4.16667 12.5C4.16667 14.0471 4.78125 15.5308 5.87521 16.6248C6.96917 17.7188 8.4529 18.3333 10 18.3333Z"
          {...p}
        />
      ) : job === 'roof' ? (
        <>
          <Path d="M2.5 9.16667L10 3.33333L17.5 9.16667" {...p} />
          <Path d="M4.16667 8.33333V16.6667H15.8333V8.33333" {...p} />
          <Path d="M10 11.6667C8.75 13.3333 8.75 14.5833 10 14.5833C11.25 14.5833 11.25 13.3333 10 11.6667Z" {...p} />
        </>
      ) : job === 'outside' ? (
        <>
          <Path d="M2.5 9.16667L10 3.33333L17.5 9.16667" {...p} />
          <Path d="M4.16667 8.33333V16.6667H15.8333V8.33333" {...p} />
          <Path d="M8.33 16.67V12.5H11.67V16.67" {...p} />
        </>
      ) : (
        <>
          <Rect x="2.5" y="2.5" width="15" height="15" rx="0.83" {...p} />
          <Path d="M10 2.5V17.5M2.5 10H17.5" {...p} strokeWidth={2.5} />
        </>
      )}
    </Svg>
  );
}
