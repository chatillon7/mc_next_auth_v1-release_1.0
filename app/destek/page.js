"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';

export default function DestekPage() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/session')
      .then(r => r.json())
      .then(data => {
        if (!data.user || !data.user.userId) {
          window.location.href = '/auth/login';
        } else {
          fetchTickets(data.user.userId);
        }
      });
  }, []);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  async function fetchTickets(userId) {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/ticket?userId=${userId}`);
    if (!res.ok) {
      setTickets([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setTickets(Array.isArray(data.tickets) ? data.tickets : (data.tickets ? [data.tickets] : []));
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!subject || !description) {
      setError("Konu ve açıklama zorunlu.");
      return;
    }
    const res = await fetch("/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, description })
    });
    if (res.ok) {
      setSuccess("Talebiniz iletildi.");
      setSubject("");
      setDescription("");
      window.location.reload();
    } else {
      const data = await res.json();
      setError(data.error || "Bir hata oluştu.");
    }
  }

  function handleShow(ticket) {
    setModalContent(ticket);
  }
  function handleCloseModal() {
    setModalContent(null);
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-8 mx-auto">
          <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
            <div className="col-12 text-center mx-auto mb-3">
              <Image src="/flyingheroes.png" className="img-fluid" alt="Logo" width={320} height={128} />
            </div>
            <div className="col-12 mx-auto">
              <h1 className="fw-bolder">Yeni Destek Talebi</h1>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <h3>Konu</h3>
                <select className="form-select bg-dark text-white mb-3" value={subject} onChange={e => setSubject(e.target.value)} required>
                  <option value="" disabled>Konu Seçimi Yapın</option>
                  <option value="Şikayet">Şikayet</option>
                  <option value="İtiraz">İtiraz</option>
                  <option value="Öneri">Öneri</option>
                </select>
                <h3>Açıklama</h3>
                <textarea className="form-control bg-dark text-white mb-3" rows="5" placeholder="Detaylı açıklama..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                <button className="btn btn-success" type="submit"><i className="bi bi-send-fill"></i></button>
              </form>
              <hr />
              <h1 className="fw-bolder">Tüm Destek Talepleriniz</h1>
              {loading ? (
                <div className="text-success text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>
              ) : (
                <div className="table-scroll-x">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Konu</th>
                        <th scope="col">Açıklama</th>
                        <th scope="col">Durum</th>
                        <th scope="col">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td>{ticket.id}</td>
                          <td>{ticket.subject}</td>
                          <td>{ticket.description.length > 40 ? ticket.description.slice(0, 40) + '...' : ticket.description}</td>
                          <td>{ticket.status || 'Cevaplanmadı'}</td>
                          <td>
                            <button className="btn btn-sm btn-primary text-white" onClick={() => handleShow(ticket)}><i className="bi bi-eye-fill"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {}
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
                        <p><b>Konu:</b> {modalContent.subject}</p>
                        <p><b>Açıklama:</b> {modalContent.description}</p>
                        <p><b>Durum:</b> {modalContent.status || 'Cevaplanmadı'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
