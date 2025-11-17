import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	BarChart,
	Bar,
} from "recharts";
import { FiAlertTriangle } from "react-icons/fi";

const SUCCESS_COLOR = "#22c55e";
const FAIL_COLOR = "#ef4444";
const LOCATION_COLOR = "#0ea5e9";

export default function OverviewTab({ data }) {
	const summary = data?.summary || {};
	const byDate = data?.byDate || [];
	const byLocation = data?.byLocation || [];
	const byDoor = data?.byDoor || [];
	const topFailedUsers = data?.topFailedUsers || [];

	const pieData = [
		{ name: "Success", value: summary.success || 0 },
		{ name: "Denied", value: summary.failed || 0 },
	];

	// Security Insight Logic
	const insights = [];
	if (summary.failed && summary.totalLogs) {
		const failRate = summary.failed / summary.totalLogs;
		if (failRate > 0.25)
			insights.push(
				"System-wide failure rate exceeds 25% — check access permissions."
			);
	}
	if (topFailedUsers?.[0]?.failed >= 3) {
		const u = topFailedUsers[0];
		insights.push(
			`${u.user_name} (${u.user_id}) has ${u.failed} denied attempts — verify their access.`
		);
	}
	if (byDoor?.[0]?.failed >= 3) {
		const d = byDoor[0];
		insights.push(
			`Door ${d.door_id} shows multiple failures — possible tampering.`
		);
	}
	if (!insights.length)
		insights.push("No active threats detected. System stable.");

	return (
		<div className="space-y-6 export-chart">
			{/* Summary Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{[
					{ label: "Total Logs", value: summary.totalLogs },
					{ label: "Users", value: summary.totalUsers },
					{ label: "Doors", value: summary.totalDoors },
					{
						label: "Denied Rate",
						value: summary.totalLogs
							? `${Math.round((summary.failed / summary.totalLogs) * 100)}%`
							: "0%",
					},
				].map((item, i) => (
					<div key={i} className="bg-white rounded-xl shadow p-4 text-center">
						<p className="text-xs text-gray-500">{item.label}</p>
						<p className="text-2xl font-bold text-gray-800">{item.value}</p>
					</div>
				))}
			</div>

			{/* Pie & Denied Trend */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Pie */}
				<div className="bg-white rounded-xl shadow p-4">
					<h3 className="text-sm font-semibold text-gray-700 mb-2">
						Success vs Denied
					</h3>
					<ResponsiveContainer width="100%" height={240}>
						<PieChart>
							<Pie
								data={pieData}
								dataKey="value"
								innerRadius={40}
								outerRadius={80}
								label
							>
								<Cell fill={SUCCESS_COLOR} />
								<Cell fill={FAIL_COLOR} />
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Denied Trend */}
				<div className="bg-white rounded-xl shadow p-4">
					<h3 className="text-sm font-semibold text-gray-700 mb-2">
						Denied Attempts Trend
					</h3>
					<ResponsiveContainer width="100%" height={240}>
						<LineChart data={byDate}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis allowDecimals={false} />
							<Tooltip />
							<Line
								type="monotone"
								dataKey="failed"
								stroke={FAIL_COLOR}
								strokeWidth={2}
								name="Denied"
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Locations */}
			<div className="bg-white rounded-xl shadow p-4">
				<h3 className="text-sm font-semibold text-gray-700 mb-2">
					Activity by Location
				</h3>
				<ResponsiveContainer width="100%" height={260}>
					<BarChart data={byLocation}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="location" />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Bar dataKey="total" fill={LOCATION_COLOR} />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* 🚨 Security Insight Panel */}
			<div className="bg-red-50 border border-red-200 rounded-xl shadow p-4">
				<div className="flex items-center gap-2 mb-2">
					<FiAlertTriangle className="text-red-500 text-lg" />
					<h3 className="text-sm font-semibold text-red-700">
						Security Insights
					</h3>
				</div>
				<ul className="text-sm text-red-700 list-disc list-inside space-y-1">
					{insights.map((msg, idx) => (
						<li key={idx}>{msg}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
