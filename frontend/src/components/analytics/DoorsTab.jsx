import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";
import { FiAlertTriangle, FiBarChart2, FiCheckCircle } from "react-icons/fi";

export default function DoorsTab({ data }) {
	const byDoor = data?.byDoor || [];
	const topFailDoors = data?.topFailDoors || [];
	const topTrafficDoors = data?.topTrafficDoors || [];

	// Thresholds — Capital & Visible
	const HIGH_FAIL_THRESHOLD = 3;
	const HIGH_TRAFFIC_THRESHOLD = 5;
	const FAIL_RATE_THRESHOLD = 0.2;

	const insights = [];

	// High-risk door (frequent denials)
	if (topFailDoors.length && topFailDoors[0].failed > HIGH_FAIL_THRESHOLD) {
		insights.push(
			`Door ${topFailDoors[0].door_id} has ${topFailDoors[0].failed} denied attempts — high intrusion probability!`
		);
	}

	// Busiest door
	if (
		topTrafficDoors.length &&
		topTrafficDoors[0].total > HIGH_TRAFFIC_THRESHOLD
	) {
		insights.push(
			`Door ${topTrafficDoors[0].door_id} is the busiest with ${topTrafficDoors[0].total} accesses — increased monitoring recommended.`
		);
	}

	// System-wide failure pattern
	const totalFails = byDoor.reduce((s, d) => s + (d.failed || 0), 0);
	const totalAttempts = byDoor.reduce((s, d) => s + (d.total || 0), 0);

	if (totalAttempts && totalFails / totalAttempts > FAIL_RATE_THRESHOLD) {
		insights.push(
			`Overall FAILED ACCESS RATE exceeds ${
				FAIL_RATE_THRESHOLD * 100
			}% — verify user authentication and access rules.`
		);
	}

	if (!insights.length) {
		insights.push("No risky door behavior detected — system appears normal.");
	}

	return (
		<div className="space-y-6">
			{/* Security Thresholds Panel */}
			<div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-md p-4 flex gap-3 items-start">
				<div className="text-xs text-gray-700 leading-relaxed space-y-1">
					<p className="flex items-center gap-2">
						<strong className="text-gray-800">High Fail Threshold:</strong>
						<span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-semibold">
							&gt; {HIGH_FAIL_THRESHOLD}
						</span>
						<span className="text-[11px] text-gray-500">Denied Attempts</span>
					</p>

					<p className="flex items-center gap-2">
						<strong className="text-gray-800">High Traffic Threshold:</strong>
						<span className="px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-700 font-semibold">
							&gt; {HIGH_TRAFFIC_THRESHOLD}
						</span>
						<span className="text-[11px] text-gray-500">Total Attempts</span>
					</p>

					<p className="flex items-center gap-2">
						<strong className="text-gray-800">Risk Fail Rate:</strong>
						<span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold">
							&gt; {FAIL_RATE_THRESHOLD * 100}%
						</span>
						<span className="text-[11px] text-gray-500">Overall Denials</span>
					</p>
				</div>
			</div>

			{/* Success vs Denied */}
			<div className="bg-white rounded-xl shadow p-4 export-chart">
				<div className="flex items-center gap-2 mb-2">
					<span className="bg-green-100 text-green-700 p-1.5 rounded-md">
						<FiCheckCircle className="text-base" />
					</span>
					<h3 className="text-sm font-semibold text-gray-700">
						Success vs Denied per Door
					</h3>
				</div>

				<ResponsiveContainer width="100%" height={260}>
					<BarChart data={byDoor}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="door_id" />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Bar dataKey="success" stackId="a" fill="#22c55e" />
						<Bar dataKey="failed" stackId="a" fill="#ef4444" />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Most Denied */}
			<div className="bg-white rounded-xl shadow p-4 export-chart">
				<div className="flex items-center gap-2 mb-2">
					<span className="bg-red-100 text-red-700 p-1.5 rounded-md">
						<FiAlertTriangle className="text-base" />
					</span>
					<h3 className="text-sm font-semibold text-gray-700">
						Most Denied Attempts (High Risk)
					</h3>
				</div>
				<ResponsiveContainer width="100%" height={220}>
					<BarChart
						layout="vertical"
						data={topFailDoors.map((d) => ({
							door_id: d.door_id,
							failed: d.failed,
						}))}
						margin={{ left: 70 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis type="number" allowDecimals={false} />
						<YAxis dataKey="door_id" type="category" />
						<Tooltip />
						<Bar dataKey="failed" fill="#ef4444" />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Traffic */}
			<div className="bg-white rounded-xl shadow p-4 export-chart">
				<div className="flex items-center gap-2 mb-2">
					<span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
						<FiBarChart2 className="text-base" />
					</span>
					<h3 className="text-sm font-semibold text-gray-700">
						Busiest Doors (Traffic Load)
					</h3>
				</div>
				<ResponsiveContainer width="100%" height={220}>
					<BarChart
						data={topTrafficDoors.map((d) => ({
							door_id: d.door_id,
							total: d.total,
						}))}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="door_id" />
						<YAxis allowDecimals={false} />
						<Tooltip />
						<Bar dataKey="total" fill="#6366f1" />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* SECURITY INSIGHTS */}
			<div className="bg-red-50 border border-red-200 rounded-xl shadow p-4 export-chart">
				<div className="flex items-center gap-2 mb-2">
					<span className="bg-red-100 text-red-700 p-1.5 rounded-md">
						<FiAlertTriangle className="text-base" />
					</span>
					<h3 className="text-sm font-semibold text-red-700">
						Security Insights & Alerts
					</h3>
				</div>

				<ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
					{insights.map((msg, idx) => (
						<li key={idx}>{msg}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
