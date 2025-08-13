import Navbar from "../navbar/navbar";

export default function BaseScreen({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="p-6">
        {children}
      </div>
    </>
  );
}
