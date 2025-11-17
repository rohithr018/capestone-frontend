import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />

			{/* Add space below fixed header */}
			<main className="flex-grow">{children}</main>

			<Footer />
		</div>
	);
}
