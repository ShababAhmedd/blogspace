import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-16">{children}</main>
      <Footer />
    </>
  );
}
