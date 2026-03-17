/**
 * MongoDB ObjectId conversion utilities
 */

/**
 * ObjectId 组成部分
 */
export interface ObjectIdParts {
	timestamp: string; // 8位十六进制时间戳
	machineId: string; // 6位十六进制机器ID
	processId: string; // 4位十六进制进程ID
	counter: string; // 6位十六进制计数器
	date: Date;
}

/**
 * ObjectId 验证结果
 */
export interface ValidationResult {
	objectId: string;
	isValid: boolean;
	error?: string;
}

/**
 * 验证 ObjectId 格式是否有效
 * @param objectId - 24-character hexadecimal ObjectId string
 * @returns true if valid, false otherwise
 */
export function isValidObjectId(objectId: string): boolean {
	if (!objectId || objectId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(objectId)) {
		return false;
	}
	return true;
}

/**
 * 解析 ObjectId 的各个组成部分
 * @param objectId - 24-character hexadecimal ObjectId string
 * @returns ObjectIdParts if valid, null otherwise
 */
export function parseObjectId(objectId: string): ObjectIdParts | null {
	if (!isValidObjectId(objectId)) {
		return null;
	}

	try {
		const timestamp = objectId.substring(0, 8);
		const machineId = objectId.substring(8, 14);
		const processId = objectId.substring(14, 18);
		const counter = objectId.substring(18, 24);

		const unixTimestamp = parseInt(timestamp, 16);
		const date = new Date(unixTimestamp * 1000);

		return {
			timestamp,
			machineId,
			processId,
			counter,
			date,
		};
	} catch (error) {
		console.error('Error parsing ObjectId:', error);
		return null;
	}
}

/**
 * 批量验证多个 ObjectId
 * @param objectIds - Array of ObjectId strings
 * @returns Array of validation results
 */
export function validateObjectIds(objectIds: string[]): ValidationResult[] {
	return objectIds.map((objectId) => {
		const trimmed = objectId.trim();
		if (!trimmed) {
			return {
				objectId: trimmed,
				isValid: false,
				error: 'Empty string',
			};
		}

		if (trimmed.length !== 24) {
			return {
				objectId: trimmed,
				isValid: false,
				error: `Invalid length: ${trimmed.length} (expected 24)`,
			};
		}

		if (!/^[a-fA-F0-9]{24}$/.test(trimmed)) {
			return {
				objectId: trimmed,
				isValid: false,
				error: 'Invalid hex characters',
			};
		}

		return {
			objectId: trimmed,
			isValid: true,
		};
	});
}

/**
 * 格式化 ObjectId 为 Mongo Shell 格式
 * @param objectId - 24-character hexadecimal ObjectId string
 * @returns Mongo Shell format string
 */
export function formatForMongoShell(objectId: string): string {
	if (!isValidObjectId(objectId)) {
		return '';
	}
	return `ObjectId("${objectId}")`;
}

/**
 * Converts a MongoDB ObjectId string to a Date object
 * @param objectId - 24-character hexadecimal ObjectId string
 * @returns Date object if valid, null otherwise
 */
export function objectIdToDate(objectId: string): Date | null {
	if (!isValidObjectId(objectId)) {
		return null;
	}

	try {
		const hexTimestamp = objectId.substring(0, 8);
		const unixTimestamp = parseInt(hexTimestamp, 16);
		return new Date(unixTimestamp * 1000);
	} catch (error) {
		console.error('Error converting ObjectId to Date:', error);
		return null;
	}
}

/**
 * Converts a Date object to a MongoDB ObjectId string
 * @param date - Date object to convert
 * @returns 24-character hexadecimal ObjectId string
 */
export function dateToObjectId(date: Date): string {
	if (!(date instanceof Date) || isNaN(date.getTime())) {
		throw new Error('Invalid date provided');
	}

	const unixTimestamp = Math.floor(date.getTime() / 1000);
	const hexTimestamp = unixTimestamp.toString(16).padStart(8, '0');
	const padding = '0000000000000000';

	return hexTimestamp + padding;
}

/**
 * Converts a MongoDB ObjectId string to an ISO timestamp string
 * @param objectId - 24-character hexadecimal ObjectId string
 * @returns ISO timestamp string if valid, empty string otherwise
 */
export function objectIdToTimestamp(objectId: string): string {
	const date = objectIdToDate(objectId);
	return date ? date.toISOString() : '';
}

/**
 * Creates a MongoDB ObjectId from individual date/time components
 * @param year - Full year (e.g., 2023)
 * @param month - Month (1-12)
 * @param day - Day of month (1-31)
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Seconds (0-59)
 * @returns ObjectId string and ISO timestamp
 */
export function createObjectIdFromDate(
	year: number,
	month: number,
	day: number,
	hours: number,
	minutes: number,
	seconds: number,
): { objectId: string; timestamp: string } {
	const date = new Date(year, month - 1, day, hours, minutes, seconds);

	if (isNaN(date.getTime())) {
		throw new Error('Invalid date components provided');
	}

	const objectId = dateToObjectId(date);
	const timestamp = date.toISOString();

	return { objectId, timestamp };
}

/**
 * 获取 Unix 时间戳
 * @param date - Date 对象
 * @param unit - 时间单位 ('s' 秒, 'ms' 毫秒)
 * @returns Unix 时间戳
 */
export function getUnixTimestamp(date: Date, unit: 's' | 'ms' = 's'): number {
	if (unit === 'ms') {
		return date.getTime();
	}
	return Math.floor(date.getTime() / 1000);
}
