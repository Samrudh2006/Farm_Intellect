import prisma from "../config/database.js";

const fallbackMetadata = (key) => ({
  key,
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  source: "runtime",
});

export const getDatasetMetadata = async (key) => {
  const metadata = await prisma.datasetMetadata.findUnique({ where: { key } });
  if (!metadata) {
    return fallbackMetadata(key);
  }

  return {
    key: metadata.key,
    version: metadata.version,
    lastUpdated: metadata.lastUpdated.toISOString(),
    source: metadata.source || "runtime",
    notes: metadata.notes || undefined,
  };
};

export const touchDatasetMetadata = async (key) => {
  await prisma.datasetMetadata.upsert({
    where: { key },
    update: { lastUpdated: new Date() },
    create: {
      key,
      version: "1.0.0",
      lastUpdated: new Date(),
      source: "runtime",
    },
  });
};
