import Navbar from "../Components/Navbar";
import Sidebar from "./sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800">
      <div className="shrink-0 z-30 relative border-b border-gray-100">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden relative bg-white">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-white relative z-0">
          {children}
        </div>
      </div>
    </div>
  );
}