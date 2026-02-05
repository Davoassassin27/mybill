import NavBar from "@/components/NavBar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-24"> {/* Padding para que el navbar no tape contenido */}
        {children}
      </div>
      <NavBar />
    </>
  );
}