"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [year, setYear] = useState(null);
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="container-fluid bg-transparent text-white text-center py-3 mt-5">
      <div className="row">
        <div className="col-mb-4 d-flex align-items-center justify-content-center mx-auto">
          <Link href="/">
            <Image
              src={settings && settings.logo ? `/api/settings/get-uploaded-file?file=${settings.logo}` : "/default.png"}
              className="img-fluid"
              style={{ maxHeight: "64px", width: 'auto' }}
              alt="Logo"
              width={64}
              height={64}
            />
          </Link>
        </div>
        <div className="col-mb-4 d-flex align-items-center justify-content-center my-3 mx-auto">
          <Link href={settings?.github || "#"} className="text-white me-3"><i className="bi bi-github"></i></Link>
          <Link href={settings?.xbox || "#"} className="text-white me-3"><i className="bi bi-xbox"></i></Link>
          <Link href={settings?.instagram || "#"} className="text-white"><i className="bi bi-instagram"></i></Link>
        </div>
        {year && (
          <div className="col-mb-4 d-flex align-items-center justify-content-center mx-auto">
          {settings?.footerCompany || "Web App"}. Tüm hakları saklıdır. © {year}
          </div>
        )}
      </div>
    </footer>
  );
}
