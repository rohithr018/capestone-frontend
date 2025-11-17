import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

export default function ProtectedRoute({ children }) {
	const [auth, setAuth] = useState(null);

	useEffect(() => {
		api
			.get("/admin/check")
			.then(() => setAuth(true))
			.catch(() => setAuth(false));
	}, []);

	if (auth === null) return <div>Loading...</div>;

	return auth ? children : <Navigate to="/login" />;
}
