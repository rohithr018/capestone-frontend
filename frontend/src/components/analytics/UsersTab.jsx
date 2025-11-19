import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
	LabelList,
} from "recharts";
import {
	FiAlertTriangle,
	FiUsers,
	FiTrendingUp,
	FiCheckCircle,
} from "react-icons/fi";

export default function UsersTab({ data }) {
	const users = [...(data?.byUser || [])];

	const topFailedUsers = [...(data?.topFailedUsers || [])].slice(0, 5);
	const topActiveUsers = [...(data?.topActiveUsers || [])].slice(0, 5);
	const topSuccessfulUsers = [...users]
		.sort((a, b) => b.success - a.success)
		.slice(0, 5);

	// Thresholds
	const HIGH_FAIL_THRESHOLD = 3;
	const FAIL_RATE_THRESHOLD = 0.3;

	// Suspicious Users List
	const suspiciousUsers = users
		.filter(
			(u) =>
				u.failed >= HIGH_FAIL_THRESHOLD && u.failRate >= FAIL_RATE_THRESHOLD
		)
		.sort((a, b) => b.failRate - a.failRate);

	//  Helper to format X-Axis labels (truncation)
	const truncate = (str, max = 12) =>
		str.length > max ? str.slice(0, max) + "…" : str;

	return (
		<div className="space-y-6">
			{/* Security Thresholds Panel */}
			<div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-md p-4 flex gap-3 items-start">
				<div className="text-xs text-gray-800 space-y-1 leading-relaxed">
					<p>
						<strong>High Fail Count:</strong>{" "}
						<span className="bg-red-100 px-2 py-0.5 rounded-md text-red-700 font-semibold">
							≥ {HIGH_FAIL_THRESHOLD}
						</span>
					</p>
					<p>
						<strong>Fail Rate Risk:</strong>{" "}
						<span className="bg-rose-100 px-2 py-0.5 rounded-md text-rose-700 font-semibold">
							≥ {FAIL_RATE_THRESHOLD * 100}%
						</span>
					</p>
				</div>
			</div>

			{/*Top Failed Users */}
			{/* Most Denied Attempts (High Risk) */}
			<div className="bg-white border border-red-200/60 rounded-xl shadow-md p-5">
				{/* Header */}
				<div className="flex items-center gap-3 mb-4">
					<div className="bg-red-100 text-red-600 p-2 rounded-lg shadow-sm">
						<FiAlertTriangle className="text-lg" />
					</div>
					<h3 className="text-sm font-semibold text-red-700 tracking-wide uppercase">
						Most Denied Attempts (High Risk)
					</h3>
				</div>

				{/* Content */}
				{!topFailedUsers.length ? (
					<p className="text-xs text-gray-500">No denied attempts recorded.</p>
				) : (
					<ResponsiveContainer width="100%" height={260}>
						<BarChart
							layout="vertical"
							data={topFailedUsers.map((u) => ({
								label: truncate(`${u.user_name} (${u.user_id})`, 18),
								failed: u.failed,
							}))}
							margin={{ left: 110, right: 20, top: 5, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
							<XAxis type="number" allowDecimals={false} />
							<YAxis
								dataKey="label"
								type="category"
								tick={{ fontSize: 11, fill: "#444" }}
								width={130}
							/>
							<Tooltip
								formatter={(value) => [`${value} Denied`, "Attempts"]}
								contentStyle={{
									backgroundColor: "#fff",
									border: "1px solid #ef4444",
									fontSize: "11px",
									borderRadius: "8px",
								}}
							/>
							<Bar dataKey="failed" fill="#dc2626" radius={[6, 6, 6, 6]}>
								<LabelList
									dataKey="failed"
									position="right"
									fill="#991b1b"
									style={{ fontWeight: 600, fontSize: "11px" }}
								/>
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* Most Active Users */}
			<div className="bg-white rounded-xl shadow p-5">
				<div className="flex items-center gap-2 mb-3">
					<span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
						<FiTrendingUp className="text-sm" />
					</span>
					<h3 className="text-sm font-semibold text-gray-700">
						Most Active Users (Traffic Load)
					</h3>
				</div>

				{!topActiveUsers.length ? (
					<p className="text-gray-500 text-xs">No access activity found.</p>
				) : (
					<ResponsiveContainer width="100%" height={260}>
						<BarChart
							data={topActiveUsers.map((u) => ({
								label: truncate(`${u.user_name} (${u.user_id})`),
								total: u.total,
							}))}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="label" tick={{ fontSize: 10 }} />
							<YAxis allowDecimals={false} />
							<Tooltip />
							<Bar dataKey="total" fill="#6366f1">
								<LabelList dataKey="total" position="top" fill="#6366f1" />
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* Top Successful Users */}
			<div className="bg-white rounded-xl shadow p-5">
				<div className="flex items-center gap-2 mb-3">
					<span className="bg-green-100 text-green-700 p-1.5 rounded-md">
						<FiCheckCircle className="text-sm" />
					</span>
					<h3 className="text-sm font-semibold text-gray-700">
						Top Successful Users (Trusted Access)
					</h3>
				</div>

				{!topSuccessfulUsers.length ? (
					<p className="text-gray-500 text-xs">No successful access events.</p>
				) : (
					<ResponsiveContainer width="100%" height={260}>
						<BarChart
							data={topSuccessfulUsers.map((u) => ({
								label: truncate(`${u.user_name} (${u.user_id})`),
								success: u.success,
							}))}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="label" tick={{ fontSize: 10 }} />
							<YAxis allowDecimals={false} />
							<Tooltip />
							<Bar dataKey="success" fill="#22c55e">
								<LabelList dataKey="success" position="top" fill="#22c55e" />
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* Suspicious Users */}
			<div className="bg-white border border-red-200 rounded-xl shadow-md p-5">
				{/* Header */}
				<div className="flex items-center gap-2 mb-4">
					<div className="p-2 rounded-lg bg-red-100 shadow-sm">
						<FiAlertTriangle className="text-red-600 text-lg" />
					</div>
					<h3 className="text-sm font-semibold text-red-700 tracking-wide">
						Suspicious Access Patterns
					</h3>
				</div>

				{!suspiciousUsers.length ? (
					<p className="text-xs text-gray-600">No suspicious users detected.</p>
				) : (
					<div className="overflow-hidden rounded-lg border border-red-100">
						<table className="min-w-full text-xs">
							<thead className="bg-gradient-to-r from-red-50 to-red-100">
								<tr className="text-red-700 font-semibold">
									<th className="py-2 px-3 text-left">User</th>
									<th className="py-2 px-3 text-center">Total Attempts</th>
									<th className="py-2 px-3 text-center">Denied</th>
									<th className="py-2 px-3 text-center">Fail Rate</th>
								</tr>
							</thead>

							<tbody>
								{suspiciousUsers.map((u) => (
									<tr
										key={u.user_id}
										className="border-b border-red-100 last:border-none hover:bg-red-50 transition"
									>
										<td className="py-2 px-3 font-medium text-gray-800">
											{truncate(`${u.user_name} (${u.user_id})`, 18)}
										</td>

										<td className="py-2 px-3 text-center">
											<span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
												{u.total}
											</span>
										</td>

										<td className="py-2 px-3 text-center">
											<span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-semibold">
												{u.failed}
											</span>
										</td>

										<td className="py-2 px-3 text-center font-bold">
											<span
												className={`px-2 py-0.5 rounded-md ${
													u.failRate >= 0.5
														? "bg-red-700 text-white"
														: "bg-red-200 text-red-800"
												}`}
											>
												{Math.round(u.failRate * 100)}%
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
