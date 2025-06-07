'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './custom-bootstrap-overrides.css';
import "./pagination-dark.css";
import NavbarWrapper from "../components/navbar-wrapper";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);
  const faviconUrl = settings?.favicon ? `/api/settings/get-uploaded-file?file=${settings.favicon}` : "/default.png";
  useEffect(() => {
    if (faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [faviconUrl]);
  useEffect(() => {
    const id = 'dynamic-bg-css';
    let link = document.getElementById(id);
    if (link) link.remove();
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `/bg-image.css?v=${Date.now()}`;
    document.head.appendChild(link);
    return () => { if (link) link.remove(); };
  }, [settings?.backgroundImage, settings?.backgroundColor]);
  return (
    <html lang="en" style={{overflowX: 'hidden'}}>
      <head>
        <title>{settings?.tabTitle || "Web App"}</title>
        <link rel="icon" href={faviconUrl} />
        <link href="https://fonts.cdnfonts.com/css/proxima-nova" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
      </head>
      <body className={`bg-image`} style={{
        backgroundImage: settings?.backgroundImage ? `url('/api/settings/get-uploaded-file?file=${settings.backgroundImage}')` : undefined,
        backgroundColor: settings?.backgroundColor || undefined,
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
        backgroundSize: 'cover',
        minHeight: '100vh',
      }}>
        <NavbarWrapper>{children}</NavbarWrapper>
      </body>
    </html>
  );
}
