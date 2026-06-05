import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { designs } from '@freesewing/collection';
import svgs from '../svgs.json';

export function GalleryView({
  galleryViewMode, setGalleryViewMode,
  isLightMode, toggleTheme,
  isAuthenticated, user, loginWithRedirect, setAppMode,
  favorites, toggleFavorite, selectPatternAndGoToStudio
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [animationParent] = useAutoAnimate();

  const filteredNames = Object.entries(designs).filter(([name, Design]) => {
    let fullName = name;
    try {
      const p = new Design();
      if (p.designConfig?.data?.name) fullName = p.designConfig.data.name;
    } catch(e){}
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) || name.toLowerCase().includes(searchTerm.toLowerCase());
  }).map(([name]) => name);

  return (
      <div className="gallery-layout page-transition">
        <header className="gallery-topbar">
          <div className="logo-text">⚡ PatternAI <span className="version">Catálogo</span></div>
          <div className="search-box-large">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar patrón..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="view-toggle" style={{margin: '0 1rem'}}>
            <button className={galleryViewMode === 'line' ? 'active' : ''} onClick={() => setGalleryViewMode('line')}>Ilustración</button>
            <button className={galleryViewMode === 'photo' ? 'active' : ''} onClick={() => setGalleryViewMode('photo')}>Foto 3D</button>
          </div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">{isLightMode ? '🌙' : '☀️'}</button>
            {isAuthenticated ? (
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer'}} onClick={() => setAppMode('profile')}>
                <img src={user.picture} alt={user.name} style={{width: 30, height: 30, borderRadius: '50%'}} />
                <span style={{fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)'}}>{user.given_name || user.name}</span>
              </div>
            ) : (
              <button className="btn-primary-full" style={{width: 'auto', padding: '0.4rem 1rem'}} onClick={() => loginWithRedirect()}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </header>

        <main className="gallery-grid-container">
          <div className="gallery-hero">
            <h1>Selecciona un modelo base</h1>
            <p>Elige un patrón para entrar al estudio y generar fichas técnicas interactivas.</p>
          </div>
          <div className="gallery-grid" ref={animationParent}>
            {Object.entries(designs).filter(([name]) => filteredNames.includes(name)).map(([name, Design]) => {
                let fullName = name;
                try {
                  const p = new Design();
                  if (p.designConfig?.data?.name) fullName = p.designConfig.data.name;
                } catch (e) {}

                const photoUrl = `https://cdn.freesewing.eu/design/${name}.webp`;
                return (
                  <div key={name} className="gallery-card" onClick={() => selectPatternAndGoToStudio(name, fullName, Design)}>
                    <div className="gallery-card-img">
                      {galleryViewMode === 'line' ? (
                        svgs[name] && svgs[name].includes('<svg') ? (
                          <div dangerouslySetInnerHTML={{ __html: svgs[name] }} className="svg-strict-wrapper" />
                        ) : (
                          <div className="fallback-img" style={{background: 'transparent', color: 'var(--text)'}}>Sin ilustración</div>
                        )
                      ) : (
                        <>
                          <img src={photoUrl} alt={fullName} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                          <div className="fallback-img" style={{display: 'none', background: 'var(--bg-panel)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text)'}}>Sin vista previa</div>
                        </>
                      )}
                    </div>
                    <div className="gallery-card-info" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
                        <h3 style={{fontSize: '1rem'}}>{fullName}</h3>
                        <span style={{fontSize: '0.8rem'}}>Abrir en Estudio ➔</span>
                      </div>
                      {isAuthenticated && (
                        <button 
                          onClick={(e) => toggleFavorite(name, e)}
                          style={{background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}
                          title={favorites.includes(name) ? "Quitar de favoritos" : "Guardar en favoritos"}
                        >
                          {favorites.includes(name) ? '❤️' : '🤍'}
                        </button>
                      )}
                    </div>
                  </div>
                );
            })}
            {filteredNames.length === 0 && <div className="empty-state" style={{gridColumn: '1/-1'}}>No se encontraron patrones</div>}
          </div>
        </main>
      </div>
  );
}
