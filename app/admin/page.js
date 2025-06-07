'use client';

import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import Image from 'next/image';
import Link from 'next/link';

const safeFields = [
  'logo', 'favicon', 'tabTitle', 'footerCompany', 'github', 'xbox', 'instagram', 'discord', 'ip',
  'carouselImages', 'aboutContent', 'backgroundColor', 'backgroundImage'
];

export function buildSafeSettings(base, overrides = {}) {
  const result = {};
  for (const key of safeFields) {
    let value = overrides.hasOwnProperty(key) ? overrides[key] : (base && base.hasOwnProperty(key) ? base[key] : undefined);
    if (key === 'backgroundImage' && typeof value !== 'string') value = '';
    if (key === 'backgroundColor' && typeof value !== 'string') value = '';
    if (Array.isArray(value)) value = value.filter(v => typeof v === 'string');
    result[key] = value;
  }
  return deepSanitize(result);
}

function deepSanitize(obj, seen = new WeakSet()) {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (seen.has(obj)) return undefined;
  seen.add(obj);
  const isPlainObject = Object.prototype.toString.call(obj) === '[object Object]';
  if (!isPlainObject && !Array.isArray(obj)) return undefined;
  if (Array.isArray(obj)) return obj.map(item => deepSanitize(item, seen)).filter(v => v !== undefined);
  const plain = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const val = obj[key];
    if (typeof val === 'function') continue;
    if (val && typeof val === 'object') {
      const nested = deepSanitize(val, seen);
      if (nested !== undefined) plain[key] = nested;
      continue;
    }
    if (["string", "number", "boolean"].includes(typeof val) || val === null) {
      plain[key] = val;
    }
  }
  return plain;
}

function GenelAyarlar() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [footerAndTab, setFooterAndTab] = useState("");
  const [success, setSuccess] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const [backgroundSaving, setBackgroundSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setFooterAndTab(data.footerCompany || data.tabTitle || "");
        setBackgroundColor(data.backgroundColor || "rgba(38,42,102,0.7)");
        setLoading(false);
      });
  }, []);

  function colorToHex(rgba) {
    if (!rgba) return '#262a66';
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#262a66';
    return (
      '#' +
      [1, 2, 3]
        .map(i => parseInt(match[i]).toString(16).padStart(2, '0'))
        .join('')
    );
  }
  function hexToRgba(hex, oldRgba) {
    if (!hex.startsWith('#') || hex.length !== 7) return oldRgba || 'rgba(38,42,102,0.7)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    let alpha = 0.7;
    if (oldRgba && oldRgba.includes(',')) {
      const parts = oldRgba.split(',');
      if (parts.length === 4) alpha = parseFloat(parts[3]);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }

  async function handleBackgroundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBackgroundUploading(true);
    const res = await fetch('/api/settings/upload-file', {
      method: 'POST',
      headers: { 'x-filename': file.name },
      body: file
    });
    setBackgroundUploading(false);
    if (!res.ok) {
      setSuccess('');
      setError('Yükleme başarısız!');
      return;
    }
    const data = await res.json();
    const newFileName = data.filename;
    const apiUrl = `/api/settings/get-uploaded-file?file=${newFileName}`;
    const reallySafe = buildSafeSettings(settings, { backgroundImage: newFileName, backgroundImageUrl: apiUrl, backgroundColor });
    setSettings(reallySafe);
    await handleBackgroundSave(newFileName, backgroundColor);
  }

  async function handleBackgroundSave(newImage, newColor) {
    setBackgroundSaving(true);
    const imageToSave = newImage || settings?.backgroundImage;
    const colorToSave = newColor || backgroundColor;
    const safeSettings = buildSafeSettings(settings, { backgroundImage: imageToSave, backgroundColor: colorToSave });
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeSettings)
    });
    await fetch('/api/settings/bgcss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backgroundImage: imageToSave, backgroundColor: colorToSave, uploaded: true })
    });
    setSettings(s => buildSafeSettings(s, { backgroundImage: imageToSave, backgroundColor: colorToSave }));
    setSuccess("Arkaplan ayarları kaydedildi!");
    setBackgroundSaving(false);
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    const res = await fetch('/api/settings/upload-file', {
      method: 'POST',
      headers: { 'x-filename': file.name },
      body: file
    });
    setLogoUploading(false);
    if (!res.ok) {
      setSuccess('');
      setError('Logo yükleme başarısız!');
      return;
    }
    const data = await res.json();
    const newFileName = data.filename;
    const apiUrl = `/api/settings/get-uploaded-file?file=${newFileName}`;
    const reallySafe = buildSafeSettings(settings, { logo: newFileName, logoUrl: apiUrl, favicon: newFileName });
    setSettings(reallySafe);
    await handleSave(reallySafe);
  }

  async function handleSave(newSettings) {
    setSuccess("");
    const safeSettings = deepSanitize(newSettings);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeSettings),
    });
    setSuccess("Ayarlar kaydedildi!");
  }

  if (loading) return <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>;
  return (
    <div>
      <h1>Genel Ayarlar</h1>
      {success && <div className="alert alert-success mb-2">{success}</div>}
      <h3>Arkaplan</h3>
      <div className="mb-2">
        <div className="mb-2">
          <Image className="img-fluid mb-2" src={settings?.backgroundImage ? `/api/settings/get-uploaded-file?file=${settings.backgroundImage}` : '/bg.jpg'} style={{borderRadius:8}} alt="Arkaplan" width={128} height={64} />
          <input className="form-control" type="file" accept="image/*" onChange={handleBackgroundUpload} disabled={backgroundUploading} />
          {backgroundUploading && <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>}
        </div>
        <div className="mb-2">
          <input type="text" className="form-control" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} placeholder="ör: rgba(38,42,102,0.7)" />
          <input type="color" className="form-control form-control-color mt-2" value={colorToHex(backgroundColor)} onChange={e => setBackgroundColor(hexToRgba(e.target.value, backgroundColor))} title="Renk seç" />
          <button className="btn btn-success mt-2" onClick={() => handleBackgroundSave()} disabled={backgroundSaving}>Kaydet</button>
          {backgroundSaving && <span className="ms-2 spinner-border spinner-border-sm"></span>}
        </div>
      </div>
      <hr/>
      <h3>Logo</h3>
      <div className="mb-2">
        <div>
          <Image className="img-fluid mb-2" src={settings?.logo ? `/api/settings/get-uploaded-file?file=${settings.logo}` : '/default.png'} alt="Logo" width={64} height={16} />
          <input className="form-control" type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} />
          {logoUploading && <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>}
        </div>
      </div>
      <hr/>
      <h3>Footer ve Sekme Adı</h3>
      <div className="mb-2">
        <input type="text" className="form-control mb-2" value={footerAndTab} onChange={e => setFooterAndTab(e.target.value)} placeholder="Footer ve Sekme Adı" />
        <button className="btn btn-success" onClick={() => handleSave({ ...settings, footerCompany: footerAndTab, tabTitle: footerAndTab })}>Değiştir ve Kaydet</button>
      </div>
      <hr/>
      <h3>Footer Github, XBOX ve Instagram</h3>
      <div className="mb-2">
        <input type="text" className="form-control mb-2" value={settings?.github || ""} onChange={e => setSettings(s => deepSanitize({ ...s, github: e.target.value }))} placeholder="Github Linki" />
        <input type="text" className="form-control mb-2" value={settings?.xbox || ""} onChange={e => setSettings(s => deepSanitize({ ...s, xbox: e.target.value }))} placeholder="XBOX Linki" />
        <input type="text" className="form-control mb-2" value={settings?.instagram || ""} onChange={e => setSettings(s => deepSanitize({ ...s, instagram: e.target.value }))} placeholder="Instagram Linki" />
        <button className="btn btn-success" onClick={() => handleSave(settings)}>Değiştir ve Kaydet</button>
      </div>
      <hr/>
      <h3>Navbar Discord</h3>
      <div className="mb-2">
        <input type="text" className="form-control mb-2" value={settings?.discord || ""} onChange={e => setSettings(s => deepSanitize({ ...s, discord: e.target.value }))} placeholder="Discord Linki" />
        <button className="btn btn-success" onClick={() => handleSave(settings)}>Değiştir ve Kaydet</button>
      </div>
      <hr/>
      <h3>Navbar IP Adresi</h3>
      <div className="mb-2">
        <input type="text" className="form-control mb-2" value={settings?.ip || ""} onChange={e => setSettings(s => deepSanitize({ ...s, ip: e.target.value }))} placeholder="IP Adresi" />
        <button className="btn btn-success" onClick={() => handleSave(settings)}>Değiştir ve Kaydet</button>
      </div>
    </div>
  );
}

function KullaniciSatir({ user, onDelete, onRoleChange, sessionUser }) {
  const isSelf = sessionUser && user.id === sessionUser.userId;
  return (
    <tr>
      <th scope="row">{user.id}</th>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.role && user.role.toUpperCase()}</td>
      <td>
        <button className="btn btn-sm btn-danger me-2" onClick={() => onDelete(user.id)} disabled={isSelf}><i className="bi bi-trash-fill"></i></button>
        <button className="btn btn-sm btn-secondary me-2" onClick={() => onRoleChange(user, 'USER')} disabled={isSelf}>Rol Düşür</button>
        <button className="btn btn-sm btn-primary" onClick={() => onRoleChange(user, 'ADMIN')} disabled={isSelf}>Rol Artır</button>
      </td>
    </tr>
  );
}

function Kullanicilar() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [sessionUser, setSessionUser] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetch("/api/user")
      .then(r => r.json())
      .then(data => {
        setUsers(Array.isArray(data.user) ? data.user : (data.user ? [data.user] : []));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('/api/session').then(r => r.json()).then(data => setSessionUser(data.user));
  }, []);

  async function handleDelete(id) {
    setError(""); setSuccess("");
    const res = await fetch(`/api/user?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(users => users.filter(u => u.id !== id));
      setSuccess("Kullanıcı silindi.");
    } else {
      setError("Kullanıcı silinemedi.");
    }
  }

  async function handleRoleChange(user, newRole) {
    setError(""); setSuccess("");
    if (!sessionUser) {
      setError("Oturum bilgisi alınamadı.");
      return;
    }
    if (user.id === sessionUser.userId) {
      setError("Kendi rolünüzü değiştiremezsiniz.");
      return;
    }
    if (user.role === newRole) {
      setError(`Kullanıcının rolü zaten ${newRole}.`);
      return;
    }
    const res = await fetch(`/api/user?name=${encodeURIComponent(user.name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      setUsers(users => users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      setSuccess(`Kullanıcı rolü değiştirildi: ${user.name} → ${newRole}.`);
    } else {
      setError("Rol değiştirilemedi.");
    }
  }

  const totalPages = Math.ceil(users.length / pageSize);
  const pagedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>;
  return (
    <div>
      <h1>Kullanıcılar</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="table-scroll-x">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Kullanıcı Adı</th>
              <th scope="col">E-Posta Adresi</th>
              <th scope="col">Rol</th>
              <th scope="col">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map(user => <KullaniciSatir key={user.id} user={user} onDelete={handleDelete} onRoleChange={handleRoleChange} sessionUser={sessionUser} />)}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <nav aria-label="Kullanıcılar Sayfalandırma">
          <ul className="pagination justify-content-center pagination-dark">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Önceki</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Sonraki</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

function Yorumlar() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [modalContent, setModalContent] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetch("/api/comment")
      .then(r => r.json())
      .then(data => {
        setComments(Array.isArray(data.comments) ? data.comments : (data.comments ? [data.comments] : []));
        setLoading(false);
      });
  }, []);

  async function handleDelete(id) {
    setError(""); setSuccess("");
    const res = await fetch(`/api/comment?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments(comments => comments.filter(c => c.id !== id));
      setSuccess("Yorum silindi.");
    } else {
      setError("Yorum silinemedi.");
    }
  }

  function handleShow(comment) {
    setModalContent(comment);
  }

  function handleCloseModal() {
    setModalContent(null);
  }

  const totalPages = Math.ceil(comments.length / pageSize);
  const pagedComments = comments.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>;
  return (
    <div>
      <h1>Yorumlar</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="table-scroll-x">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Yorumu Yapan Kullanıcı</th>
              <th scope="col">Yorum Yapılan Kullanıcı</th>
              <th scope="col">Yorum İçeriği</th>
              <th scope="col">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pagedComments.map(comment => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
                <td>{comment.user && comment.user.name ? comment.user.name : '-'}</td>
                <td>{comment.profile && comment.profile.name ? comment.profile.name : '-'}</td>
                <td>{comment.content.length > 40 ? comment.content.slice(0, 40) + '...' : comment.content}</td>
                <td>
                  <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(comment.id)}><i className="bi bi-trash-fill"></i></button>
                  <button className="btn btn-sm btn-primary text-white" onClick={() => handleShow(comment)}><i className="bi bi-eye-fill"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <nav aria-label="Yorumlar Sayfalandırma">
          <ul className="pagination justify-content-center pagination-dark">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Önceki</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Sonraki</button>
            </li>
          </ul>
        </nav>
      )}
      {modalContent && (
        <div className="modal show d-block" tabIndex="-1" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title">Yorum Detayı</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body" style={{maxHeight: '60vh', overflow: 'auto', wordBreak: 'break-word'}}>
                <p><b>ID:</b> {modalContent.id}</p>
                <p><b>Yorumu Yapan:</b> {modalContent.user && modalContent.user.name ? modalContent.user.name : '-'}</p>
                <p><b>Yorum Yapılan:</b> {modalContent.profile && modalContent.profile.name ? modalContent.profile.name : '-'}</p>
                <p><b>İçerik:</b> {modalContent.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Talepler() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [modalContent, setModalContent] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetch("/api/ticket")
      .then(r => r.json())
      .then(data => {
        setTickets(Array.isArray(data.tickets) ? data.tickets : (data.tickets ? [data.tickets] : []));
        setLoading(false);
      });
  }, []);

  async function handleDelete(id) {
    setError(""); setSuccess("");
    const res = await fetch(`/api/ticket?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setTickets(tickets => tickets.filter(t => t.id !== id));
      setSuccess("Talep silindi.");
    } else {
      setError("Talep silinemedi.");
    }
  }

  function handleShow(ticket) {
    setModalContent(ticket);
  }

  function handleCloseModal() {
    setModalContent(null);
  }

  async function handleAnswer(ticket) {
    const answer = window.prompt('Yanıtınızı girin:');
    if (!answer) return;
    setError(""); setSuccess("");
    const res = await fetch(`/api/ticket?id=${ticket.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: `Cevaplandı: ${answer}` })
    });
    if (res.ok) {
      setTickets(tickets => tickets.map(t => t.id === ticket.id ? { ...t, status: `Cevaplandı: ${answer}` } : t));
      setSuccess("Talep yanıtlandı.");
    } else {
      setError("Yanıt kaydedilemedi.");
    }
  }

  const totalPages = Math.ceil(tickets.length / pageSize);
  const pagedTickets = tickets.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>;
  return (
    <div>
      <h1>Destek Talepleri</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="table-scroll-x">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Kullanıcı</th>
              <th scope="col">Konu</th>
              <th scope="col">Açıklama</th>
              <th scope="col">Durum</th>
              <th scope="col">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pagedTickets.map(ticket => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.user && ticket.user.name ? ticket.user.name : '-'}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.description && ticket.description.length > 40 ? ticket.description.slice(0, 40) + '...' : ticket.description}</td>
                <td>{ticket.status || 'Cevaplanmadı'}</td>
                <td>
                  <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(ticket.id)}><i className="bi bi-trash-fill"></i></button>
                  <button className="btn btn-sm btn-primary text-white" onClick={() => handleShow(ticket)}><i className="bi bi-eye-fill"></i></button>
                  {ticket.status === 'Cevaplanmadı' && (
                    <button className="btn btn-sm btn-success ms-2" onClick={() => handleAnswer(ticket)}><i className="bi bi-reply-fill"></i></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <nav aria-label="Talepler Sayfalandırma">
          <ul className="pagination justify-content-center pagination-dark">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Önceki</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Sonraki</button>
            </li>
          </ul>
        </nav>
      )}
      {modalContent && (
        <div className="modal show d-block" tabIndex="-1" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title">Talep Detayı</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body" style={{maxHeight: '60vh', overflow: 'auto', wordBreak: 'break-word'}}>
                <p><b>ID:</b> {modalContent.id}</p>
                <p><b>Kullanıcı:</b> {modalContent.user && modalContent.user.name ? modalContent.user.name : '-'}</p>
                <p><b>Konu:</b> {modalContent.subject}</p>
                <p><b>Açıklama:</b> {modalContent.description}</p>
                <p><b>Durum:</b> {modalContent.status || 'Cevaplanmadı'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Veritabani() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleReset() {
    if (!window.confirm("Tüm veritabanı, kullanıcılar, yorumlar ve ayarlar sıfırlanacak. Emin misiniz?")) return;
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await fetch('/api/logout', { method: 'POST' });
        setSuccess("Veritabanı başarıyla sıfırlandı! Oturum kapatılıyor...");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 1200);
      } else {
        setError("Sıfırlama başarısız oldu.");
      }
    } catch (e) {
      setError("Bir hata oluştu.");
    }
    setLoading(false);
  }

  return (
    <div>
      <h1>Veritabanı</h1>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <h3>Yedekleme</h3>
      <div className="text-warning small mb-3">
        Güncel veritabanı içeriğini sqlite dosyası olarak indirebilirsiniz. Bu dosya, veritabanınızı yedeklemek için kullanılabilir.
        </div>
        <div className="mb-3">
        <button className="btn btn-primary" onClick={() => {
          window.open('/api/backup', '_blank');
        }}>
          İndir
        </button>
      </div>
      <hr />
      <h3>Sıfırlama</h3>
      <div className="text-warning small mb-3">Bu işlem tüm website içeriğini, kullanıcıları, yorumları, talepleri, sayfaları, rozetleri, galeriyi ve ayarları geri döndürülemez şekilde sıfırlar.</div>
      <div>
        <button className="btn btn-danger" onClick={handleReset} disabled={loading}>
          {loading ? <div className="text-white text-center spinner-border mt-1" role="status"><span className="visually-hidden">Sıfırlanıyor...</span></div> : "Sıfırla"}
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalComments: 0,
    firstCommentDate: null,
    lastCommentDate: null,
    totalUsers: 0,
    firstUserDate: null,
    lastUserDate: null,
    loading: true,
    chartData: [],
    ticketStats: null,
    badgeStats: null,
    ticketChartData: []
  });

  useEffect(() => {
    async function fetchStats() {
      const commentRes = await fetch('/api/comment');
      let comments = [];
      if (commentRes.ok) {
        const data = await commentRes.json();
        comments = Array.isArray(data.comments) ? data.comments : (data.comments ? [data.comments] : []);
      }
      const userRes = await fetch('/api/user');
      let users = [];
      if (userRes.ok) {
        const data = await userRes.json();
        users = Array.isArray(data.user) ? data.user : (data.user ? [data.user] : []);
      }
      const ticketRes = await fetch('/api/ticket');
      let tickets = [];
      if (ticketRes.ok) {
        const data = await ticketRes.json();
        tickets = Array.isArray(data.tickets) ? data.tickets : (data.tickets ? [data.tickets] : []);
      }
      const totalTickets = tickets.length;
      const answeredTickets = tickets.filter(t => t.status && t.status.startsWith('Cevaplandı')).length;
      const unansweredTickets = tickets.filter(t => !t.status || t.status === 'Cevaplanmadı').length;
      const badgeRes = await fetch('/api/badge');
      let badges = [];
      if (badgeRes.ok) badges = await badgeRes.json();
      const userBadgeRes = await fetch('/api/user-badge-all');
      let userBadges = [];
      if (userBadgeRes.ok) userBadges = await userBadgeRes.json();
      const badgeCounts = {};
      userBadges.forEach(ub => {
        badgeCounts[ub.badgeId] = (badgeCounts[ub.badgeId] || 0) + 1;
      });
      const badgeInfo = {};
      badges.forEach(b => { badgeInfo[b.id] = b; });
      let firstCommentDate = null, lastCommentDate = null;
      if (comments.length > 0) {
        const sorted = [...comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        firstCommentDate = sorted[0].createdAt;
        lastCommentDate = sorted[sorted.length - 1].createdAt;
      }
      let firstUserDate = null, lastUserDate = null;
      if (users.length > 0) {
        const sorted = [...users].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        firstUserDate = sorted[0].createdAt;
        lastUserDate = sorted[sorted.length - 1].createdAt;
      }
      const days = 30;
      const today = new Date();
      const chartData = [];
      const userDates = users.map(u => u.createdAt && u.createdAt.slice(0, 10)).filter(Boolean).sort();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        const totalUsersSoFar = userDates.filter(date => date <= dayStr).length;
        chartData.push({
          date: dayStr,
          comments: comments.filter(c => c.createdAt && c.createdAt.slice(0, 10) === dayStr).length,
          users: totalUsersSoFar
        });
      }
      const ticketChartData = [];
      if (tickets.length > 0) {
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayStr = d.toISOString().slice(0, 10);
          ticketChartData.push({
            date: dayStr,
            total: tickets.filter(t => t.createdAt && t.createdAt.slice(0, 10) === dayStr).length,
            answered: tickets.filter(t => t.createdAt && t.createdAt.slice(0, 10) === dayStr && t.status && t.status.startsWith('Cevaplandı')).length,
            unanswered: tickets.filter(t => t.createdAt && t.createdAt.slice(0, 10) === dayStr && (!t.status || t.status === 'Cevaplanmadı')).length
          });
        }
      }
      setStats({
        totalComments: comments.length,
        firstCommentDate,
        lastCommentDate,
        totalUsers: users.length,
        firstUserDate,
        lastUserDate,
        loading: false,
        chartData,
        ticketStats: {
          total: totalTickets,
          answered: answeredTickets,
          unanswered: unansweredTickets
        },
        badgeStats: {
          badgeCounts,
          badgeInfo
        },
        ticketChartData,
      });
    }
    fetchStats();
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('tr-TR');
  }

  if (stats.loading) return <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>;
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="row g-4">
      <div className="col-md-12">
      <div className="card bg-dark text-light mb-3">
        <div className="card-header">Son 30 Günlük Aktivite</div>
        <div className="card-body" style={{height: 256}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} fontSize={12}/>
              <YAxis fontSize={12}/>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div style={{ background: '#222', color: '#fff', borderRadius: 8, padding: 12, border: '1px solid #444', boxShadow: '0 2px 8px #0008' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{label}</div>
                      {payload.map((entry, i) => (
                        <div key={i} style={{ color: '#fff' }}>
                          {entry.name === 'comments' ? 'Yorum' : entry.name === 'users' ? 'Kullanıcı' : entry.name}: <b>{entry.value}</b>
                        </div>
                      ))}
                    </div>
                  );
                }}
                labelFormatter={l => l}
              />
              <Legend />
              <Area type="monotone" dataKey="comments" stroke="#8884d8" fillOpacity={1} fill="url(#colorComments)" name="Yorum" />
              <Area type="monotone" dataKey="users" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUsers)" name="Kullanıcı" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
      <div className="col-md-12">
        <div className="card bg-dark text-light mb-3">
          <div className="card-header">Son 30 Günlük Talepler</div>
          <div className="card-body" style={{height: 256}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ticketChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} fontSize={12} stroke="#ccc" />
                <YAxis fontSize={12} stroke="#ccc" />
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <Tooltip
                  contentStyle={{ background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 8, opacity: 0.98 }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name) => {
                    if (name === 'Toplam') return [value, 'Toplam'];
                    if (name === 'Cevaplanan') return [value, 'Cevaplanan'];
                    if (name === 'Cevaplanmayan') return [value, 'Cevaplanmayan'];
                    if (name === 'total') return [value, 'Toplam'];
                    if (name === 'answered') return [value, 'Cevaplanan'];
                    if (name === 'unanswered') return [value, 'Cevaplanmayan'];
                    return [value, name];
                  }}
                  labelFormatter={l => l}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="total" fill="#0dcaf0" name="Toplam" key="total" />
                <Bar dataKey="answered" fill="#82ca9d" name="Cevaplanan" key="answered" />
                <Bar dataKey="unanswered" fill="#e74c3c" name="Cevaplanmayan" key="unanswered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card bg-dark text-light mb-3">
          <div className="card-header"><i className="bi bi-ticket-fill me-1"></i> Toplam Talep</div>
          <div className="card-body">
            <h3 className="card-title">{stats.ticketStats?.total ?? '-'}</h3>
            <p className="card-text mb-1"><b>Cevaplanan:</b> {stats.ticketStats?.answered ?? '-'}</p>
            <p className="card-text mb-1"><b>Cevaplanmayan:</b> {stats.ticketStats?.unanswered ?? '-'}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card bg-dark text-light mb-3">
          <div className="card-header"><i className="bi bi-award me-1"></i> Rozetler</div>
          <div className="card-body">
              {stats.badgeStats && Object.entries(stats.badgeStats.badgeCounts).map(([badgeId, count]) => {
                const badge = stats.badgeStats.badgeInfo[badgeId];
                return (
                  <p key={badgeId}>
                    <span
                      style={{background:badge?.bgColor||'#0dcaf0',borderRadius:8,padding:'2px 8px',display:'inline-block',marginRight:8}}
                      title={badge?.description || 'Rozet'}
                    >
                      {badge?.icon && <i className={`bi bi-${badge.icon}`} style={{fontSize:'1.2em',verticalAlign:'middle'}}></i>}
                    </span>
                    : <b>{count}</b> kullanıcı
                  </p>
                );
              })}
              {stats.badgeStats && Object.keys(stats.badgeStats.badgeCounts).length === 0 && <p>Hiç rozet verilmemiş.</p>}
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card bg-dark text-light">
          <div className="card-header">
            <i className="bi bi-envelope me-1"></i> Toplam Yorum
          </div>
          <div className="card-body">
            <h3 className="card-title">{stats.totalComments}</h3>
            <p className="card-text mb-1"><b>İlk Yorum:</b> {formatDate(stats.firstCommentDate)}</p>
            <p className="card-text"><b>Son Yorum:</b> {formatDate(stats.lastCommentDate)}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card bg-dark text-light">
          <div className="card-header">
            <i className="bi bi-people me-1"></i> Toplam Kullanıcı
          </div>
          <div className="card-body">
            <h3 className="card-title">{stats.totalUsers}</h3>
            <p className="card-text mb-1"><b>İlk Kayıt:</b> {formatDate(stats.firstUserDate)}</p>
            <p className="card-text"><b>Son Kayıt:</b> {formatDate(stats.lastUserDate)}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function Sayfalar() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carouselUploading, setCarouselUploading] = useState(false);
  const [aboutContent, setAboutContent] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [carouselFile, setCarouselFile] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setAboutContent(data.aboutContent || "");
        setLoading(false);
      });
  }, []);

  async function handleDeleteImage(filename) {
    if (!window.confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    const newImages = (settings.carouselImages || []).filter(img => img !== filename);
    const safeSettings = buildSafeSettings(settings, { carouselImages: newImages });
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeSettings)
    });
    setSettings(s => buildSafeSettings(s, { carouselImages: newImages }));
    setSuccess("Görsel silindi!");
  }

  async function handleCarouselUpload() {
    if (!carouselFile) return;
    setCarouselUploading(true);
    const res = await fetch('/api/settings/upload-file', {
      method: 'POST',
      headers: { 'x-filename': carouselFile.name },
      body: carouselFile
    });
    setCarouselUploading(false);
    if (res.ok) {
      const data = await res.json();
      const newFileName = `/api/settings/get-uploaded-file?file=${data.filename}`;
      const newImages = [...(settings.carouselImages || []), newFileName];
      const safeSettings = buildSafeSettings(settings, { carouselImages: newImages });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeSettings)
      });
      setSettings(s => buildSafeSettings(s, { carouselImages: newImages }));
      setSuccess("Görsel yüklendi!");
      setCarouselFile(null);
    } else {
      setError("Yükleme başarısız oldu.");
    }
  }

  async function handleAboutSave() {
    setSuccess(""); setError("");
    const safeSettings = buildSafeSettings(settings, { aboutContent });
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeSettings)
    });
    setSettings(s => buildSafeSettings(s, { aboutContent }));
    setSuccess("Hakkımızda metni kaydedildi!");
  }

  if (loading) return <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>;
  return (
    <div>
      <h1>Sayfalar</h1>
      {success && <div className="alert alert-success mb-2">{success}</div>}
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      <h3>Anasayfa Geçiş Kapakları</h3>
      <div className="mb-2 d-flex flex-wrap">
        {(settings.carouselImages || []).map((img, i) => (
          <figure className="figure col-md-4 me-2 mb-2" key={img}>
            {(img.endsWith('.png') && (img.startsWith('slide') || img.startsWith('/slide')))
              ? <Image className="img-fluid rounded mb-1" src={`/${img.replace(/^\//, '')}`} alt="Slide" width={512} height={256}/>
              : <Image className="img-fluid rounded mb-1" src={img.startsWith('/api/settings/get-uploaded-file?file=') ? img : `/api/settings/get-uploaded-file?file=${img}`} alt="Slide" width={512} height={256} unoptimized />
            }
            <figcaption className="figure-caption text-center">
              <button className="btn btn-danger btn-sm w-100" onClick={() => handleDeleteImage(img)}><i className="bi bi-trash-fill"></i></button>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mb-2">
        <input className="form-control mb-2" type="file" accept="image/*" onChange={e => setCarouselFile(e.target.files[0])} />
        <button className="btn btn-success" onClick={handleCarouselUpload} disabled={carouselUploading || !carouselFile}>Yükle</button>
        {carouselUploading && <span className="ms-2 spinner-border spinner-border-sm"></span>}
      </div>
      <hr />
      <h3>Hakkımızda</h3>
      <div className="mb-2">
        <textarea className="form-control mb-2" rows="20" placeholder={aboutContent} value={aboutContent} onChange={e => setAboutContent(e.target.value)} />
        <button className="btn btn-success" onClick={handleAboutSave}>Değiştir ve Kaydet</button>
      </div>
    </div>
  );
}

function Rozetler() {
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [newBadge, setNewBadge] = useState({ description: '', icon: '', bgColor: '' });
  const [username, setUsername] = useState('');
  const [userBadges, setUserBadges] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBadges();
    fetchUsers();
  }, []);

  async function fetchBadges() {
    const res = await fetch('/api/badge');
    if (res.ok) setBadges(await res.json());
  }
  async function fetchUsers() {
    const res = await fetch('/api/user');
    if (res.ok) {
      const data = await res.json();
      setUsers(Array.isArray(data.user) ? data.user : (data.user ? [data.user] : []));
    }
  }
  async function handleCreateBadge() {
    setError(''); setSuccess('');
    if (!newBadge.description) return setError('Rozet açıklaması gerekli');
    const res = await fetch('/api/badge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBadge) });
    if (res.ok) {
      setSuccess('Rozet oluşturuldu!');
      setNewBadge({ description: '', icon: '', bgColor: '' });
      fetchBadges();
    } else setError('Rozet oluşturulamadı');
  }
  async function handleDeleteBadge(id) {
    if (!window.confirm('Rozeti silmek istediğinize emin misiniz?')) return;
    setError(''); setSuccess('');
    const res = await fetch('/api/badge', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) {
      setSuccess('Rozet silindi!');
      fetchBadges();
    } else setError('Rozet silinemedi');
  }
  async function handleAssignBadge() {
    setError(''); setSuccess('');
    if (!username || !selectedBadge) return setError('Kullanıcı ve rozet seçin');
    const res = await fetch('/api/user-badge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, badgeId: selectedBadge }) });
    if (res.ok) {
      setSuccess('Rozeti kullanıcıya verildi!');
      fetchUserBadges();
    } else setError('Rozet verme işlemi başarısız');
  }
  const fetchUserBadges = useCallback(async () => {
    if (!username) return setUserBadges([]);
    const res = await fetch(`/api/user-badge?username=${encodeURIComponent(username)}`);
    if (res.ok) setUserBadges(await res.json());
    else setUserBadges([]);
  }, [username]);
  async function handleRemoveUserBadge(badgeId) {
    if (!username) return;
    const res = await fetch('/api/user-badge', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, badgeId }) });
    if (res.ok) fetchUserBadges();
  }
  useEffect(() => {
    fetchUserBadges();
  }, [fetchUserBadges]);

  return (
    <div>
      <h1>Rozetler</h1>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <h3>Rozet Oluştur</h3>
      <div className="mb-3 d-flex flex-wrap align-items-end">
        <input className="form-control me-2 mb-2" style={{maxWidth:300}} placeholder="Açıklama" value={newBadge.description} onChange={e => setNewBadge(b => ({...b, description: e.target.value}))} />
        <input className="form-control me-2 mb-2" style={{maxWidth:200}} placeholder="İkon" value={newBadge.icon} onChange={e => setNewBadge(b => ({...b, icon: e.target.value}))} />
        <input className="form-control me-2 mb-2" style={{maxWidth:150}} placeholder="#000000" value={newBadge.bgColor || ''} onChange={e => setNewBadge(b => ({...b, bgColor: e.target.value}))} />
        <button className="btn btn-success mb-2" onClick={handleCreateBadge}>Oluştur</button>
      </div>
      <div className="card bg-transparent mb-3 text-light">
        <div className="card-body">
          <i className="bi bi-info-square ms-1 me-3"></i>İkon listesine göz atmak için <Link href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-light">buraya</Link> tıklayabilirsiniz.
        </div>
      </div>
      <hr />
      <h3>Rozet Ver</h3>
      <div className="mb-3 d-flex flex-wrap align-items-end">
        <select className="form-select me-2 mb-2" style={{maxWidth:200}} value={username} onChange={e => setUsername(e.target.value)}>
          <option value="">Kullanıcı</option>
          {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
        </select>
        <select className="form-select me-2 mb-2" style={{maxWidth:200}} value={selectedBadge || ''} onChange={e => setSelectedBadge(Number(e.target.value))}>
          <option value="">Rozet</option>
          {badges.map(b => <option key={b.id} value={b.id}>{b.description}</option>)}
        </select>
        <button className="btn btn-primary mb-2" onClick={handleAssignBadge}>Ver</button>
      </div>
      {username && (
        <div>
          <h5>{username}:</h5>
          <ul className="list-group">
            {userBadges.map(b => (
              <li key={b.id} className="list-group-item bg-dark text-light d-flex align-items-center justify-content-between">
                <span title={b.description} style={{background:b.bgColor||'#0dcaf0',borderRadius:8,padding:'2px 8px',display:'inline-block'}}>
                  {b.icon && <i className={`bi bi-${b.icon}`} style={{fontSize:'1.5em',marginRight:0,verticalAlign:'middle'}}></i>}
                </span>
                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveUserBadge(b.id)}><i className="bi bi-trash-fill"></i></button>
              </li>
            ))}
            {userBadges.length === 0 && <li className="list-group-item bg-dark text-light">Rozet yok.</li>}
          </ul>
        </div>
      )}
      <hr />
      <h3>Mevcut Rozetler</h3>
      <div className="table-scroll-x">
        <table className="table table-dark table-hover">
          <thead><tr><th>ID</th><th>Açıklama</th><th>İkon</th><th>Renk</th><th>İşlem</th></tr></thead>
          <tbody>
            {badges.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.description}</td>
                <td>{b.icon && (
                  <span><i className={`bi bi-${b.icon}`}></i></span>
                )}</td>
                <td><span>{b.bgColor||'-'}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteBadge(b.id)}><i className="bi bi-trash-fill"></i></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GaleriYonetimi() {
  const [images, setImages] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [newCaption, setNewCaption] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchImages(); }, []);

  async function fetchImages() {
    const res = await fetch('/api/gallery');
    if (res.ok) setImages(await res.json());
  }

  async function handleAddImage() {
    setError(''); setSuccess('');
    if (!newFile) return setError('Bir dosya seçmelisiniz.');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', newFile);
    const uploadRes = await fetch('/api/settings/upload-file', {
      method: 'POST',
      headers: { 'x-filename': newFile.name },
      body: newFile
    });
    if (!uploadRes.ok) {
      setError('Dosya yüklenemedi.');
      setUploading(false);
      return;
    }
    const uploadData = await uploadRes.json();
    const imageUrl = `/api/settings/get-uploaded-file?file=${uploadData.filename}`;
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, caption: newCaption })
    });
    setUploading(false);
    if (res.ok) {
      setSuccess('Görsel eklendi!');
      setNewFile(null);
      setNewCaption('');
      fetchImages();
    } else setError('Görsel eklenemedi');
  }

  async function handleDeleteImage(id) {
    if (!window.confirm('Görseli silmek istediğinize emin misiniz?')) return;
    setError(''); setSuccess('');
    const res = await fetch('/api/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      setSuccess('Görsel silindi!');
      fetchImages();
    } else setError('Görsel silinemedi');
  }

  return (
    <div>
      <h1>Galeri Yönetimi</h1>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <h3>Yeni Görsel Oluştur</h3>
      <div className="mb-3 d-flex flex-wrap align-items-end">
        <input className="form-control me-2 mb-2" style={{maxWidth:300}} type="file" accept="image/*" onChange={e => setNewFile(e.target.files[0])} />
        <input className="form-control me-2 mb-2" style={{maxWidth:300}} placeholder="Açıklama" value={newCaption} onChange={e => setNewCaption(e.target.value)} />
        <button className="btn btn-success mb-2" onClick={handleAddImage} disabled={uploading}>Oluştur</button>
      </div>
      <div className="card bg-transparent mb-3 text-light">
        <div className="card-body">
          <i className="bi bi-info-square ms-1 me-3"></i>Önerilen görsel boyutu: 1920x1080px. Yüklenen görseller <b>otomatik olarak</b> bu boyuta göre optimize edilir.
        </div>
      </div>
      <hr />
      <h3>Mevcut Galeri</h3>
      <div className="row">
        {images.map(img => (
          <div className="col-md-3 mb-4" key={img.id}>
            <figure className="figure bg-dark rounded p-2">
              <Image src={img.imageUrl} className="figure-img img-fluid rounded" alt={img.caption || 'Görsel'} width={400} height={300} />
              <figcaption className="figure-caption text-center text-secondary">{img.caption || <span className="text-center text-secondary">Açıklama yok</span>}</figcaption>
              <button className="btn btn-danger btn-sm mt-2 w-100" onClick={() => handleDeleteImage(img.id)}><i className="bi bi-trash-fill"></i></button>
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}

const menu = [
  { key: "dashboard", icon:"graph-up", label: "Dashboard", content: <Dashboard /> },
  { key: "genel", icon:"gear", label: "Genel Ayarlar", content: <GenelAyarlar /> },
  { key: "galeri", icon: "image-fill", label: "Galeri", content: <GaleriYonetimi /> },
  { key: "sayfalar", icon:"file-earmark-text", label: "Sayfalar", content: <Sayfalar /> },
  { key: "kullanicilar", icon:"people", label: "Kullanıcılar", content: <Kullanicilar /> },
  { key: "yorumlar", icon:"envelope", label: "Yorumlar", content: <Yorumlar /> },
  { key: "talepler", icon:"ticket-fill", label: "Talepler", content: <Talepler /> },
  { key: "rozetler", icon:"award", label: "Rozetler", content: <Rozetler /> },
  { key: "veritabani", icon:"database", label: "Veritabanı", content: <Veritabani /> },
];

export default function Admin() {
  const [active, setActive] = useState("dashboard");
  const activeContent = menu.find((m) => m.key === active)?.content || <div className="text-secondary">İçerik bulunamadı.</div>;

  return (
    <div className="container-fluid" style={{ minHeight: "100vh", background: "#181a1b" }}>
      <div className="row">
        <div className="col-md-2 col-12 bg-dark text-light p-0" style={{ minHeight: "100vh" }}>
          <div className="d-flex flex-column align-items-stretch pt-4">
            <Image src="/flyingheroes.png" className="img-fluid mx-auto mb-4" alt="Logo" width={192} height={96} />
            {menu.map((item) => (
              <button
                key={item.key}
                className={`btn text-start rounded-0 py-3 px-4 ${active === item.key ? "btn-light" : "btn-dark"}`}
                onClick={() => setActive(item.key)}
                style={{ fontWeight: active === item.key ? "bold" : "normal" }}
              >
                {item.icon && <i className={`bi bi-${item.icon} me-2`}></i>}{item.label}
              </button>
            ))}
              <button className="btn text-start rounded-0 py-3 px-4 btn-dark" onClick={() => window.location.href = "/"} style={{ fontWeight: "normal" }}><i className="bi bi-box-arrow-right me-2"></i> Anasayfa
              </button>
          </div>
        </div>
        <div className="col-md-10 col-12 p-4 bg-transparent text-light">
          <div className="bg-dark rounded p-4 shadow-sm min-vh-100">
            {activeContent}
          </div>
        </div>
      </div>
    </div>
  );
}
