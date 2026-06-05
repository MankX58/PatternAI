import React from 'react';
import { designs } from '@freesewing/collection';

export function ProfileView({ user, logout, setAppMode, favorites, toggleFavorite, selectPatternAndGoToStudio }) {
  return (
    <div className="gallery-layout page-transition" style={{alignItems: 'center', padding: '0'}}>
      <header className="gallery-topbar" style={{width: '100%', position: 'sticky', top: 0, padding: '1rem 2rem'}}>
        <div className="logo-text">⚡ PatternAI <span className="version">Perfil de Usuario</span></div>
        <button className="btn-back" onClick={() => setAppMode('gallery')}>⮜ Volver al Catálogo</button>
      </header>

      <main style={{width: '100%', maxWidth: '800px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        <div style={{display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)'}}>
          <img src={user?.picture} alt={user?.name} style={{width: 80, height: 80, borderRadius: '50%'}} />
          <div>
            <h1 style={{margin: '0 0 0.5rem', color: 'var(--text-heading)'}}>{user?.name}</h1>
            <p style={{margin: 0, color: 'var(--text)'}}>{user?.email}</p>
            <button className="btn-secondary-full" style={{marginTop: '1rem', padding: '0.4rem 1rem', width: 'auto'}} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <div>
          <h2 style={{color: 'var(--text-heading)'}}>Mis Patrones Favoritos ❤️</h2>
          {favorites.length === 0 ? (
            <p style={{color: 'var(--text)'}}>No tienes patrones guardados aún.</p>
          ) : (
            <div className="gallery-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'}}>
              {favorites.map(name => {
                const Design = designs[name];
                if(!Design) return null;
                let fullName = name;
                try { const p = new Design(); if(p.designConfig?.data?.name) fullName = p.designConfig.data.name; } catch(e){}
                const photoUrl = `https://cdn.freesewing.eu/design/${name}.webp`;
                return (
                  <div key={name} className="gallery-card" onClick={() => selectPatternAndGoToStudio(name, fullName, Design)}>
                    <div className="gallery-card-img" style={{height: 150}}>
                      <img src={photoUrl} alt={fullName} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      <div className="fallback-img" style={{display: 'none', background: 'var(--bg-panel)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text)'}}>Sin vista previa</div>
                    </div>
                    <div className="gallery-card-info" style={{padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <h3 style={{fontSize: '1rem', margin: 0}}>{fullName}</h3>
                      <button 
                        onClick={(e) => toggleFavorite(name, e)}
                        style={{background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: 0}}
                        title="Quitar de favoritos"
                      >❤️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 style={{color: 'var(--text-heading)'}}>Ajustes de Producción (Simulado)</h2>
          <div className="info-box" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
             <p style={{margin: 0}}><strong>Fábrica por Defecto:</strong> Confecciones Medellín (Colombia)</p>
             <p style={{margin: 0}}><strong>Costo Hora Operario (Local):</strong> $6,500 COP</p>
             <p style={{margin: 0}}><strong>Medidas Base:</strong> Talla M Industrial estándar</p>
             <p style={{margin: 0}}><strong>Moneda de Costeo:</strong> COP ($)</p>
          </div>
        </div>
      </main>
    </div>
  );
}
