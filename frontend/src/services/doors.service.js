import api from "../api/api";

export const createDoor = async (door) => {
	const response = await api.post("/doors", door);
	return response.data;
};

export const updateDoor = async (doorId, door) => {
	const response = await api.put(`/doors/${doorId}`, door);
	return response.data;
};

export const deleteDoor = async (doorId) => {
	const response = await api.delete(`/doors/${doorId}`);
	return response.data;
};

export const getDoors = async () => {
	const response = await api.get("/doors");
	return response.data;
};

// If you also have getDoorById:
export const getDoorById = async (doorId) => {
	const response = await api.get(`/doors/${doorId}`);
	return response.data;
};
