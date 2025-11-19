import { useEffect, useState } from "react";
import OverviewTab from "../components/analytics/OverviewTab";
import UsersTab from "../components/analytics/UsersTab";
import DoorsTab from "../components/analytics/DoorsTab";
import { buildAnalytics } from "../utils/analyticsParser";
import { getLogs } from "../services/logs.service";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FiDownload } from "react-icons/fi";

export default function Analytics() {
	const [activeTab, setActiveTab] = useState("overview");
	const [analytics, setAnalytics] = useState(null);
	const [loading, setLoading] = useState(true);

	// Load Logs & Build Analytics
	useEffect(() => {
		const load = async () => {
			try {
				const logs = await getLogs(); // 🔥 fetch from API
				setAnalytics(buildAnalytics(logs)); // 🔥 build analytics
			} catch (err) {
				console.error("Failed to load analytics", err);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, []);

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-500">Loading analytics...</p>
			</div>
		);

	if (!analytics)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-500">Failed to load analytics.</p>
			</div>
		);

	const tabs = [
		{ id: "overview", label: "Overview" },
		{ id: "users", label: "Users" },
		{ id: "doors", label: "Doors" },
	];

	return (
		<div className="min-h-screen bg-gray-100 pt-24 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold text-gray-800">
						Analytics & Insights
					</h1>
				</div>

				{/* Tabs */}
				<div className="flex gap-2 border-b mb-6 overflow-x-auto">
					{tabs.map((t) => (
						<button
							key={t.id}
							onClick={() => setActiveTab(t.id)}
							className={`px-4 py-2 text-sm font-medium rounded-t-md ${
								activeTab === t.id
									? "bg-white border-x border-t text-indigo-600"
									: "text-gray-600 hover:text-gray-800"
							}`}
						>
							{t.label}
						</button>
					))}
				</div>

				{/* Active Tab Content */}
				<div className="pb-10">
					{activeTab === "overview" && (
						<OverviewTab data={analytics} className="export-chart" />
					)}
					{activeTab === "users" && (
						<UsersTab data={analytics} className="export-chart" />
					)}
					{activeTab === "doors" && (
						<DoorsTab data={analytics} className="export-chart" />
					)}
				</div>
			</div>
		</div>
	);
}
