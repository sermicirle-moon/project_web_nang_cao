import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}