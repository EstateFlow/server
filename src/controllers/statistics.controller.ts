import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as statsService from "../services/statistics.service";
import { getPropertyViewStatsByDate } from '../services/statistics.service';

const parseDate = (date: unknown): Date | null => {
  if (typeof date !== "string") return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
};

export const listingsByRegion = async (req: AuthRequest, res: Response): Promise<void> => {
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);

  if (!startDate || !endDate) {
    res.status(400).json({ message: "Missing or invalid startDate or endDate" });
    return;
  }

  const data = await statsService.getPropertyCountByRegion(startDate, endDate);
  res.json(data);
};

export const priceStatsByRegion = async (req: AuthRequest, res: Response): Promise<void> => {
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);

  if (!startDate || !endDate) {
    res.status(400).json({ message: "Missing or invalid startDate or endDate" });
    return;
  }

  const data = await statsService.getPriceStatsByRegion(startDate, endDate);
  res.json(data);
};

export const topRegions = async (req: AuthRequest, res: Response): Promise<void> => {
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);

  if (!startDate || !endDate) {
    res.status(400).json({ message: "Missing or invalid startDate or endDate" });
    return;
  }

  const data = await statsService.getTopRegions(startDate, endDate);
  res.json(data);
};

export const averagePriceGrowth = async (req: AuthRequest, res: Response): Promise<void> => {
  const previousStart = parseDate(req.query.previousStart);
  const previousEnd = parseDate(req.query.previousEnd);
  const currentStart = parseDate(req.query.currentStart);
  const currentEnd = parseDate(req.query.currentEnd);

  if (!previousStart || !previousEnd || !currentStart || !currentEnd) {
    res.status(400).json({ message: "Missing or invalid required date ranges" });
    return;
  }

  const data = await statsService.getAveragePriceGrowth(
    previousStart,
    previousEnd,
    currentStart,
    currentEnd
  );
  res.json(data);
};

export const getPropertyViewsByDate = async (req: AuthRequest, res: Response) => {
  const { propertyId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({ message: 'Missing startDate or endDate' });
    return;
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ message: 'Invalid date format' });
    return;
  }

  const views = await getPropertyViewStatsByDate(propertyId, start, end);
  res.json({ propertyId, views });
};

export const totalSales = async (req: AuthRequest, res: Response): Promise<void> => {
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);

  if (!startDate || !endDate) {
    res.status(400).json({ message: "Missing or invalid startDate or endDate" });
    return;
  }

  const data = await statsService.getTotalSales(startDate, endDate);
  res.json(data);
};

export const topViewedProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);
  const limit = Number(req.query.limit) || 10;

  if (!startDate || !endDate) {
    res.status(400).json({ message: "Missing or invalid startDate or endDate" });
    return;
  }

  const data = await statsService.getTopViewedProperties(startDate, endDate, limit);
  res.json(data);
};

export const newUsersStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);

  if (!startDate || !endDate) {
    res.status(400).json({ message: "Missing or invalid startDate or endDate" });
    return;
  }

  const data = await statsService.getNewUsersStats(startDate, endDate);
  res.json(data);
};