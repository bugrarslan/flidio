import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import type { TravelItineraryResponse } from "@/services/aiService";

const DATABASE_NAME = "flidio.db";

let databaseInstance: SQLiteDatabase | null = null;
let initializing: Promise<SQLiteDatabase> | null = null;

type TravelRow = {
	id: number;
	title: string;
	departure: string;
	destination: string;
	start_date: string | null;
	end_date: string | null;
	budget: string | null;
	travellers: string | null;
	itinerary: string | null;
	created_at: string;
};

export type StoredItinerary = TravelItineraryResponse | null;

export interface TravelRecord {
	id: number;
	title: string;
	departure: string;
	destination: string;
	startDate: string | null;
	endDate: string | null;
	budget: string | null;
	travellers: string | null;
	itinerary: StoredItinerary;
	createdAt: string;
}

export interface CreateTravelInput {
	title: string;
	departure: string;
	destination: string;
	startDate?: string | null;
	endDate?: string | null;
	budget?: number | string | null;
	travellersCount?: number | string | null;
	itinerary: TravelItineraryResponse;
}

export type UpdateTravelInput = Partial<Omit<CreateTravelInput, "itinerary">> & {
	itinerary?: TravelItineraryResponse | null;
};

const ensureDatabase = async (): Promise<SQLiteDatabase> => {
	if (databaseInstance) {
		return databaseInstance;
	}

	if (!initializing) {
		initializing = (async () => {
			const db = await openDatabaseAsync(DATABASE_NAME);
			await db.execAsync("PRAGMA journal_mode = WAL;");
			await db.execAsync(`
				CREATE TABLE IF NOT EXISTS travels (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					title TEXT NOT NULL,
					departure TEXT NOT NULL,
					destination TEXT NOT NULL,
					start_date TEXT,
					end_date TEXT,
					budget TEXT,
					travellers TEXT,
					itinerary TEXT,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
			`);
			return db;
		})();
	}

		databaseInstance = await initializing;
		initializing = null;
		return databaseInstance;
};

const parseItinerary = (value: string | null): StoredItinerary => {
	if (!value) {
		return null;
	}

	try {
		return JSON.parse(value) as TravelItineraryResponse;
	} catch (error) {
		console.warn("[database] Failed to parse itinerary JSON", error);
		return null;
	}
};

const mapRowToRecord = (row: TravelRow): TravelRecord => ({
	id: row.id,
	title: row.title,
	departure: row.departure,
	destination: row.destination,
	startDate: row.start_date,
	endDate: row.end_date,
	budget: row.budget,
	travellers: row.travellers,
	itinerary: parseItinerary(row.itinerary),
	createdAt: row.created_at,
});

const normalizeNullableString = (value: string | number | null | undefined): string | null => {
	if (value === undefined || value === null) {
		return null;
	}

	if (typeof value === "number") {
		return Number.isFinite(value) ? value.toString() : null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

export const createTravel = async (input: CreateTravelInput): Promise<TravelRecord> => {
	const db = await ensureDatabase();

	const result = await db.runAsync(
		`INSERT INTO travels (title, departure, destination, start_date, end_date, budget, travellers, itinerary)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
		[
			input.title,
			input.departure,
			input.destination,
			normalizeNullableString(input.startDate ?? null),
			normalizeNullableString(input.endDate ?? null),
			normalizeNullableString(input.budget ?? null),
			normalizeNullableString(input.travellersCount ?? null),
			JSON.stringify(input.itinerary),
		]
	);

	const insertedId = result.lastInsertRowId;
	return await getTravelById(insertedId);
};

export const getTravelById = async (id: number): Promise<TravelRecord> => {
	const db = await ensureDatabase();
	const row = await db.getFirstAsync<TravelRow>(
		`SELECT id, title, departure, destination, start_date, end_date, budget, travellers, itinerary, created_at
		 FROM travels
		 WHERE id = ?;`,
		[id]
	);

	if (!row) {
		throw new Error(`Travel with id ${id} not found`);
	}

	return mapRowToRecord(row);
};

export const getAllTravels = async (): Promise<TravelRecord[]> => {
	const db = await ensureDatabase();
	const rows = await db.getAllAsync<TravelRow>(
		`SELECT id, title, departure, destination, start_date, end_date, budget, travellers, itinerary, created_at
		 FROM travels
		 ORDER BY datetime(created_at) DESC;`
	);

	return rows.map(mapRowToRecord);
};

export const updateTravel = async (id: number, updates: UpdateTravelInput): Promise<TravelRecord> => {
	const db = await ensureDatabase();

		const fields: string[] = [];
		const values: (string | number | null)[] = [];

	if (updates.title !== undefined) {
		fields.push("title = ?");
		values.push(updates.title);
	}
	if (updates.departure !== undefined) {
		fields.push("departure = ?");
		values.push(updates.departure);
	}
	if (updates.destination !== undefined) {
		fields.push("destination = ?");
		values.push(updates.destination);
	}
	if (updates.startDate !== undefined) {
		fields.push("start_date = ?");
		values.push(normalizeNullableString(updates.startDate));
	}
	if (updates.endDate !== undefined) {
		fields.push("end_date = ?");
		values.push(normalizeNullableString(updates.endDate));
	}
	if (updates.budget !== undefined) {
		fields.push("budget = ?");
		values.push(normalizeNullableString(updates.budget));
	}
	if (updates.travellersCount !== undefined) {
		fields.push("travellers = ?");
		values.push(normalizeNullableString(updates.travellersCount));
	}
	if (updates.itinerary !== undefined) {
		fields.push("itinerary = ?");
		values.push(updates.itinerary ? JSON.stringify(updates.itinerary) : null);
	}

	if (fields.length === 0) {
		return getTravelById(id);
	}

		values.push(id);

	await db.runAsync(
		`UPDATE travels
		 SET ${fields.join(", ")}
		 WHERE id = ?;`,
		values
	);

	return getTravelById(id);
};

export const deleteTravel = async (id: number): Promise<void> => {
	const db = await ensureDatabase();
	await db.runAsync("DELETE FROM travels WHERE id = ?;", [id]);
};

export const clearTravels = async (): Promise<void> => {
	const db = await ensureDatabase();
	await db.runAsync("DELETE FROM travels;", []);
};

