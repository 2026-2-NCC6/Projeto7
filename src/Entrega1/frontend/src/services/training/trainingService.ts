import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from '../api/endpoints';
import { ApiError, get } from '../api/httpClient';
import type { Cached, CatalogTraining, TrainingAudience, TrainingDetail } from './types';

const LIST_KEY = 'smash.trainings.list';
const DETAIL_KEY = (id: string) => `smash.trainings.detail.${id}`;

async function remember<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data)).catch(() => undefined);
}

async function recall<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key).catch(() => null);
  return raw ? (JSON.parse(raw) as T) : null;
}

async function withCache<T>(key: string, load: () => Promise<T>): Promise<Cached<T>> {
  try {
    const data = await load();
    await remember(key, data);
    return { data, fromCache: false };
  } catch (error) {
    const cached = error instanceof ApiError && error.status === 0 ? await recall<T>(key) : null;
    if (cached === null) {
      throw error;
    }
    return { data: cached, fromCache: true };
  }
}

export function forAudience(trainings: CatalogTraining[], audience: TrainingAudience): CatalogTraining[] {
  return audience === 'all'
    ? trainings
    : trainings.filter((training) => training.audience === audience || training.audience === 'all');
}

export const trainingService = {
  catalog(): Promise<Cached<CatalogTraining[]>> {
    return withCache(LIST_KEY, () => get<CatalogTraining[]>(endpoints.trainings, null));
  },

  detail(id: string): Promise<Cached<TrainingDetail>> {
    return withCache(DETAIL_KEY(id), () => get<TrainingDetail>(endpoints.training(id), null));
  },
};
