import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className="h-[100dvh] flex flex-col">
        <Topbar />
        <div className="flex-grow overflow-y-auto">{children}</div>
        <Navbar />
      </div>
    </ProtectedRoute>
  );
}
