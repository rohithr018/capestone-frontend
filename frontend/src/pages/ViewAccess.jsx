import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { getUsers, createUser, updateUser } from "../services/users.service";
import { getDoors } from "../services/doors.service";
import {
	getAccessForUser,
	grantAccess,
	revokeAccess,
} from "../services/access.service";
import { useToast } from "../components/toast/ToastContext";

const USERS_PER_PAGE = 9;

const roleStyles = {
	Admin: "bg-indigo-100 text-indigo-700",
	User: "bg-green-100 text-green-700",
	Guest: "bg-gray-200 text-gray-700",
};

export default function ViewAccess() {
	const [users, setUsers] = useState([]);
	const [doors, setDoors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [showModal, setShowModal] = useState(false);
	const [isNewUser, setIsNewUser] = useState(false);
	const [saving, setSaving] = useState(false);
	const [modalUser, setModalUser] = useState({
		user_id: "",
		name: "",
		role: "User",
		access_for: [],
	});

	const navigate = useNavigate();
	const { showToast } = useToast();

	const fetchUsersWithAccess = async () => {
		try {
			const usersData = await getUsers();
			if (!Array.isArray(usersData)) return setUsers([]);

			const usersWithAccess = await Promise.all(
				usersData.map(async (u) => {
					const access = await getAccessForUser(u.user_id).catch(() => []);
					return { ...u, access_for: access };
				})
			);
			setUsers(usersWithAccess);
		} catch {
			showToast("Failed to load users", "error");
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const doorsData = await getDoors();
				setDoors(doorsData || []);
				await fetchUsersWithAccess();
			} catch {
				showToast("Failed to load doors", "error");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const indexOfLast = currentPage * USERS_PER_PAGE;
	const currentUsers = users.slice(indexOfLast - USERS_PER_PAGE, indexOfLast);
	const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));

	const handleEditUser = (user) => {
		const fullAccess = doors.map((d) => {
			const found = user.access_for?.find((a) => a.door_id === d.door_id);
			return found || { door_id: d.door_id, access_granted: false };
		});
		setModalUser({ ...user, access_for: fullAccess });
		setIsNewUser(false);
		setShowModal(true);
	};

	const handleNewUser = () => {
		setModalUser({
			user_id: "",
			name: "",
			role: "User",
			access_for: doors.map((d) => ({
				door_id: d.door_id,
				access_granted: false,
			})),
		});
		setIsNewUser(true);
		setShowModal(true);
	};

	const handleToggleDoor = (doorId) => {
		setModalUser((prev) => ({
			...prev,
			access_for: prev.access_for.map((a) =>
				a.door_id === doorId ? { ...a, access_granted: !a.access_granted } : a
			),
		}));
	};

	const handleSaveUser = async () => {
		setSaving(true);
		try {
			if (isNewUser) {
				await createUser({
					user_id: modalUser.user_id,
					name: modalUser.name,
					role: modalUser.role,
					last_updated: new Date().toISOString(),
				});
				showToast("User created successfully", "success");
			} else {
				await updateUser(modalUser.user_id, {
					name: modalUser.name,
					role: modalUser.role,
					last_updated: new Date().toISOString(),
				});
				showToast("User updated successfully", "success");
			}

			await Promise.all(
				modalUser.access_for.map((a) =>
					a.access_granted
						? grantAccess(modalUser.user_id, a.door_id, true)
						: revokeAccess(modalUser.user_id, a.door_id)
				)
			);

			showToast("Access permissions updated", "success");

			await fetchUsersWithAccess();
			setShowModal(false);
		} catch {
			showToast("Failed to save changes", "error");
		} finally {
			setSaving(false);
		}
	};

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center text-gray-600">
				Loading users...
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-100 pt-24 px-4 flex flex-col justify-between">
			<div className="max-w-6xl mx-auto w-full">
				<h1 className="text-3xl font-bold text-gray-800 text-center mb-10">
					User Access Management
				</h1>

				{users.length === 0 ? (
					<p className="text-center text-gray-500 p-10">
						No users found. Add a user to begin.
					</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{currentUsers.map((user) => (
							<div
								key={user.user_id}
								className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between hover:shadow-xl transition-all"
							>
								<div>
									<h2 className="text-lg font-semibold text-gray-900">
										{user.name}
									</h2>
									<span
										className={`text-[11px] px-2 py-0.5 rounded-md font-medium mt-1 inline-block ${
											roleStyles[user.role] || roleStyles["User"]
										}`}
									>
										{user.role}
									</span>

									<div className="mt-3">
										<p className="text-xs font-semibold text-gray-600 mb-1">
											Access Granted:
										</p>
										<ul className="flex flex-wrap gap-1">
											{user.access_for?.map((a) => (
												<li
													key={a.door_id}
													className={`px-2 py-0.5 rounded text-[11px] font-medium ${
														a.access_granted
															? "bg-green-100 text-green-700"
															: "bg-red-100 text-red-700"
													}`}
												>
													{a.door_id}
												</li>
											))}
										</ul>
									</div>
								</div>

								<button
									onClick={() => handleEditUser(user)}
									className="mt-4 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg shadow hover:bg-indigo-700 transition font-medium"
								>
									Manage Access
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Fixed Footer Controls */}
			<div className="mt-10 max-w-6xl mx-auto w-full flex flex-col items-center gap-6 pb-10">
				{totalPages > 1 && (
					<div className="flex items-center gap-2">
						<button
							disabled={currentPage === 1}
							onClick={() => setCurrentPage((p) => p - 1)}
							className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
						>
							Prev
						</button>

						{Array.from({ length: totalPages }, (_, i) => (
							<button
								key={i}
								onClick={() => setCurrentPage(i + 1)}
								className={`px-3 py-1.5 rounded-md text-sm transition font-medium ${
									currentPage === i + 1
										? "bg-indigo-600 text-white shadow-md"
										: "bg-gray-100 hover:bg-gray-200 text-gray-700"
								}`}
							>
								{i + 1}
							</button>
						))}

						<button
							disabled={currentPage === totalPages}
							onClick={() => setCurrentPage((p) => p + 1)}
							className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
						>
							Next
						</button>
					</div>
				)}

				<div className="flex justify-center gap-4">
					<button
						onClick={() => navigate("/")}
						className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition text-sm font-medium"
					>
						Back to Home
					</button>

					<button
						onClick={handleNewUser}
						disabled={!doors.length}
						className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
					>
						+ Add User
					</button>
				</div>
			</div>

			<Modal
				show={showModal}
				onClose={() => setShowModal(false)}
				user={modalUser}
				doors={doors}
				onToggleDoor={handleToggleDoor}
				onSave={handleSaveUser}
				isNewUser={isNewUser}
				setModalUser={setModalUser}
				saving={saving}
			/>
		</div>
	);
}
