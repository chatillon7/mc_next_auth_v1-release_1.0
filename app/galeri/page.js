'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Galeri() {
  const [images, setImages] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.ok ? r.json() : [])
      .then(setImages);
  }, []);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  function chunk(arr, size) {
    const res = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
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
              <h1 className="fw-bolder">Galeri</h1>
              {images.length === 0 && <div className="text-secondary text-center">Henüz galeriye görsel eklenmemiş.</div>}
              {chunk(images, 4).map((row, i) => (
                <div className="row text-center d-flex justify-content-center align-items-center" key={i}>
                  {row.map(img => (
                    <div className="col-md" key={img.id}>
                      <figure className="figure">
                        {(img.imageUrl && (img.imageUrl.startsWith('/') || img.imageUrl.startsWith('http'))) ? (
                          <Image
                            src={img.imageUrl}
                            className="figure-img img-fluid rounded"
                            alt={img.caption || 'Galeri görseli'}
                            style={{ cursor: 'pointer' }}
                            width={400}
                            height={300}
                            onClick={() => setModalImg(img)}
                            unoptimized
                          />
                        ) : (
                          <div style={{width:400, height:300, background:'#222', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Geçersiz görsel</div>
                        )}
                        <figcaption className="figure-caption text-secondary">{img.caption || <span className="text-muted">Açıklama yok</span>}</figcaption>
                      </figure>
                    </div>
                  ))}
                  {Array.from({length: 4 - row.length}).map((_, idx) => (
                    <div className="col-md" key={`empty-${i}-${idx}`}></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {modalImg && (
        <div className="modal show d-block" tabIndex="-1" style={{background: "rgba(0,0,0,0.8)", position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', zIndex: 2000}} onClick={() => setModalImg(null)}>
          <div className="d-flex justify-content-center align-items-center" style={{height:'100vh'}}>
            <div className="bg-transparent rounded shadow p-3 position-relative" style={{maxWidth:'90vw', maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>
              <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-2" aria-label="Kapat" onClick={() => setModalImg(null)}></button>
              {modalImg.imageUrl ? (
                <Image src={modalImg.imageUrl} alt={modalImg.caption || 'Galeri görseli'} style={{maxWidth:'80vw', maxHeight:'80vh', display:'block', margin:'0 auto'}} width={768} height={432} unoptimized />
              ) : (
                <div style={{width:768, height:432, background:'#222', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Geçersiz görsel</div>
              )}
              <div className="text-center text-light mt-2">{modalImg.caption}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
