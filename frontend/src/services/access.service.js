import api from "../api/api";

export const getAccessForUser = async (userId) => {
	const response = await api.get(`/access/${userId}`);
	return response.data;
};

export const grantAccess = async (userId, doorId, accessGranted) => {
	const response = await api.post("/access", {
		user_id: userId,
		door_id: doorId,
		access_granted: accessGranted,
		access_updated: new Date().toISOString(),
	});
	return response.data;
};

export const revokeAccess = async (userId, doorId) => {
	const response = await api.delete("/access", {
		data: { user_id: userId, door_id: doorId },
	});
	return response.data;
};
