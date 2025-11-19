import { useState, useRef, useEffect } from "react";
import { FiXCircle, FiKey } from "react-icons/fi";
import { getAccessForUser } from "../services/access.service";
import { getDoorById } from "../services/doors.service";
import { writeLog } from "../services/logs.service";
import { useToast } from "../components/toast/ToastContext";
import { getUserById } from "../services/users.service";
import { predictThermalImage } from "../services/prediction.service";

export default function UploadAccess({ onClose, onResult, appendLog }) {
	const [selectedImage, setSelectedImage] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [selectedDoor, setSelectedDoor] = useState("");
	const [loading, setLoading] = useState(false);
	const [apiResult, setApiResult] = useState(null);
	const { showToast } = useToast();
	const fileInputRef = useRef(null);

	// Preview image URL
	useEffect(() => {
		if (!selectedImage) {
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(selectedImage);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedImage]);

	// Extract class (S1, S2...) from filename
	const extractClassFromPath = (file) => {
		if (!file) return null;
		const name = file.name || "";
		const base = name.replace(/\.[^/.]+$/, "");
		const parts = base.split(/[_\-\s.]+/).filter(Boolean);
		const match = parts.find((t) => /^[A-Za-z]\d+/i.test(t)) || parts[0];
		return match ? match.toUpperCase() : null;
	};

	// Normalize backend prediction
	const normalizePredictions = (resp) => {
		if (!resp) return [];
		if (
			typeof resp.prediction === "string" ||
			typeof resp.prediction === "number"
		)
			return [
				{
					label: String(resp.prediction).toUpperCase(),
					confidence: resp.confidence ?? null,
				},
			];
		if (Array.isArray(resp.prediction))
			return resp.prediction.map((p, i) => ({
				label: String(p).toUpperCase(),
				confidence: resp.confidences?.[i] ?? null,
			}));
		return [];
	};

	// MAIN FLOW
	const simulatePrediction = async () => {
		if (loading) return;

		if (!selectedImage) return showToast("Please select an image", "error");
		if (!selectedDoor) return showToast("Please select a door", "error");

		setLoading(true);
		setApiResult(null);

		try {
			const actual = extractClassFromPath(selectedImage);
			if (!actual) return showToast("Invalid filename format.", "error");

			// Predict
			let predictionResp;
			try {
				predictionResp = await predictThermalImage(selectedImage);
				setApiResult(predictionResp);
			} catch (err) {
				console.error("predictThermalImage error:", err);
				return showToast("Prediction API error.", "error");
			}

			const list = normalizePredictions(predictionResp);
			if (!list.length) return showToast("No prediction result", "error");

			const top = list[0];
			const predicted = top.label;
			const confidence = top.confidence ?? 0;

			// If predicted != actual => mismatch: do NOT check access or write log
			if (predicted !== actual) {
				showToast(
					`Mismatch: Predicted ${predicted}, expected ${actual}`,
					"error"
				);

				// notify parent about mismatch (no log write)
				try {
					onResult({
						match_found: false,
						actual,
						matched_identity: predicted,
						access: "denied",
						door: selectedDoor,
						timestamp: new Date().toISOString(),
						predictions: list,
						raw: predictionResp,
					});
				} catch (e) {
					console.warn("onResult threw:", e);
				}

				return;
			}

			// Matched identity — now perform access check and then write the log
			showToast(`Matched: ${predicted}`, "success");

			// 4. Get access list for the predicted identity
			let accessResp = null;
			try {
				accessResp = await getAccessForUser(predicted); // returns { user, access } or array
			} catch (err) {
				console.warn("getAccessForUser failed:", err);
				accessResp = null;
			}
			const accessList = Array.isArray(accessResp)
				? accessResp
				: accessResp?.access ?? [];

			// normalize selected door and check access_granted strictly
			const normalizedSelectedDoor = String(selectedDoor).trim().toUpperCase();
			const hasAccess = accessList.some((a) => {
				if (!a) return false;
				const doorId = String(a.door_id || "")
					.trim()
					.toUpperCase();
				// accept numeric 1 or boolean true or string "1" or "true"
				const gav = a.access_granted;
				const granted =
					Number(gav) === 1 ||
					gav === true ||
					String(gav).toLowerCase() === "true";
				return doorId === normalizedSelectedDoor && granted;
			});

			// Load door info for user-friendly label
			let doorInfo = {};
			try {
				doorInfo = await getDoorById(selectedDoor);
			} catch (err) {
				console.warn("getDoorById failed:", err);
			}
			const doorLabel =
				doorInfo?.name ||
				doorInfo?.door_name ||
				doorInfo?.location ||
				selectedDoor ||
				"Selected Door";

			// Get user info
			let userInfo = accessResp?.user ?? null;
			if (!userInfo) {
				try {
					userInfo = await getUserById(predicted);
				} catch (err) {
					console.warn("getUserById failed:", err);
					userInfo = null;
				}
			}

			// Determine status and persist log (only after prediction success)
			const status = hasAccess ? "SUCCESS" : "DENIED";
			const timestamp = new Date().toISOString();

			let writeSucceeded = false;
			try {
				await writeLog({
					timestamp,
					user_id: predicted,
					user_name: userInfo?.user?.name || userInfo?.name || predicted,
					door_id: selectedDoor,
					door_location: doorInfo?.location || "Unknown",
					status,
					predicted,
					confidence,
				});
				writeSucceeded = true;
				showToast(
					`Access log persisted — ${status} at ${doorLabel}`,
					"success"
				);
			} catch (err) {
				console.error("writeLog failed:", err);
				setTimeout(() => {
					showToast(
						`Failed to persist access log — ${status} at ${doorLabel}`,
						"error"
					);
				}, 800);
			}

			// Append local UI log and notify parent AFTER persistence attempt
			try {
				appendLog(
					`${timestamp} | User:${predicted} | Door:${selectedDoor} | Access:${status}`
				);
			} catch (err) {
				console.warn("appendLog failed:", err);
			}

			try {
				onResult({
					match_found: true,
					actual,
					matched_identity: predicted,
					access: hasAccess ? "granted" : "denied",
					door: selectedDoor,
					timestamp,
					predictions: list,
					raw: predictionResp,
					log_persisted: writeSucceeded,
				});
			} catch (e) {
				console.warn("onResult threw:", e);
			}

			setTimeout(() => {
				if (hasAccess) {
					showToast(`${predicted} has access for ${doorLabel}`, "success");
				} else {
					showToast(
						`${predicted} does NOT has access for ${doorLabel}`,
						"error"
					);
				}
			}, 800);
		} finally {
			setLoading(false);
			setTimeout(() => {
				if (fileInputRef.current) fileInputRef.current.value = "";
				setSelectedImage(null);
				setSelectedDoor("");
				setApiResult(null);
			}, 1600);
		}
	};

	const actualPreview = selectedImage
		? extractClassFromPath(selectedImage)
		: null;

	// UI
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
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
					onClick={onClose}
				>
					<FiXCircle size={18} />
				</button>

				<h3 className="text-sm font-semibold text-gray-800 mb-4">
					Simulate Door Access
				</h3>

				<select
					value={selectedDoor}
					onChange={(e) => setSelectedDoor(e.target.value)}
					className="w-full border rounded-md p-1 text-xs mb-3"
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

				{/* Image preview */}
				{previewUrl && (
					<div className="mb-3 flex items-center gap-2">
						<img
							src={previewUrl}
							className="w-20 h-20 object-cover rounded-md border"
							alt="preview"
						/>
						<div className="text-xs">
							<p>
								<strong>Actual:</strong>{" "}
								<span className="text-green-700">{actualPreview}</span>
							</p>
							<p>
								<strong>Status:</strong> {loading ? "Processing..." : "Ready"}
							</p>
						</div>
					</div>
				)}

				{/* Prediction */}
				{apiResult && (
					<div className="mb-3 bg-white border border-gray-200 rounded-md p-2 text-xs">
						<p>
							<strong>Prediction:</strong>{" "}
							{Array.isArray(apiResult.prediction)
								? apiResult.prediction[0]
								: apiResult.prediction}
						</p>
						<p>
							<strong>Confidence:</strong>{" "}
							{(
								apiResult.confidence ??
								apiResult.confidences?.[0] ??
								0
							).toFixed(4)}
						</p>
					</div>
				)}

				<button
					type="button"
					disabled={!selectedImage || !selectedDoor || loading}
					onClick={simulatePrediction}
					className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm shadow transition ${
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
