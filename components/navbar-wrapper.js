"use client";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { usePathname } from "next/navigation";

export default function NavbarWrapper({ children }) {
  const pathname = usePathname();
  const showNavbar = !pathname.startsWith("/admin");
  const showFooter = !pathname.startsWith("/admin");
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
      {showFooter && <Footer />}
    </>
  );
}
