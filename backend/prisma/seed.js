import prisma from "../src/config/database.js";
import {
  seedFields,
  seedSensors,
  seedMerchants,
  seedCropDemand,
  seedPolls,
  seedDatasetMetadata,
} from "./seed-data.js";

const upsertDatasetMetadata = async () => {
  await Promise.all(
    seedDatasetMetadata.map((entry) =>
      prisma.datasetMetadata.upsert({
        where: { key: entry.key },
        update: {
          version: entry.version,
          lastUpdated: new Date(entry.lastUpdated),
          source: entry.source,
          notes: entry.notes ?? null,
        },
        create: {
          key: entry.key,
          version: entry.version,
          lastUpdated: new Date(entry.lastUpdated),
          source: entry.source,
          notes: entry.notes ?? null,
        },
      })
    )
  );
};

const seedFieldData = async () => {
  for (const field of seedFields) {
    await prisma.field.upsert({
      where: { id: field.id },
      update: {
        name: field.name,
        area: field.area,
        crop: field.crop,
        health: field.health,
        lastUpdated: new Date(field.lastUpdated),
        coordinates: field.coordinates,
      },
      create: {
        id: field.id,
        name: field.name,
        area: field.area,
        crop: field.crop,
        health: field.health,
        lastUpdated: new Date(field.lastUpdated),
        coordinates: field.coordinates,
      },
    });
  }
};

const seedSensorData = async () => {
  for (const sensor of seedSensors) {
    await prisma.sensor.upsert({
      where: { id: sensor.id },
      update: {
        name: sensor.name,
        type: sensor.type,
        location: sensor.location,
        status: sensor.status,
        battery: sensor.battery,
        lastReading: sensor.lastReading ? new Date(sensor.lastReading) : null,
        value: sensor.value,
        unit: sensor.unit,
        optimal: sensor.optimal,
        coordinates: sensor.coordinates,
        fieldId: sensor.fieldId,
      },
      create: {
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        location: sensor.location,
        status: sensor.status,
        battery: sensor.battery,
        lastReading: sensor.lastReading ? new Date(sensor.lastReading) : null,
        value: sensor.value,
        unit: sensor.unit,
        optimal: sensor.optimal,
        coordinates: sensor.coordinates,
        fieldId: sensor.fieldId,
      },
    });
  }
};

const seedMarketData = async () => {
  for (const merchant of seedMerchants) {
    await prisma.merchant.upsert({
      where: { id: merchant.id },
      update: {
        name: merchant.name,
        company: merchant.company,
        location: merchant.location,
        distance: merchant.distance,
        rating: merchant.rating,
        phone: merchant.phone,
        specialties: merchant.specialties,
        crops: merchant.crops,
        verified: merchant.verified,
      },
      create: {
        id: merchant.id,
        name: merchant.name,
        company: merchant.company,
        location: merchant.location,
        distance: merchant.distance,
        rating: merchant.rating,
        phone: merchant.phone,
        specialties: merchant.specialties,
        crops: merchant.crops,
        verified: merchant.verified,
      },
    });
  }

  for (const demand of seedCropDemand) {
    await prisma.cropDemand.upsert({
      where: { id: demand.id },
      update: {
        crop: demand.crop,
        avgPrice: demand.avgPrice,
        merchants: demand.merchants,
        trend: demand.trend,
        recommendation: demand.recommendation,
        lastUpdated: new Date(demand.lastUpdated),
      },
      create: {
        id: demand.id,
        crop: demand.crop,
        avgPrice: demand.avgPrice,
        merchants: demand.merchants,
        trend: demand.trend,
        recommendation: demand.recommendation,
        lastUpdated: new Date(demand.lastUpdated),
      },
    });
  }
};

const seedPollData = async () => {
  for (const poll of seedPolls) {
    await prisma.poll.upsert({
      where: { id: poll.id },
      update: {
        title: poll.title,
        description: poll.description,
        category: poll.category,
        status: poll.status,
        creator: poll.creator,
        region: poll.region,
        createdAt: new Date(poll.createdAt),
        endDate: poll.endDate ? new Date(poll.endDate) : null,
      },
      create: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        category: poll.category,
        status: poll.status,
        creator: poll.creator,
        region: poll.region,
        createdAt: new Date(poll.createdAt),
        endDate: poll.endDate ? new Date(poll.endDate) : null,
      },
    });

    for (const option of poll.options) {
      await prisma.pollOption.upsert({
        where: { id: option.id },
        update: {
          text: option.text,
          votes: option.votes,
          pollId: poll.id,
        },
        create: {
          id: option.id,
          text: option.text,
          votes: option.votes,
          pollId: poll.id,
        },
      });
    }
  }
};

const main = async () => {
  await upsertDatasetMetadata();
  await seedFieldData();
  await seedSensorData();
  await seedMarketData();
  await seedPollData();
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
