// utils/analyticsParser.js

export function buildAnalytics(logs) {
	if (!logs || !Array.isArray(logs) || logs.length === 0) {
		return emptyAnalytics();
	}

	const usersMap = {};
	const doorsMap = {};
	const locationsMap = {};
	const dateMap = {};
	const hourMap = {};

	let successCount = 0;
	let failedCount = 0;
	let validLogs = 0;

	for (let log of logs) {
		const { timestamp, user_id, user_name, door_id, door_location, status } =
			log;

		if (!timestamp || !user_id || !door_id) continue;
		validLogs++;

		const dateObj = new Date(timestamp);
		if (isNaN(dateObj)) continue;

		// Convert to IST (5h 30m = 19800000 ms)
		const ist = new Date(dateObj.getTime() + 19800000);
		const dateKey = ist.toISOString().slice(0, 10);
		const hour = ist.getHours();

		const isSuccess = status.toLowerCase() === "success";
		isSuccess ? successCount++ : failedCount++;

		// ---------------- USERS ----------------
		usersMap[user_id] ??= {
			user_id,
			user_name,
			success: 0,
			failed: 0,
			total: 0,
		};
		const u = usersMap[user_id];
		isSuccess ? u.success++ : u.failed++;
		u.total++;

		// ---------------- DOORS ----------------
		doorsMap[door_id] ??= {
			door_id,
			location: door_location,
			success: 0,
			failed: 0,
			total: 0,
		};
		const d = doorsMap[door_id];
		isSuccess ? d.success++ : d.failed++;
		d.total++;

		// ---------------- LOCATIONS ----------------
		locationsMap[door_location] ??= {
			location: door_location,
			success: 0,
			failed: 0,
			total: 0,
		};
		const loc = locationsMap[door_location];
		isSuccess ? loc.success++ : loc.failed++;
		loc.total++;

		// ---------------- DATE ----------------
		dateMap[dateKey] ??= { date: dateKey, success: 0, failed: 0, total: 0 };
		const dd = dateMap[dateKey];
		isSuccess ? dd.success++ : dd.failed++;
		dd.total++;

		// ---------------- HOUR ----------------
		hourMap[hour] ??= { hour, success: 0, failed: 0, total: 0 };
		const hh = hourMap[hour];
		isSuccess ? hh.success++ : hh.failed++;
		hh.total++;
	}

	// Derived arrays
	const byUser = Object.values(usersMap).map((u) => ({
		...u,
		failRate: u.failed / u.total,
	}));

	const byDoor = Object.values(doorsMap).map((d) => ({
		...d,
		failRate: d.failed / d.total,
	}));

	const byLocation = Object.values(locationsMap);

	// Rank insights
	const topFailedUsers = [...byUser]
		.sort((a, b) => b.failed - a.failed)
		.slice(0, 7);

	const topActiveUsers = [...byUser]
		.sort((a, b) => b.total - a.total)
		.slice(0, 7);

	const topFailDoors = [...byDoor]
		.sort((a, b) => b.failed - a.failed)
		.slice(0, 7);

	const topTrafficDoors = [...byDoor]
		.sort((a, b) => b.total - a.total)
		.slice(0, 7);

	// Alerts
	const alerts = [];
	if (failedCount > successCount)
		alerts.push(
			"More denied entries than successful ones — potential intrusion!"
		);

	if (topFailDoors[0]?.failed >= 5)
		alerts.push(
			`Door ${topFailDoors[0].door_id} shows unusually high failures!`
		);

	if (topFailedUsers[0]?.failed >= 5)
		alerts.push(
			`User ${topFailedUsers[0].user_name} shows suspicious patterns.`
		);

	if (!alerts.length) alerts.push("No abnormalities detected ✔");

	return {
		summary: {
			totalLogs: validLogs,
			success: successCount,
			failed: failedCount,
			totalUsers: byUser.length,
			totalDoors: byDoor.length,
		},
		byDate: Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date)),
		byHour: Object.values(hourMap)
			.sort((a, b) => a.hour - b.hour)
			.map((h) => ({
				...h,
				hourLabel: `${String(h.hour).padStart(2, "0")}:00`,
			})),
		byDoor,
		byUser,
		byLocation,
		topFailedUsers,
		topActiveUsers,
		topFailDoors,
		topTrafficDoors,
		alerts,
	};
}

function emptyAnalytics() {
	return {
		summary: {
			totalLogs: 0,
			success: 0,
			failed: 0,
			totalUsers: 0,
			totalDoors: 0,
		},
		byDate: [],
		byHour: [],
		byDoor: [],
		byUser: [],
		byLocation: [],
		topFailedUsers: [],
		topActiveUsers: [],
		topFailDoors: [],
		topTrafficDoors: [],
		alerts: ["No logs available"],
	};
}
