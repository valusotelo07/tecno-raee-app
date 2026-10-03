import AsyncStorage from '@react-native-async-storage/async-storage';

// Clave persistida: conservarla al renombrar la app para recordar las preferencias existentes.
const ONBOARDING_KEY = 'tecnoraee:onboarding:v1';
export async function getAccessPreferences() {
  const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
  return { onboardingComplete: completed === 'true' };
}
export async function saveOnboardingComplete() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
