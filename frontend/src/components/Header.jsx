import { FiLogOut, FiShield, FiUser } from "react-icons/fi";
import api from "../api/api";
import { Link } from "react-router-dom";
import { useToast } from "../components/toast/ToastContext";

export default function Header() {
	const { showToast } = useToast();

	const handleLogout = async () => {
		try {
			await api.post("/admin/logout");
			showToast("Logout successful!", "success");
			setTimeout(() => {
				window.location.href = "/login";
			}, 150);
		} catch (err) {
			console.error("Logout failed:", err);
			showToast("Logout failed. Try again!", "error");
		}
	};

	return (
		<header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-lg border-b border-indigo-100 transition-all">
			<div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
				{/* Brand */}
				<Link
					to="/"
					className="flex items-center gap-3 group cursor-pointer select-none"
				>
					<div className="p-2.5 rounded-xl bg-indigo-600 shadow-md group-hover:shadow-lg transition-all duration-200 transform group-hover:-translate-y-0.5">
						<FiShield className="text-white w-6 h-6 group-hover:rotate-[10deg] transition-transform duration-200" />
					</div>

					<div className="leading-tight">
						<p className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200 tracking-wide">
							Smart Door Admin
						</p>
						<p className="text-[12px] text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
							Secure Access Monitoring
						</p>
					</div>
				</Link>

				{/* Right Controls */}
				<div className="flex items-center gap-5">
					{/* Profile Button Placeholder (future settings) */}
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-100 transition">
						<FiUser className="text-indigo-600 w-4 h-4" />
						<span className="text-sm text-gray-700 font-medium">Admin</span>
					</div>

					{/* Logout */}
					<div className="relative">
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 text-red-600 hover:text-red-700 cursor-pointer font-semibold rounded-md px-3 py-2 hover:bg-red-50 transition"
						>
							<FiLogOut className="w-4 h-4" />
							Logout
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
