"use client";

import { useMemo, useState } from "react";
import { Clock, Facebook, Heart, Instagram, MapPin, Play, Share2, UserRound } from "lucide-react";
import type { Photo, Video } from "@/lib/tutor-empty";

const periods = ["Hoje", "Esta semana", "Este mes", "Todas"] as const;
type Period = (typeof periods)[number];

export function FotosView({ photos: allPhotos, videos }: { photos: Photo[]; videos: Video[] }) {
  const [tab, setTab] = useState<"fotos" | "videos">("fotos");
  const [period, setPeriod] = useState<Period>("Todas");
  const [favorites, setFavorites] = useState<number[]>(allPhotos.filter((p) => p.favorite).map((p) => p.id));
  const [shareId, setShareId] = useState<number | null>(null);
  const [onlyFavs, setOnlyFavs] = useState(false);

  const visible = useMemo(() => {
    let list = allPhotos;
    if (period !== "Todas") list = list.filter((p) => p.period === period);
    if (onlyFavs) list = list.filter((p) => favorites.includes(p.id));
    return list;
  }, [period, onlyFavs, favorites, allPhotos]);

  function toggleFav(id: number) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="tutor-page">
      <section className="tutor-section">
        <div className="tutor-timeline-head">
          <div>
            <h3 className="tutor-section-title">ðŸ“¸ Album do pet</h3>
            <p className="tutor-section-sub">Momentos registrados pela equipe ao longo dos dias.</p>
          </div>
          <div className="tutor-tabs">
            <button className={tab === "fotos" ? "active" : ""} onClick={() => setTab("fotos")}>Fotos</button>
            <button className={tab === "videos" ? "active" : ""} onClick={() => setTab("videos")}>Videos</button>
          </div>
        </div>

        {tab === "fotos" ? (
          <>
            <div className="tutor-photo-filters">
              {periods.map((p) => (
                <button key={p} className={p === period ? "active" : ""} onClick={() => setPeriod(p)}>{p}</button>
              ))}
              <button className={`fav-toggle ${onlyFavs ? "active" : ""}`} onClick={() => setOnlyFavs((v) => !v)}>
                <Heart size={15} /> Favoritas
              </button>
            </div>

            {visible.length > 0 ? (
              <div className="tutor-photo-grid">
                {visible.map((photo) => {
                  const fav = favorites.includes(photo.id);
                  return (
                    <figure key={photo.id} className="tutor-photo-card">
                      <div className="tutor-photo-img" style={{ backgroundImage: `url(${photo.src})` }}>
                        <button className={`tutor-photo-fav ${fav ? "on" : ""}`} onClick={() => toggleFav(photo.id)} aria-label="Favoritar">
                          <Heart size={18} fill={fav ? "currentColor" : "none"} />
                        </button>
                        <button className="tutor-photo-share" onClick={() => setShareId(photo.id)} aria-label="Compartilhar">
                          <Share2 size={17} />
                        </button>
                      </div>
                      <figcaption>
                        <strong>{photo.caption}</strong>
                        <div className="tutor-photo-meta">
                          <span><Clock size={12} /> {photo.time}</span>
                          <span><UserRound size={12} /> {photo.by}</span>
                          <span><MapPin size={12} /> {photo.place}</span>
                        </div>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            ) : (
              <p className="tutor-empty">Nenhuma foto neste filtro ainda ðŸ¾</p>
            )}
          </>
        ) : (
          <div className="tutor-video-grid">
            {videos.map((v) => (
              <figure key={v.id} className="tutor-video-card">
                <div className="tutor-video-thumb" style={{ backgroundImage: `url(${v.thumb})` }}>
                  <button className="tutor-video-play" aria-label="Reproduzir"><Play size={26} fill="currentColor" /></button>
                  <span className="tutor-video-dur">{v.duration}</span>
                </div>
                <figcaption><strong>{v.caption}</strong><small>{v.date}</small></figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {shareId !== null ? (
        <div className="tutor-modal-backdrop" onClick={() => setShareId(null)}>
          <div className="tutor-share-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Compartilhar momento</h4>
            <p>Envie esse momento especial do seu pet para quem voce ama.</p>
            <div className="tutor-share-options">
              <a className="share-wpp" href="https://wa.me/?text=Olha%20meu%20pet%20na%20creche!" target="_blank" rel="noopener noreferrer"><Share2 size={18} /> WhatsApp</a>
              <a className="share-ig" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><Instagram size={18} /> Instagram</a>
              <a className="share-fb" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><Facebook size={18} /> Facebook</a>
            </div>
            <button className="tutor-ghost-btn" onClick={() => setShareId(null)}>Fechar</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

