import api from "../api/api";

export const getUsers = async () => {
	const response = await api.get("/users");
	return response.data;
};

export const createUser = async (user) => {
	const response = await api.post("/users", user);
	return response.data;
};

export const updateUser = async (userId, user) => {
	const response = await api.put(`/users/${userId}`, user);
	return response.data;
};

export const deleteUser = async (userId) => {
	const response = await api.delete(`/users/${userId}`);
	return response.data;
};

export const getUserById = async (userId) => {
	const response = await api.get(`/users/${userId}`);
	return response.data;
};
