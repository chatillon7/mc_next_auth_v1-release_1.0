'use client';

import { useEffect, useState } from "react";
import Image from 'next/image';

export default function HakkimizdaPage() {
  const [about, setAbout] = useState("");
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setAbout(data.aboutContent || "");
        setSettings(data);
      });
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-8 mx-auto">
          <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
            <div className="col-12 text-center mx-auto mb-3">
              <Image src="/flyingheroes.png" className="img-fluid" alt="Logo" width={320} height={128} />
            </div>
            <div className="col-12 mx-auto">
              <h1 className="fw-bolder">Hakkımızda</h1>
              <p>{about}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
