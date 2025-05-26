import { db } from "../db";
import { sql } from "drizzle-orm";
import { properties } from "../db/schema/properties.schema";

export const UKRAINE_REGIONS = [
  "Вінницька",
  "Волинська",
  "Дніпропетровська",
  "Донецька",
  "Житомирська",
  "Закарпатська",
  "Запорізька",
  "Івано-Франківська",
  "Київська",
  "Кіровоградська",
  "Луганська",
  "Львівська",
  "Миколаївська",
  "Одеська",
  "Полтавська",
  "Рівненська",
  "Сумська",
  "Тернопільська",
  "Харківська",
  "Херсонська",
  "Хмельницька",
  "Черкаська",
  "Чернівецька",
  "Чернігівська",
];

export const getPropertyCountByRegion = async (
  startDate: Date,
  endDate: Date,
) => {
  const results: { region: string; total: number }[] = [];

  for (const region of UKRAINE_REGIONS) {
    const res = await db.execute(
      sql`
        SELECT COUNT(*)::int AS total
        FROM ${properties}
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        AND address ILIKE '%' || ${region} || '%'
      `
    );

    const total = (res as any).rows?.[0]?.total ?? 0;

    results.push({ region, total });
  }

  return results;
};

export const getPriceStatsByRegion = async (
  startDate: Date,
  endDate: Date,
) => {
  const results: {
    region: string;
    min: number | null;
    max: number | null;
    avg: number | null;
  }[] = [];

  for (const region of UKRAINE_REGIONS) {
    const res = await db.execute(
      sql`
        SELECT 
          MIN(price)::float AS min,
          MAX(price)::float AS max,
          AVG(price)::float AS avg
        FROM ${properties}
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        AND address ILIKE '%' || ${region} || '%'
      `
    );

    const row = (res as any).rows?.[0];

    results.push({
      region,
      min: row?.min ?? null,
      max: row?.max ?? null,
      avg: row?.avg ?? null,
    });
  }

  return results;
};


export const getTopRegions = async (
  startDate: Date,
  endDate: Date,
  limit = 5
) => {
  const counts = [];

  for (const region of UKRAINE_REGIONS) {
    const res = await db.execute(
      sql`
        SELECT COUNT(*)::int AS total
        FROM ${properties}
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        AND address ILIKE '%' || ${region} || '%'
      `
    );

    const total = (res as any).rows?.[0]?.total ?? 0;
    counts.push({ region, total });
  }

  counts.sort((a, b) => b.total - a.total);

  return counts.slice(0, limit);
};


export const getAveragePriceGrowth = async (
  previousStart: Date,
  previousEnd: Date,
  currentStart: Date,
  currentEnd: Date,
) => {
  const results: {
    region: string;
    previousAvg: number | null;
    currentAvg: number | null;
    growthPercent: number | null;
  }[] = [];

  for (const region of UKRAINE_REGIONS) {
    const prevRes = await db.execute(
      sql`
        SELECT AVG(price)::float AS avg_price
        FROM ${properties}
        WHERE created_at BETWEEN ${previousStart} AND ${previousEnd}
        AND address ILIKE '%' || ${region} || '%'
      `
    );
    const previousAvg = (prevRes as any).rows?.[0]?.avg_price ?? null;

    const currRes = await db.execute(
      sql`
        SELECT AVG(price)::float AS avg_price
        FROM ${properties}
        WHERE created_at BETWEEN ${currentStart} AND ${currentEnd}
        AND address ILIKE '%' || ${region} || '%'
      `
    );
    const currentAvg = (currRes as any).rows?.[0]?.avg_price ?? null;

    let growthPercent: number | null = null;
    if (previousAvg !== null && previousAvg !== 0 && currentAvg !== null) {
      growthPercent = ((currentAvg - previousAvg) / previousAvg) * 100;
    }

    results.push({ region, previousAvg, currentAvg, growthPercent });
  }

  return results;
};