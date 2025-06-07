"use client";

import LogoutButton from "@/components/auth/logout-button";
import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR');
}

function getDefaultMojangId() {
  return "f498513ce8c84773be26ecfc7ed5185d";
}

export default function Profile({ searchParams }) {
  const params = use(searchParams);
  const username = params?.user;
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [mojangId, setMojangId] = useState(null);
  const [comments, setComments] = useState([]);
  const [sessionUser, setSessionUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    async function fetchSession() {
      try {
        const sessionRes = await fetch('/api/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData && sessionData.user) {
            setSessionUser(sessionData.user);
          } else {
            setSessionUser(null);
          }
        } else {
          setSessionUser(null);
        }
      } catch {
        setSessionUser(null);
      }
    }
    fetchSession();
  }, []);

  useEffect(() => {
    if (sessionUser === undefined) return;
    if (sessionUser === null) {
      window.location.replace("/auth/login");
      return;
    }
    let profileName = null;
    let userId = null;
    if (username && username !== "undefined") {
      profileName = username;
    } else if (sessionUser && sessionUser.userId) {
      userId = sessionUser.userId;
    }
    if (!profileName && !userId) {
      window.location.replace("/auth/login");
      return;
    }
    fetchUserAndComments(profileName, userId);
  }, [username, sessionUser]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/user-badge?username=${encodeURIComponent(user.name)}`)
      .then(r => r.ok ? r.json() : [])
      .then(setBadges);
  }, [user]);

  async function fetchUserAndComments(profileName, userId) {
    setError(null);
    setLoading(true);
    let userRes, userData;
    let url = '/api/user?';
    if (profileName) url += `name=${profileName}`;
    else if (userId) url += `userId=${userId}`;
    userRes = await fetch(url);
    if (userRes.ok) {
      userData = await userRes.json();
      if (!userData.user) {
        if (!profileName && userId && !isNaN(Number(userId))) {
          window.location.replace("/auth/login");
          return;
        }
        setError(`Kullanıcı bulunamadı: ${profileName || userId}`);
        setUser(null);
        setLoading(false);
        return;
      } else {
        setUser(userData.user);
        setError(null);
      }
    } else {
      if (!profileName && userId && !isNaN(Number(userId))) {
        window.location.replace("/auth/login");
        return;
      }
      setError(`Kullanıcı bulunamadı: ${profileName || userId}`);
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/mojang?name=${profileName || userData.user.name}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          setMojangId(data.id);
        } else {
          setMojangId(getDefaultMojangId());
        }
      } else {
        setMojangId(getDefaultMojangId());
      }
    } catch {
      setMojangId(getDefaultMojangId());
    }
    if (!userData.user) {
      setComments([]);
      setLoading(false);
      return;
    }
    const commentRes = await fetch(`/api/comment?user=${profileName || userData.user.name}`);
    if (commentRes.ok) {
      const commentData = await commentRes.json();
      setComments(commentData.comments || []);
    }
    setLoading(false);
  }

  const showError = !loading && error && !user;
  const isOwnProfile = !username && sessionUser && user && sessionUser.name === user.name;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
            <div className="col-3 text-center mx-auto mb-4">
              <Image src={`https://crafatar.com/renders/body/${mojangId || getDefaultMojangId()}?size=4&default=MHF_Steve&overlay`} className="img-fluid" alt="Avatar" width={128} height={256} unoptimized />
            </div>
            {loading ? (
              <div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div>
            ) : user ? (
              <>
                <div className="col-md-9 mx-auto mb-3">
                  <div className="d-flex align-items-center mb-1">
                    <h1 className="fw-bolder mb-0">{user.name}</h1> <span className="badge bg-secondary inline-block ms-2">{user.role}</span>
                  </div>
                  <p className="mb-2"><strong>Katılış:</strong> {formatDate(user.createdAt)}</p>
                  <p className="mb-2"><strong>Son Değişiklik:</strong> {formatDate(user.updatedAt)}</p>
                  {sessionUser && user && sessionUser.userId === user.id && (
                    <>
                      <p className="mb-2"><strong>E-Posta Adresiniz:</strong> {user.email}</p>
                    </>
                  )}
                  <div>
                    {badges.length > 0 && badges.map(badge => (
                      <span key={badge.id} className="badge me-2 mb-2" title={badge.description} style={{background:badge.bgColor||'#000',color:'#fff',borderRadius:8,padding:'8px 8px',display:'inline-block'}}>
                        {badge.icon && <i className={`bi bi-${badge.icon}`} style={{fontSize:'1.5em',verticalAlign:'middle'}}></i>}
                      </span>
                    ))}
                  </div>
                  {sessionUser && user && sessionUser.userId === user.id && sessionUser.role === "ADMIN" && (
                    <a href="/admin" className="btn btn-outline-light w-100 mt-2">Admin Paneli</a>
                  )}
                  {sessionUser && user && sessionUser.userId === user.id && (
                    <>
                      <LogoutButton />
                    </>
                  )}
                </div>
                <hr className="mb-4" />
                <div className="col-md-12 mx-auto">
                  <CommentList comments={comments} />
                  {sessionUser && user && sessionUser.userId !== user.id && (
                    <CommentForm profileName={user?.name} />
                  )}
                </div>
              </>
            ) : showError ? (
              <div className="alert alert-danger">{error}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentList({ comments }) {
  const [mojangIds, setMojangIds] = useState({});
  const [sessionUser, setSessionUser] = useState(undefined);

  useEffect(() => {
    async function fetchSession() {
      try {
        const sessionRes = await fetch('/api/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSessionUser(sessionData.user);
        } else {
          setSessionUser(null);
        }
      } catch {
        setSessionUser(null);
      }
    }
    fetchSession();
  }, []);

  useEffect(() => {
    async function fetchMojangIds() {
      const ids = {};
      await Promise.all(comments.map(async (comment) => {
        if (comment.user && comment.user.name) {
          try {
            const res = await fetch(`/api/mojang?name=${comment.user.name}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.id) {
                ids[comment.user.name] = data.id;
              } else {
                ids[comment.user.name] = getDefaultMojangId();
              }
            } else {
              ids[comment.user.name] = getDefaultMojangId();
            }
          } catch {
            ids[comment.user.name] = getDefaultMojangId();
          }
        }
      }));
      setMojangIds(ids);
    }
    if (comments.length) fetchMojangIds();
  }, [comments]);

  if (!comments.length) return <div className="text-secondary text-center mb-3">Henüz yorum yapılmamış.</div>;

  return (
    <>
      {comments.map((comment) => (
        <div className="card bg-dark mb-3" key={comment.id}>
          <div className="row g-0">
            <div className="col-md-2 d-flex justify-content-center align-items-center">
              <Link href={`/profile?user=${comment.user.name}`}>
                <Image src={`https://crafatar.com/renders/head/${mojangIds[comment.user.name] || getDefaultMojangId()}?size=4&default=MHF_Steve&overlay`} className="img-fluid my-1 rounded-start" alt="Avatar" width={64} height={128} unoptimized />
              </Link>
            </div>
            <div className="col-md-10">
              <div className="card-body bg-transparent text-light">
                <h5 className="card-title">{comment.user.name}</h5>
                <p className="card-text">{comment.content}</p>
                <hr/>
                <p className="card-text"><small className="text-body-info">{formatDate(comment.createdAt)} tarihinde gönderildi.</small></p>
                {sessionUser && comment.userId === sessionUser.userId && (
                  <button className="btn btn-sm btn-danger mt-1" onClick={async () => {
                    await fetch(`/api/comment?id=${comment.id}`, { method: 'DELETE' });
                    window.location.reload();
                  }}><i className="bi bi-trash-fill"></i></button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function CommentForm({ profileName }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const res = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, profileName }),
    });
    if (res.ok) {
      setSuccess('Yorum gönderildi!');
      setContent('');
      window.location.reload();
    } else {
      const data = await res.json();
      setError(data.error || 'Bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mt-4 mb-3">
        <textarea className="form-control bg-dark text-light" rows={2} value={content} onChange={e => setContent(e.target.value)} placeholder="Yorumunuzu yazın..." required />
      </div>
      {error && <div className="alert alert-danger py-1">{error}</div>}
      {success && <div className="alert alert-success py-1">{success}</div>}
      <button className="btn btn-success mb-3" type="submit" disabled={loading || !content.trim()}>
        {loading ? 'Gönderiliyor...' : <i className="bi bi-send-fill"></i>}
      </button>
    </form>
  );
}
