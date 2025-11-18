import { useState } from "react";
import { Link } from "react-router-dom";
import {
	FiUserCheck,
	FiActivity,
	FiBarChart2,
	FiUploadCloud,
} from "react-icons/fi";
import UploadAccess from "../components/UploadAccess";

export default function Home() {
	const [showUpload, setShowUpload] = useState(false);
	const [prediction, setPrediction] = useState(null);

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 pt-24">
			{/* Check Access Button */}
			<button
				onClick={() => {
					setPrediction(null);
					setShowUpload(true);
				}}
				className="absolute top-24 right-6 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow
			flex items-center gap-2 text-sm hover:bg-indigo-700 transition"
			>
				<FiUploadCloud size={18} />
				Check Access
			</button>

			{/* Title */}
			<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-3">
				Access Management Dashboard
			</h1>
			<p className="text-gray-600 text-sm mb-12 text-center">
				Manage roles • Monitor logs • Analyze security
			</p>

			{/* Feature Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-10 justify-items-center w-full max-w-5xl">
				<Link to="/view-access" className="feature-card">
					<FiUserCheck className="text-indigo-600 text-5xl mb-3" />
					<p className="text-lg font-semibold text-gray-800">User Access</p>
					<p className="text-xs text-gray-500 mt-2">Manage permissions</p>
				</Link>

				<Link to="/access-logs" className="feature-card">
					<FiActivity className="text-green-600 text-5xl mb-3" />
					<p className="text-lg font-semibold text-gray-800">Access Logs</p>
					<p className="text-xs text-gray-500 mt-2">Track entry history</p>
				</Link>

				<Link to="/analytics" className="feature-card">
					<FiBarChart2 className="text-purple-600 text-5xl mb-3" />
					<p className="text-lg font-semibold text-gray-800">Analytics</p>
					<p className="text-xs text-gray-500 mt-2">Insights & patterns</p>
				</Link>
			</div>

			{/* Upload Component */}
			{showUpload && (
				<UploadAccess
					onClose={() => setShowUpload(false)}
					onResult={(res) => setPrediction(res)}
				/>
			)}
		</div>
	);
}
