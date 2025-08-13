import Navbar from "../navbar/navbar";

export default function BaseScreen({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex flex-col flex-1 p-6">
        {children}
      </div>
    </>
  );
}
