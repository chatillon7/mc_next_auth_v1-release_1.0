'use client';

import { useEffect, useState } from "react";
import SignupForm from "@/components/auth/signup-form";
import Image from 'next/image';
import Link from 'next/link';

export default function SignupPage() {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);
  return (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="row p-3 bg-transparent text-start text-light border border-0 rounded">
                <div className="col-12 text-center mx-auto">
                  <Image src="/flyingheroes.png" className="img-fluid" alt="Logo" width={320} height={128} />
                </div>
                <div className="col-md-6 mx-auto">
                  <h1 className="fw-bolder">Hesabın Yok mu?</h1>
                  <SignupForm />
                  <Link className="text-white" href="/auth/login">Zaten hesabım var.</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
