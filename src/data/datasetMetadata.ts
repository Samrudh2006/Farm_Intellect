export interface DatasetMetadata {
  version: string;
  lastUpdated: string;
  source: string;
  notes?: string;
}

export const createDatasetMetadata = (metadata: DatasetMetadata) => metadata;
