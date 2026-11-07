import { TrainingNotFoundError } from '../../domain/training/errors';
import { CatalogFilter, TrainingRepository } from '../../domain/training/training-repository.port';
import {
  CatalogTrainingDetail,
  CatalogTrainingView,
  toCatalogDetail,
  toCatalogView,
  VersionView,
} from './training-views';

export class TrainingCatalog {
  constructor(private readonly trainings: TrainingRepository) {}

  async list(filter: CatalogFilter): Promise<CatalogTrainingView[]> {
    const entries = await this.trainings.catalog(filter);
    return entries.map(toCatalogView);
  }

  async detail(id: string, version?: number): Promise<CatalogTrainingDetail> {
    const entry = await this.trainings.publishedVersion(id, version);

    if (!entry) {
      throw new TrainingNotFoundError();
    }

    return toCatalogDetail(entry);
  }

  async versions(id: string): Promise<VersionView[]> {
    const versions = await this.trainings.versionsOf(id);

    if (versions.length === 0) {
      throw new TrainingNotFoundError();
    }

    return versions;
  }
}
