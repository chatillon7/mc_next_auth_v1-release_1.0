'use client';

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Image from 'next/image';

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function fetchUserAndData() {
      const sessionRes = await fetch('/api/session');
      const sessionData = await sessionRes.json();
      let username = null;
      if (sessionData.user && sessionData.user.userId) {
        const userRes = await fetch(`/api/user?userId=${sessionData.user.userId}`);
        const userData = await userRes.json();
        if (userData.user && userData.user.name) {
          username = userData.user.name;
        }
      }
      setUsername(username);
      const commentRes = await fetch('/api/comment');
      let comments = [];
      if (commentRes.ok) {
        const data = await commentRes.json();
        comments = Array.isArray(data.comments) ? data.comments : (data.comments ? [data.comments] : []);
      }
      const userResAll = await fetch('/api/user');
      let users = [];
      if (userResAll.ok) {
        const data = await userResAll.json();
        users = Array.isArray(data.user) ? data.user : (data.user ? [data.user] : []);
      }
      setTotalUsers(users.length);
      const days = 30;
      const today = new Date();
      const chart = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        const toMe = username ? comments.filter(c => c.profile && c.profile.name === username && c.createdAt && c.createdAt.slice(0, 10) === dayStr).length : 0;
        const byMe = username ? comments.filter(c => c.user && c.user.name === username && c.createdAt && c.createdAt.slice(0, 10) === dayStr).length : 0;
        chart.push({ date: dayStr, toMe, byMe });
      }
      setChartData(chart);
      setLoading(false);
    }
    fetchUserAndData();
  }, []);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  if (loading) return <div className="container-fluid"><div className="row"><div className="col-md-8 mx-auto"><div className="row p-3 bg-transparent text-start text-light border border-0 rounded"><div className="text-secondary text-center spinner-border" role="status"><span className="visually-hidden">Yükleniyor...</span></div></div></div></div></div>;
  return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
              <div className="col-12 text-center mx-auto">
                <Image src="/flyingheroes.png" className="img-fluid" alt="Logo" width={320} height={128} />
              </div>
              <div className="col-md-12 mx-auto">
                <h1 className="fw-bolder">Dashboard</h1>
                <div className="card bg-dark text-light mb-3">
                  <div className="card-header">Son 30 Günlük Aktiviteniz</div>
                  <div className="card-body" style={{height: 256}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorToMe" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorByMe" x1="0" y1="0" x2="0" y2="1">
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
                                    <span style={{ display: 'inline-block', width: 12, height: 12, background: entry.color, borderRadius: 2, marginRight: 6 }}></span>
                                    {entry.name === 'toMe' ? 'Profiline Yapılan Yorum' : entry.name === 'byMe' ? 'Yaptığın Yorum' : entry.name}: <b>{entry.value}</b>
                                  </div>
                                ))}
                              </div>
                            );
                          }}
                          labelFormatter={l => l}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="toMe" stroke="#8884d8" fillOpacity={1} fill="url(#colorToMe)" name="Profiline Yapılan Yorum" />
                        <Area type="monotone" dataKey="byMe" stroke="#82ca9d" fillOpacity={1} fill="url(#colorByMe)" name="Yaptığın Yorum" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card bg-dark text-light mb-3">
                  <div className="card-header"><i className="bi bi-people me-1"></i> Toplam Kayıtlı Kullanıcı</div>
                  <div className="card-body">
                    <h3 className="card-title">{totalUsers}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
