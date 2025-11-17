import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const showToast = useCallback((message, type = "success") => {
		const id = Date.now();
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => removeToast(id), 3500);
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className="fixed top-4 right-4 z-[9999] space-y-3">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={`
							min-w-[200px] max-w-xs px-4 py-3 rounded-lg shadow-lg text-sm text-white 
							animate-slideIn flex justify-between items-center gap-3
							${toast.type === "error" ? "bg-red-600" : "bg-green-600"}
						`}
					>
						<span>{toast.message}</span>
						<button
							className="opacity-70 hover:opacity-100"
							onClick={() => removeToast(toast.id)}
						>
							✖
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}
