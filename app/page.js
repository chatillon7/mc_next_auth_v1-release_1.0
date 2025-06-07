'use client';
import { useEffect, useState } from "react";
import SignupForm from "@/components/auth/signup-form";
import LoginForm from "@/components/auth/login-form";
import Script from "next/script";
import Image from 'next/image';

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
    fetch("/api/session").then(r => r.json()).then(data => {
      if (data.user && data.user.userId) {
        fetch(`/api/user?userId=${data.user.userId}`)
          .then(r => r.json())
          .then(u => setUser(u.user));
      }
    });
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.bootstrap) {
      const el = document.getElementById('slide');
      if (el) {
        const carousel = window.bootstrap.Carousel.getOrCreateInstance(el, { interval: 3000, ride: 'carousel' });
        carousel.cycle();
      }
    }
  }, [user, settings]);
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <div className="container-fluid">
        <div className="row">
              {user ? (
          <div className="col-md-8 mx-auto">
            <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
                <div className="col-6-md mx-auto text-start">
                  <h1 className="fw-bolder">Hoşgeldin <span className="text-uppercase">{user.name}</span>!</h1>
                  <p className="mb-3">Websitemize katıldığın için teşekkür ederiz. Websitenin üst konumundaki navigasyon çubuğu üzerinden gezintiye çıkabilirsin.</p>
                  <div id="slide" className="carousel slide mb-3" data-bs-ride="carousel">
                    <div className="carousel-inner">
                      {settings && settings.carouselImages && settings.carouselImages.length > 0 ? (
                        settings.carouselImages.map((img, i) => (
                          <div className={`carousel-item${i === 0 ? ' active' : ''}`} key={img}>
                            {img.endsWith('.png') && (img.startsWith('slide') || img.startsWith('/slide')) ? (
                              <Image src={`/${img.replace(/^\//, '')}`} className="d-block rounded w-100" alt="..." width={960} height={540} />
                            ) : (
                              <Image src={img.startsWith('/api/settings/get-uploaded-file?file=') ? img : `/api/settings/get-uploaded-file?file=${img}`} className="d-block rounded w-100" alt="..." width={960} height={540} unoptimized />
                            )}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="carousel-item active">
                            <Image src="/slide1.png" className="d-block rounded w-100" alt="..." width={960} height={540} />
                          </div>
                          <div className="carousel-item">
                            <Image src="/slide2.png" className="d-block rounded w-100" alt="..." width={960} height={540} />
                          </div>
                          <div className="carousel-item">
                            <Image src="/slide3.png" className="d-block rounded w-100" alt="..." width={960} height={540} />
                          </div>
                        </>
                      )}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#slide" data-bs-slide="prev">
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#slide" data-bs-slide="next">
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </div>
                </div>
            </div>
          </div>
              ) : (
                <>
          <div className="col-md-8 mx-auto">
            <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
              <div className="col-12 text-center mx-auto">
                <Image src="/flyingheroes.png" className="img-fluid" alt="Logo" width={320} height={128} />
              </div>
                  <div className="col-md-6 mx-auto">
                    <h1 className="fw-bolder">Hesabın Yok mu?</h1>
                    <SignupForm />
                  </div>
                  <div className="col-md-6 mx-auto">
                    <h1 className="fw-bolder">Zaten Hesabım Var.</h1>
                    <LoginForm />
                  </div>
            </div>
          </div>
                </>
              )}
        </div>
      </div>
    </>
  );
}
