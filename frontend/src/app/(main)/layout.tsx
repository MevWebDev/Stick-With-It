import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col">
      <Topbar />
      <div className="flex-grow">{children}</div>
      <Navbar />
    </div>
  );
}
