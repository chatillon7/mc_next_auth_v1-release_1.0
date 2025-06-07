'use client';

import Image from 'next/image';
import { useEffect, useState } from "react";

export default function Home() {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
              <div className="col-12 text-center mx-auto mb-3">
                <Image src="/flyingheroes.png" className="img-fluid" alt="Logo" width={320} height={128} />
              </div>
              <div className="col-12 mx-auto">
                <h1 className="fw-bolder">Üzgünüm</h1>
                <div className="alert alert-danger">
                  Az önce erişmeye çalıştığınız sayfaya rolünüz yeterli değil. Eğer bunun bir hata olduğunu düşünüyorsanız, kiminle iletişime geçeceğinizi biliyorsunuz.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
