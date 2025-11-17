import api from "../api/api";

export const getLogs = async () => {
	const response = await api.get("/logs");
	return response.data;
};

export const writeLog = async (entry) => {
	const response = await api.post("/logs", entry);
	return response.data;
};

export const deleteAllLogs = async () => {
	const response = await api.delete("/logs");
	return response.data;
};
