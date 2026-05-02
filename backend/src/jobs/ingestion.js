import cron from 'node-cron';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { touchDatasetMetadata } from '../services/datasets.js';
import { sendNotificationToRole } from '../services/notificationService.js';

const recordIngestion = async ({ datasetKey, status, message, metadata }) => {
  await prisma.ingestionLog.create({
    data: {
      datasetKey,
      status,
      message,
      metadata,
    },
  });
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
};

const ingestMandiPrices = async () => {
  const apiUrl = process.env.MANDI_API_URL;
  if (!apiUrl) {
    await recordIngestion({ datasetKey: 'mandi-prices', status: 'skipped', message: 'MANDI_API_URL not configured' });
    return;
  }

  try {
    const data = await fetchJson(apiUrl, {
      headers: process.env.MANDI_API_KEY ? { Authorization: `Bearer ${process.env.MANDI_API_KEY}` } : undefined,
    });

    const records = Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : [];
    if (records.length === 0) {
      await recordIngestion({ datasetKey: 'mandi-prices', status: 'skipped', message: 'No mandi records received' });
      return;
    }

    const createdAt = new Date();
    for (const record of records) {
      if (!record.crop || !record.market || !record.price) continue;
      await prisma.mandiPrice.create({
        data: {
          crop: record.crop,
          market: record.market,
          price: Number(record.price),
          unit: record.unit || '₹/quintal',
          trend: record.trend || null,
          region: record.region || null,
          recordedAt: record.recordedAt ? new Date(record.recordedAt) : createdAt,
          source: record.source || 'mandi-api',
        },
      });
    }

    await touchDatasetMetadata('mandi-prices');
    await recordIngestion({ datasetKey: 'mandi-prices', status: 'success', metadata: { count: records.length } });
  } catch (error) {
    logger.error('Mandi ingestion failed', error);
    await recordIngestion({ datasetKey: 'mandi-prices', status: 'failed', message: error.message });
    await sendNotificationToRole({
      role: 'ADMIN',
      title: 'Mandi ingestion failed',
      message: `Mandi ingestion error: ${error.message}`,
      type: 'ERROR',
    });
  }
};

const ingestWeatherSnapshots = async () => {
  if (!process.env.OWM_API_KEY) {
    await recordIngestion({ datasetKey: 'weather-snapshots', status: 'skipped', message: 'OWM_API_KEY not configured' });
    return;
  }

  const locations = (process.env.WEATHER_LOCATIONS || 'Ludhiana,IN|Pune,IN').split('|');
  try {
    for (const location of locations) {
      const data = await fetchJson(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.OWM_API_KEY}&units=metric`,
      );
      await prisma.weatherSnapshot.create({
        data: {
          location,
          temperature: data?.main?.temp ?? null,
          humidity: data?.main?.humidity ?? null,
          rainfall: data?.rain?.['1h'] ?? null,
          advisory: data?.weather?.[0]?.description ?? null,
          recordedAt: new Date((data?.dt ?? Date.now() / 1000) * 1000),
          source: 'openweathermap',
          payload: data,
        },
      });

      if (data?.main?.temp >= 40 || (data?.rain?.['1h'] ?? 0) >= 50) {
        await sendNotificationToRole({
          role: 'FARMER',
          title: 'Severe weather alert',
          message: `High risk conditions detected in ${location}. Monitor fields and follow advisory guidance.`,
          type: 'WARNING',
          data: { location },
        });
      }
    }

    await touchDatasetMetadata('weather-snapshots');
    await recordIngestion({ datasetKey: 'weather-snapshots', status: 'success', metadata: { locations } });
  } catch (error) {
    logger.error('Weather ingestion failed', error);
    await recordIngestion({ datasetKey: 'weather-snapshots', status: 'failed', message: error.message });
    await sendNotificationToRole({
      role: 'ADMIN',
      title: 'Weather ingestion failed',
      message: `Weather ingestion error: ${error.message}`,
      type: 'ERROR',
    });
  }
};

export const runIngestionJobs = async () => {
  await ingestWeatherSnapshots();
  await ingestMandiPrices();
};

export const scheduleIngestionJobs = () => {
  if (process.env.ENABLE_SCHEDULED_JOBS !== 'true') return;

  cron.schedule('0 * * * *', () => {
    runIngestionJobs().catch((error) => logger.error('Scheduled ingestion failed', error));
  });
};
