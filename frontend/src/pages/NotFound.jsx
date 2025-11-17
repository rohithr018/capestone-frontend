import { Link } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
			<div className="bg-white shadow-xl border border-gray-200 rounded-xl py-10 px-8 max-w-md text-center animate-fadeIn">
				<div className="flex justify-center mb-4">
					<div className="bg-red-100 p-3 rounded-full">
						<FiAlertTriangle className="text-red-600 text-3xl" />
					</div>
				</div>

				<h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
				<p className="text-lg font-medium text-gray-700 mb-3">Page Not Found</p>

				<p className="text-sm text-gray-500 mb-6">
					The page you are looking for may have been moved
					<br />
					or no longer exists.
				</p>

				<Link
					to="/"
					className="flex items-center justify-center gap-2 w-full 
					bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg 
					shadow-md hover:bg-indigo-700 transition"
				>
					<FiArrowLeft className="text-md" />
					Home
				</Link>
			</div>
		</div>
	);
}
