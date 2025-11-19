import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../components/toast/ToastContext";
import { FiDownload, FiFileText } from "react-icons/fi";
import jsPDF from "jspdf";
import { getLogs } from "../services/logs.service";

export default function AccessLogs() {
	const { showToast } = useToast();

	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const logsPerPage = 12;
	const [searchParams, setSearchParams] = useSearchParams();
	const initialPage = parseInt(searchParams.get("page")) || 1;
	const [currentPage, setCurrentPage] = useState(initialPage);

	const indexOfLast = currentPage * logsPerPage;
	const indexOfFirst = indexOfLast - logsPerPage;
	const currentLogs = logs.slice(indexOfFirst, indexOfLast);

	const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));

	const [showExportMenu, setShowExportMenu] = useState(false);
	const exportRef = useRef(null);

	// Fetch logs from api
	useEffect(() => {
		setLoading(true);

		getLogs()
			.then((data) => {
				setLogs(data);
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to load logs");
				showToast("Failed to load logs!", "error");
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		if (!loading && logs.length > 0) {
			showToast("Logs loaded successfully!", "success");
		}
	}, [loading]);

	// Export CSV
	const exportCSV = () => {
		if (logs.length === 0) {
			showToast("No logs to export!", "error");
			return;
		}

		const header = "Timestamp,User ID,User Name,Door ID,Location,Status";
		const rows = logs
			.map(
				(log) =>
					`${log.timestamp},${log.user_id},${log.user_name},${log.door_id},"${log.door_location}",${log.status}`
			)
			.join("\n");

		const csv = `${header}\n${rows}`;
		const blob = new Blob([csv], { type: "text/csv" });

		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = "access_logs.csv";
		link.click();

		URL.revokeObjectURL(url);
		showToast("CSV exported!", "success");
	};

	//Export PDF
	const exportPDF = () => {
		if (logs.length === 0) {
			showToast("No logs to export!", "error");
			return;
		}

		const pdf = new jsPDF();
		pdf.setFontSize(14);
		pdf.text("Access Logs Report", 14, 15);

		let y = 25;
		pdf.setFontSize(10);

		logs.forEach((log, idx) => {
			if (y > 280) {
				pdf.addPage();
				y = 15;
			}

			const line = `${idx + 1}. ${log.timestamp} | ${log.user_id} / ${
				log.user_name
			} | ${log.door_id} / ${log.door_location} | ${log.status}`;

			const wrapped = pdf.splitTextToSize(line, 180);
			pdf.text(wrapped, 14, y);
			y += wrapped.length * 6;
		});

		pdf.save("access_logs.pdf");
		showToast("PDF exported!", "success");
	};

	// Hide export menu when clicking outside
	useEffect(() => {
		function handleClickOutside(e) {
			if (exportRef.current && !exportRef.current.contains(e.target)) {
				setShowExportMenu(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Pagination
	const handlePageChange = (page) => {
		setSearchParams({ page });
		setCurrentPage(page);
	};

	// Format Timestamps
	const formatDate = (timestamp) => {
		const d = new Date(timestamp);
		if (isNaN(d)) return timestamp;

		return d.toLocaleString("en-IN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});
	};
	return (
		<div className="flex flex-col items-center min-h-screen bg-gray-50 pt-20 px-4">
			<h1 className="text-3xl font-bold text-gray-800 mb-6">Access Logs</h1>

			<div className="w-full max-w-6xl bg-white border border-gray-200 rounded-xl shadow-sm h-[72vh] overflow-y-auto p-0">
				{/* Header row */}
				<div className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr] px-4 py-3 border-b bg-gray-100 text-gray-700 font-semibold text-sm sticky top-0 z-10">
					<span>Date / Time</span>
					<span>User</span>
					<span>Door / Location</span>
					<span className="text-center">Result</span>
				</div>

				{/* Logs */}
				<ul className="divide-y">
					{loading ? (
						<li className="text-center py-6 text-gray-500">Loading logs...</li>
					) : error ? (
						<li className="text-center py-6 text-red-500">{error}</li>
					) : currentLogs.length === 0 ? (
						<li className="text-center py-6 text-gray-400">No logs found</li>
					) : (
						currentLogs.map((log, idx) => (
							<li
								key={idx}
								className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr] px-4 py-3 text-xs items-center"
							>
								<span>{formatDate(log.timestamp)}</span>

								<span className="text-gray-700 font-medium">
									{log.user_id} / {log.user_name}
								</span>

								<span className="text-gray-700">
									{log.door_id} / {log.door_location}
								</span>

								<span
									className={`text-center font-bold px-2 py-1 rounded-md
									${
										log.status === "SUCCESS"
											? "bg-green-100 text-green-700 border border-green-300"
											: "bg-red-100 text-red-700 border border-red-300"
									}
								`}
								>
									{log.status}
								</span>
							</li>
						))
					)}
				</ul>
			</div>

			{/* Pagination */}
			<div className="flex gap-2 mt-4 flex-wrap justify-center">
				{Array.from({ length: totalPages }, (_, i) => (
					<button
						key={i}
						onClick={() => handlePageChange(i + 1)}
						className={`px-3 py-1 text-sm rounded-md border transition
						${
							currentPage === i + 1
								? "bg-indigo-600 text-white border-indigo-600 shadow"
								: "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
						}
					`}
					>
						{i + 1}
					</button>
				))}
			</div>

			{/* Back + Export Menu */}
			<div className="flex gap-4 mt-6 items-center">
				<Link
					to="/"
					className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 text-sm"
				>
					Back to Home
				</Link>

				<div className="relative" ref={exportRef}>
					<button
						onClick={() => setShowExportMenu(!showExportMenu)}
						className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 text-sm flex items-center gap-2"
					>
						<FiDownload /> Export
					</button>

					{showExportMenu && (
						<div className="absolute top-full left-1/2 -translate-x-1/2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-20">
							<button
								onClick={() => {
									exportCSV();
									setShowExportMenu(false);
								}}
								className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
							>
								<FiFileText /> CSV
							</button>

							<button
								onClick={() => {
									exportPDF();
									setShowExportMenu(false);
								}}
								className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
							>
								<FiFileText /> PDF
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
