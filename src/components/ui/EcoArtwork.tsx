import { useId } from 'react';
import { Platform } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

const leaf = 'M8 30C2 13 15 4 34 3C35 19 29 30 15 30L29 9C21 15 15 22 8 35Z';
const decorativeAccessibility =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      } as const);

export function LeafMark({
  size = 32,
  color = '#246440',
}: Readonly<{ size?: number; color?: string }>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" {...decorativeAccessibility}>
      <Path d={leaf} fill={color} />
    </Svg>
  );
}

export function PointsCoin({
  size = 80,
  coins = false,
}: Readonly<{ size?: number; coins?: boolean }>) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" {...decorativeAccessibility}>
      <Defs>
        <LinearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#D7EAC8" />
          <Stop offset="1" stopColor="#9CCFA2" />
        </LinearGradient>
        <LinearGradient id={`${id}-coin`} x1="0" y1="0" x2="0.9" y2="1">
          <Stop stopColor="#72AC66" />
          <Stop offset="0.55" stopColor="#34834D" />
          <Stop offset="1" stopColor="#125234" />
        </LinearGradient>
      </Defs>
      <Circle cx="44" cy="44" r="43" fill={`url(#${id}-ring)`} />
      <Circle cx="44" cy="44" r="35.5" fill={`url(#${id}-coin)`} stroke="#88BD86" strokeWidth="2" />
      <Path
        d="M17 52A30 30 0 0 0 63 66"
        fill="none"
        stroke="#C3E5BD"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      {coins ? (
        <G fill="none" stroke="#FFF" strokeWidth="2.4">
          <Ellipse cx="44" cy="34" rx="12" ry="4.5" />
          <Path d="M32 34v15c0 6 24 6 24 0V34M32 39c0 6 24 6 24 0M32 44c0 6 24 6 24 0" />
        </G>
      ) : (
        <G transform="translate(25 25)">
          <Path d={leaf} fill="#FFF" />
        </G>
      )}
    </Svg>
  );
}

export function HomeBotanical() {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={154} height={154} viewBox="0 0 154 154" {...decorativeAccessibility}>
      <Defs>
        <LinearGradient id={`${id}-earth`} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#BDDCC9" />
          <Stop offset="1" stopColor="#438866" />
        </LinearGradient>
        <ClipPath id={`${id}-clip`}>
          <Circle cx="116" cy="79" r="59" />
        </ClipPath>
      </Defs>
      <Ellipse cx="72" cy="76" rx="48" ry="65" fill="#E5F2DF" transform="rotate(21 72 76)" />
      <Circle cx="116" cy="79" r="59" fill={`url(#${id}-earth)`} />
      <G clipPath={`url(#${id}-clip)`} fill="#F1F8EB">
        <Path d="M64 35l17-11 20 5-1 13-12 7 7 9-2 13-12 5-10-12-15-4zM96 76l15 4 10 12-3 15-12 16-5 19-9-14 3-20-11-12zM120 24l16 5 8 13-9 10-13-1-6-10zM140 61l18-8 16 8-4 21-14 3-12-9-9 2-7-10zM143 112l15 2 8 14-20 5-9-10z" />
      </G>
      <G fill="none" stroke="#6AA173" strokeWidth="1.8">
        <Path d="M47 147Q44 100 35 58M48 133Q63 91 79 59" />
      </G>
      <G fill="#B2D798">
        <Ellipse cx="33" cy="70" rx="9" ry="20" transform="rotate(-20 33 70)" />
        <Ellipse cx="52" cy="107" rx="9" ry="21" transform="rotate(35 52 107)" />
        <Ellipse cx="33" cy="119" rx="10" ry="22" transform="rotate(-39 33 119)" />
      </G>
      <Path d="M65 87Q60 66 84 51Q89 70 65 87Z" fill="#C9E4AD" />
      <Circle cx="60" cy="18" r="5" fill="#DDEECD" />
    </Svg>
  );
}

export function ImpactPlant() {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={54} height={64} viewBox="0 0 54 64" {...decorativeAccessibility}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#9ECD64" />
          <Stop offset="1" stopColor="#267344" />
        </LinearGradient>
      </Defs>
      <Path d="M27 59Q25 36 30 15" stroke="#286744" strokeWidth="2" fill="none" />
      <Path
        d="M28 35Q13 22 27 5Q42 18 28 35ZM29 44Q26 23 51 22Q51 43 29 44ZM26 50Q5 49 3 29Q25 30 26 50Z"
        fill={`url(#${id})`}
      />
      <Path d="M27 43L43 29M26 48L11 37M29 30L28 13" stroke="#E4F0D7" strokeWidth="1" fill="none" />
    </Svg>
  );
}

export function SuccessArtwork() {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={188} height={108} viewBox="0 0 188 108" {...decorativeAccessibility}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#74AE66" />
          <Stop offset="1" stopColor="#155735" />
        </LinearGradient>
      </Defs>
      <Circle cx="94" cy="57" r="36" fill={`url(#${id})`} />
      <Path
        d="M79 57l10 10 20 -22"
        fill="none"
        stroke="#FFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M29 46Q9 41 11 26Q31 29 29 46ZM42 88Q25 89 20 70Q39 72 42 88ZM141 43Q143 24 162 24Q164 40 141 43ZM58 20Q47 19 49 8Q60 9 58 20Z"
        fill="#5A9B56"
      />
      <Path
        d="M153 7l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM40 49l1 4 4 1-4 1-1 4-1-4-4-1 4-1z"
        fill="#E4BD41"
      />
    </Svg>
  );
}
