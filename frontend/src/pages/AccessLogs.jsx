import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../components/toast/ToastContext";
import { FiDownload, FiFileText } from "react-icons/fi";
import jsPDF from "jspdf";
import { getLogs } from "../services/logs.services";

export default function AccessLogs() {
	const { showToast } = useToast();

	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const logsPerPage = 15;
	const [searchParams, setSearchParams] = useSearchParams();
	const initialPage = parseInt(searchParams.get("page")) || 1;
	const [currentPage, setCurrentPage] = useState(initialPage);

	const indexOfLast = currentPage * logsPerPage;
	const indexOfFirst = indexOfLast - logsPerPage;
	const currentLogs = logs.slice(indexOfFirst, indexOfLast);

	const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));

	const [showExportMenu, setShowExportMenu] = useState(false);
	const exportRef = useRef(null);

	// ------------------------ FETCH LOGS FROM API ------------------------
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

	// ------------------------ EXPORT CSV ------------------------
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

	// ------------------------ EXPORT PDF ------------------------
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

	// ------------------------ PAGINATION ------------------------
	const handlePageChange = (page) => {
		setSearchParams({ page });
		setCurrentPage(page);
	};

	// ------------------------ FORMAT TIMESTAMP ------------------------
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

	// ------------------------ RENDER ------------------------
	return (
		<div className="flex flex-col items-center min-h-screen bg-gray-50 pt-20 px-4">
			<h1 className="text-3xl font-bold text-gray-800 mb-6">Access Logs</h1>

			<div className="w-full max-w-6xl bg-white border rounded-lg shadow-sm h-[75vh] overflow-y-auto p-2">
				{/* Header row */}
				<div className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr] p-2 border-b font-semibold text-sm bg-gray-100">
					<span>Date / Time</span>
					<span>User</span>
					<span>Door / Location</span>
					<span className="text-center">Result</span>
				</div>

				{/* Logs */}
				<ul>
					{loading ? (
						<li className="text-center py-6 text-gray-500">Loading logs...</li>
					) : error ? (
						<li className="text-center py-6 text-red-500">{error}</li>
					) : currentLogs.length === 0 ? (
						<li className="text-center py-4 text-gray-400">No logs found</li>
					) : (
						currentLogs.map((log, idx) => (
							<li
								key={idx}
								className={`grid grid-cols-[1.5fr_1.5fr_2fr_1fr] p-2 text-xs border rounded-md mt-1
                  ${
										log.status === "SUCCESS"
											? "bg-green-50 border-green-200 text-green-700"
											: "bg-red-50 border-red-200 text-red-700"
									}`}
							>
								<span>{formatDate(log.timestamp)}</span>
								<span>
									{log.user_id} / {log.user_name}
								</span>
								<span>
									{log.door_id} / {log.door_location}
								</span>
								<span className="font-semibold text-center">{log.status}</span>
							</li>
						))
					)}
				</ul>
			</div>

			{/* Pagination */}
			<div className="flex gap-1 mt-4 flex-wrap justify-center">
				{Array.from({ length: totalPages }, (_, i) => (
					<button
						key={i}
						onClick={() => handlePageChange(i + 1)}
						className={`px-3 py-1 text-xs border rounded-md
              ${
								currentPage === i + 1
									? "bg-indigo-600 text-white border-indigo-600"
									: "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
							}`}
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
						<div className="absolute bottom-full left-1/2 -translate-x-1/2 w-40 bg-white border rounded-lg shadow-lg mb-2 z-20">
							<button
								onClick={() => {
									exportCSV();
									setShowExportMenu(false);
								}}
								className="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
							>
								<FiFileText /> CSV
							</button>

							<button
								onClick={() => {
									exportPDF();
									setShowExportMenu(false);
								}}
								className="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
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
