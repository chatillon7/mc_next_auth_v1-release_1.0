"use client";
import { useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState(null);
  const [logoPulse, setLogoPulse] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);
  useEffect(() => {
    setLogoPulse(true);
    const timeout = setTimeout(() => setLogoPulse(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/profile?user=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
    <div className="container-fluid text-center text-light px-0 bg-transparent">
      <div className="row">
        <div className="col-4 d-flex align-items-center justify-content-center mx-auto">
          <button
            type="button"
            className="d-flex d-lg-flex align-items-center justify-content-center gap-2 col-6 mx-auto btn btn-outline-light"
            onClick={() => {
              navigator.clipboard.writeText(settings?.ip || 'IP Adresi');
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            title="Tıkla ve kopyala">
            {copied ? <><i className="bi bi-clipboard-check-fill"></i></> : <><i className="bi bi-clipboard"></i></>}
          </button>
        </div>
        <div className="col-4 py-2 mx-auto my-3">
          <Link href="/">
            <Image
              src={settings && settings.logo ? `/api/settings/get-uploaded-file?file=${settings.logo}` : "/default.png"}
              className={`img-fluid${logoPulse ? ' animate__animated animate__pulse' : ''}`}
              style={{ maxHeight: "128px", width: 'auto' }}
              alt="Logo"
              width={128}
              height={128}
            />
          </Link>
        </div>
        <div className="col-4 d-flex align-items-center justify-content-center mx-auto">
          <button
            type="button"
            className="d-grid gap-2 col-6 mx-auto btn btn-outline-light"
            onClick={() => window.open(settings?.discord || '#', '_blank')}
            title="Discord'a katıl"><i className="bi bi-discord"></i>
          </button>
        </div>
      </div>
      <nav className="navbar shadow-lg navbar-expand-lg navbar-light text-white mb-5" style={{background: "rgba(8, 8, 8, 0.85)", boxShadow: "0 0.5rem 1rem rgba(0,0,0,.25), 0 -0.5rem 1rem rgba(0,0,0,.15)"}}>
        <div className="container-fluid">
          <div className="d-flex w-100 align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="d-lg-none position-relative mx-2">
                <button
                  className="btn btn-dark"
                  type="button"
                  aria-label="Menüyü Aç"
                  onClick={() => setShowDropdown(v => !v)}
                >
                  <i className="bi bi-list"></i>
                </button>
                {showDropdown && (
                  <ul className="dropdown-menu dropdown-menu-dark show position-absolute start-0 mt-2" style={{zIndex: 999, minWidth: 272}}>
                    <li><Link className="dropdown-item" href="/"><i className="bi bi-house-door-fill me-1"></i> Anasayfa</Link></li>
                    <li><Link className="dropdown-item" href="/profile"><i className="bi bi-person-fill me-1"></i> Profilim</Link></li>
                    <li><Link className="dropdown-item" href="/dashboard"><i className="bi bi-graph-up me-1"></i> Dashboard</Link></li>
                    <li><Link className="dropdown-item" href="/galeri"><i className="bi bi-image-fill me-1"></i> Galeri</Link></li>
                    <li><Link className="dropdown-item" href="/hakkimizda"><i className="bi bi-info-square me-1"></i> Hakkımızda</Link></li>
                    <li><Link className="dropdown-item" href="/destek"><i className="bi bi-person-raised-hand me-1"></i> Destek</Link></li>
                  </ul>
                )}
              </div>
              <div className="d-flex align-items-center d-none d-lg-flex">
                <Link className="nav-link text-white ms-3" href="/"><button className="btn btn-dark"><i className="bi bi-house-door-fill me-1"></i> Anasayfa</button></Link>
                <Link className="nav-link text-white ms-3" href="/profile"><button className="btn btn-dark"><i className="bi bi-person-fill me-1"></i> Profilim</button></Link>
                <Link className="nav-link text-white mx-2" href="/dashboard" title="Dashboard"><button className="btn btn-dark mx-2"><i className="bi bi-graph-up me-1"></i> Dashboard</button></Link>
                <Link className="nav-link text-white me-2" href="/galeri" title="Galeri"><button className="btn btn-dark me-2"><i className="bi bi-image-fill me-1"></i> Galeri</button></Link>
                <Link className="nav-link text-white me-2" href="/hakkimizda" title="Hakkımızda"><button className="btn btn-dark me-2"><i className="bi bi-info-square me-1"></i> Hakkımızda</button></Link>
                <Link className="nav-link text-white me-2" href="/destek" title="Destek"><button className="btn btn-dark me-2"><i className="bi bi-person-raised-hand me-1"></i> Destek</button></Link>
              </div>
            </div>
            <form className="d-flex align-items-center justify-content-center" onSubmit={handleSearch} style={{maxWidth: '320px', width: '100%'}}>
              <input
                className="form-control bg-dark text-white border-0 me-2"
                type="search"
                placeholder="Profil Ara"
                aria-label="Profil Ara"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{maxWidth: "256px"}}
              />
              <button className="btn btn-dark me-2" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </nav>
    </div>
  );
}
