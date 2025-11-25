import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-[100dvh] flex flex-col">
      <Topbar />
      <div className="flex-grow overflow-y-auto">{children}</div>
      <Navbar />
    </div>
  );
}
