import { FaRegCopyright } from "react-icons/fa";

export default function Footer() {
	return (
		<footer className="w-full bg-gray-50 border-t border-gray-200 py-4 mt-10">
			<div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
				<FaRegCopyright className="text-gray-600" />
				<p>
					{new Date().getFullYear()} Smart Door Security System — All Rights
					Reserved
				</p>
			</div>
		</footer>
	);
}
