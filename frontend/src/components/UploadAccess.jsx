import { useState, useRef } from "react";
import { FiXCircle, FiKey } from "react-icons/fi";
import { getAccessForUser } from "../services/access.service";
import { getDoorById } from "../services/doors.service";
import { writeLog } from "../services/logs.services";
import { useToast } from "../components/toast/ToastContext";
import { getUserById } from "../services/users.service";

export default function UploadAccess({ onClose, onResult, appendLog }) {
	const [selectedImage, setSelectedImage] = useState(null);
	const [selectedDoor, setSelectedDoor] = useState("");
	const [loading, setLoading] = useState(false);
	const { showToast } = useToast();
	const fileInputRef = useRef(null);

	// More robust: accepts File or string, strips extension and splits on common separators
	const extractClassFromPath = (fileOrName) => {
		if (!fileOrName) return null;
		const name =
			typeof fileOrName === "string"
				? fileOrName
				: fileOrName.name || fileOrName.filename || "";
		if (!name) return null;
		const base = name.replace(/\.[^/.]+$/, ""); // remove extension
		const token = base.split(/[_\-\s.]+/).find(Boolean);
		return token ? token.toUpperCase() : null;
	};

	const simulatePrediction = async () => {
		if (loading) return;
		if (!selectedImage) {
			showToast("Please select an image", "warning");
			return;
		}
		if (!selectedDoor) {
			showToast("Please select a door", "warning");
			return;
		}

		setLoading(true);

		const actualClass = extractClassFromPath(selectedImage);
		if (!actualClass) {
			showToast("Invalid filename format!", "error");
			setLoading(false);
			return;
		}

		// Identity always matches for now
		const predictedClass = actualClass;
		const isMatch = true;

		showToast(`Identity Verified (${actualClass})`, "success");

		let accessData = [];
		try {
			accessData = await getAccessForUser(actualClass);
		} catch (err) {
			console.error("Error fetching access permissions:", err);
			showToast("Error fetching access permissions", "error");
			setLoading(false);
			return;
		}

		// Validate access
		const hasAccess = !!accessData.find(
			(a) => a?.door_id === selectedDoor && a?.access_granted
		);

		const status = hasAccess ? "SUCCESS" : "DENIED";

		if (hasAccess) {
			showToast(`Access Granted for Door ${selectedDoor}`, "success");
		} else {
			showToast(
				`Access Denied — ${actualClass} cannot open ${selectedDoor}`,
				"error"
			);
		}

		// Door info
		let doorInfo = { location: "Unknown" };
		try {
			const d = await getDoorById(selectedDoor);
			if (d) doorInfo = d;
		} catch (err) {
			console.warn("Failed to fetch door info", err);
		}

		// User info
		let userInfo = null;
		try {
			userInfo = await getUserById(actualClass);
		} catch (err) {
			console.warn("Failed to fetch user info", err);
			userInfo = { user: { name: actualClass } };
		}

		const timestamp = new Date().toISOString();

		const logEntry = {
			timestamp,
			user_id: actualClass,
			user_name: userInfo?.user?.name || userInfo?.name || actualClass,
			door_id: selectedDoor,
			door_location: doorInfo?.location || "Unknown",
			status,
		};

		// Write log to DB
		try {
			await writeLog(logEntry);
		} catch (err) {
			console.error("Failed to write log:", err);
			showToast("Failed to write log", "error");
			// continue — we still want to show result locally
		}

		// Local UI log message
		appendLog(
			`${timestamp} | User:${actualClass} | Door:${selectedDoor} | Access:${status}`
		);

		// Send result back to parent
		onResult({
			predicted: predictedClass,
			actual: actualClass,
			match: isMatch,
			door: selectedDoor,
			access: hasAccess ? "granted" : "denied",
		});

		// Reset & close
		setSelectedDoor("");
		setSelectedImage(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		setLoading(false);
		onClose();
	};

	const actualPreview = selectedImage
		? extractClassFromPath(selectedImage)
		: null;

	return (
		<div
			className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				className="bg-white w-80 rounded-xl shadow-xl p-5 relative"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
				>
					<FiXCircle size={18} />
				</button>

				<h3 className="text-sm font-semibold text-gray-800 mb-4">
					Simulate Door Access
				</h3>

				<select
					value={selectedDoor}
					onChange={(e) => setSelectedDoor(e.target.value)}
					className="w-full border rounded-md p-1 text-xs mb-3 text-gray-700"
				>
					<option value="">-- Choose Door --</option>
					{Array.from({ length: 10 }, (_, i) => {
						const id = `D${String(i + 1).padStart(3, "0")}`;
						return (
							<option key={id} value={id}>
								{id}
							</option>
						);
					})}
				</select>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={(e) => setSelectedImage(e.target.files[0] || null)}
					className="w-full text-xs mb-3"
				/>

				{actualPreview && (
					<div className="mb-3 bg-gray-50 border border-gray-200 rounded-md p-2 text-xs">
						<p>
							<strong>Actual Identity:</strong>{" "}
							<span className="text-green-700 font-semibold">
								{actualPreview}
							</span>
						</p>
						<p>
							<strong>Status:</strong>{" "}
							<span className="text-indigo-700 font-semibold">
								{loading ? "Processing..." : "Ready"}
							</span>
						</p>
					</div>
				)}

				<button
					type="button"
					disabled={!selectedImage || !selectedDoor || loading}
					onClick={simulatePrediction}
					className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm shadow transition
            ${
							selectedImage && selectedDoor && !loading
								? "bg-indigo-600 hover:bg-indigo-700"
								: "bg-gray-400 cursor-not-allowed"
						}`}
				>
					<FiKey size={16} /> {loading ? "Checking..." : "Check Access"}
				</button>
			</div>
		</div>
	);
}
