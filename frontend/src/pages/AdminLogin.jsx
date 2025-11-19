import { useState } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import api from "../api/api";
import { useToast } from "../components/toast/ToastContext";

export default function AdminLogin() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { showToast } = useToast();

	const login = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await api.post("/admin/login", { username, password });
			showToast("Login successful! Redirecting…", "success");
			// sleep
			setTimeout(() => {
				window.location.href = "/";
			}, 150);
		} catch (err) {
			showToast(
				err.response?.data?.detail || "Invalid username or password",
				"error"
			);
			setError(err.response?.data?.detail || "Invalid username or password");
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-gray-100 px-4">
			<div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm border border-gray-200">
				{/* Icon + Title */}
				<div className="flex flex-col items-center">
					<div className="bg-indigo-600 p-3 rounded-full shadow-md">
						<FiShield className="text-white text-3xl" />
					</div>
					<h2 className="text-3xl font-extrabold text-gray-900 mt-4 mb-6 tracking-wide">
						Admin Login
					</h2>
				</div>

				<form onSubmit={login}>
					{/* Username */}
					<div className="mb-4">
						<label className="text-sm font-medium text-gray-700">
							Username
						</label>
						<div className="flex items-center border rounded-lg px-3 py-2 mt-1 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
							<FiUser className="text-gray-500 mr-2" size={18} />
							<input
								type="text"
								required
								className="w-full bg-transparent outline-none"
								placeholder="Enter username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
					</div>
					{/* Password */}
					<div className="mb-4">
						<label className="text-sm font-medium text-gray-700">
							Password
						</label>
						<div className="flex items-center border rounded-lg px-3 py-2 mt-1 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
							<FiLock className="text-gray-500 mr-2" size={18} />
							<input
								type={showPassword ? "text" : "password"}
								required
								className="w-full bg-transparent outline-none"
								placeholder="Enter password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<div
								className="cursor-pointer text-gray-500"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
							</div>
						</div>
					</div>
					{/* Login Button */}
					<button
						type="submit"
						className={`w-full py-2 mt-3 rounded-lg font-semibold text-white
						shadow-md transition ${
							loading
								? "bg-gray-400 cursor-not-allowed"
								: "bg-indigo-600 hover:bg-indigo-700"
						}`}
						disabled={loading}
					>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
}
