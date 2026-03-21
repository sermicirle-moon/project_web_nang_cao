import Navbar from "../Components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased">
      <Navbar />
      <main className="pt-20"> {/* Cách ra 20 đơn vị để không bị Navbar đè lên */}
        {children}
      </main>
      {/* Footer sẽ thêm ở đây sau */}
    </div>
  );
}