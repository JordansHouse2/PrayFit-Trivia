import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'prayfit:onboardingComplete:v1';

export async function getOnboardingComplete(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}
