import React from "react";
import { FiX, FiUser, FiLock } from "react-icons/fi";

const Modal = ({
	show,
	onClose,
	user,
	doors,
	onToggleDoor,
	onSave,
	isNewUser,
	setModalUser,
	saving,
}) => {
	if (!show) return null;

	const handleChange = (field, value) => {
		setModalUser((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div
				className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative
							max-h-[88vh] overflow-y-auto animate-fadeIn"
			>
				{/* Close */}
				<button
					onClick={onClose}
					className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-200 text-gray-700"
				>
					<FiX size={20} />
				</button>

				{/* Title */}
				<h2 className="text-xl font-bold text-gray-900 text-center">
					{isNewUser ? "Add New User" : "Edit User Details"}
				</h2>
				<hr className="my-4 border-gray-200" />

				{/* User Info */}
				<div className="space-y-3 mb-5">
					<div className="flex items-center gap-2">
						<FiUser className="text-gray-500" />
						<input
							type="text"
							placeholder="User ID"
							value={user.user_id}
							onChange={(e) => handleChange("user_id", e.target.value)}
							className="flex-1 p-2.5 border rounded-md text-sm outline-none
										focus:ring-2 focus:ring-indigo-500"
							disabled={!isNewUser}
							required
						/>
					</div>

					<input
						type="text"
						placeholder="Full Name"
						value={user.name}
						onChange={(e) => handleChange("name", e.target.value)}
						className="w-full p-2.5 border rounded-md text-sm outline-none
									focus:ring-2 focus:ring-indigo-500"
						required
					/>

					{/* Role Dropdown */}
					<select
						value={user.role || "User"}
						onChange={(e) => handleChange("role", e.target.value)}
						className="w-full p-2.5 border rounded-md text-sm outline-none
									focus:ring-2 focus:ring-indigo-500 cursor-pointer"
					>
						<option>User</option>
						<option>Admin</option>
						<option>Guest</option>
					</select>
				</div>

				{/* Doors */}
				<p className="font-medium text-gray-700 mb-2 flex items-center gap-2">
					<FiLock className="text-gray-500" /> Door Access Permissions
				</p>

				{/* Legend */}
				<div className="flex gap-4 text-[11px] mb-2 text-gray-600">
					<span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
						Granted
					</span>
					<span className="px-2 py-0.5 rounded bg-red-100 text-red-700">
						Revoked
					</span>
				</div>

				{/* Door List */}
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-40 overflow-y-auto pr-1">
					{doors.map((door) => {
						const granted = user.access_for?.find(
							(d) => d.door_id === door.door_id
						)?.access_granted;

						return (
							<button
								key={door.door_id}
								onClick={() => onToggleDoor(door.door_id)}
								className={`px-3 py-1 text-xs rounded-full font-medium transition
									${
										granted
											? "bg-green-100 text-green-700 border border-green-400"
											: "bg-red-100 text-red-700 border border-red-400"
									}
									hover:scale-[1.03]`}
							>
								{door.door_id}
							</button>
						);
					})}
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end gap-3 mt-4">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm rounded-md border bg-gray-200 
									text-gray-800 hover:bg-gray-300 transition"
						disabled={saving}
					>
						Cancel
					</button>

					<button
						onClick={onSave}
						disabled={saving}
						className={`px-5 py-2 text-sm rounded-md text-white shadow transition
									${
										saving
											? "bg-indigo-400 cursor-not-allowed"
											: "bg-indigo-600 hover:bg-indigo-700"
									}`}
					>
						{saving ? "Saving..." : isNewUser ? "Create User" : "Save Changes"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Modal;
