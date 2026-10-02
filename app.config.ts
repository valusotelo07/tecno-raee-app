import type { ConfigContext, ExpoConfig } from 'expo/config';

export default function appConfig({ config }: ConfigContext): ExpoConfig {
  return {
    ...config,
    name: config.name ?? 'tecno-raee-app',
    slug: config.slug ?? 'tecno-raee-app',
    plugins: [
      ...(config.plugins ?? []),
      [
        'expo-camera',
        {
          cameraPermission: 'TecnoRAEE usa la cámara para escanear códigos de entregas.',
          microphonePermission: false,
          recordAudioAndroid: false,
          barcodeScannerEnabled: true,
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'TecnoRAEE permite adjuntar una foto de los dispositivos que vas a entregar.',
          cameraPermission: 'TecnoRAEE usa la cámara para escanear códigos de entregas.',
          microphonePermission: false,
        },
      ],
      [
        'react-native-maps',
        {
          ...(process.env.GOOGLE_MAPS_ANDROID_API_KEY
            ? { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }
            : {}),
        },
      ],
    ],
  };
}
