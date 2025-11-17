import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ViewAccess from "./pages/ViewAccess";
import AccessLogs from "./pages/AccessLogs";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

function App() {
	return (
		<Router>
			<Routes>
				{/* Login Page */}
				<Route path="/login" element={<AdminLogin />} />
				{/* Protected Routes */}
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<Layout>
								<Home />
							</Layout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/view-access"
					element={
						<ProtectedRoute>
							<Layout>
								<ViewAccess />
							</Layout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/access-logs"
					element={
						<ProtectedRoute>
							<Layout>
								<AccessLogs />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/analytics"
					element={
						<ProtectedRoute>
							<Layout>
								<Analytics />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}

export default App;
