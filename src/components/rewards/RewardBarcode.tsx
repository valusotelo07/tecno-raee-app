import JsBarcode from 'jsbarcode';
import { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
// JsBarcode's object renderer supplies real Code 128 data including checksum and stop.
export function RewardBarcode({ code }: Readonly<{ code: string }>) {
  const bits = useMemo(() => {
    const encoded: { encodings?: { data: string }[] } = {};
    JsBarcode(encoded, code, { format: 'CODE128', displayValue: false });
    return encoded.encodings?.map((e) => e.data).join('') ?? '';
  }, [code]);
  return (
    <Svg
      accessibilityLabel="Código de barras para validar el premio"
      width="100%"
      height={92}
      viewBox={`0 0 ${bits.length + 40} 92`}
      preserveAspectRatio="none"
    >
      <Rect width={bits.length + 40} height={92} fill="#fff" />
      {Array.from(bits).map((bit, i) =>
        bit === '1' ? <Rect key={i} x={i + 20} y={4} width={1} height={84} fill="#111" /> : null
      )}
    </Svg>
  );
}
