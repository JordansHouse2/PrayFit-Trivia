import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export function BrandMark({ size = 56, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  const scheme = useColorScheme();
  const source =
    scheme === 'dark'
      ? require('@/assets/brand/prayfit-mark-white.png')
      : require('@/assets/brand/prayfit-mark.png');

  return <Image source={source} style={[{ width: size, height: size }, style]} resizeMode="contain" />;
}
