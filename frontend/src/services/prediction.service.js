import api from "../api/api";

export const predictThermalImage = async (file) => {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post("/predict", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	return response.data;
};
