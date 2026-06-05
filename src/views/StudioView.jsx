import React, { useState } from 'react';
import { designs } from '@freesewing/collection';
import svgs from '../svgs.json';
import { StudioPatternCard } from '../components/StudioPatternCard';
import { TechPanel } from '../components/TechPanel';

export function StudioView({
  setAppMode, viewMode, setViewMode, galleryViewMode,
  isLightMode, toggleTheme,
  isAuthenticated, user, loginWithRedirect,
  selectedPattern, setSelectedPattern
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNames = Object.entries(designs).filter(([name, Design]) => {
    let fullName = name;
    try {
      const p = new Design();
      if (p.designConfig?.data?.name) fullName = p.designConfig.data.name;
    } catch(e){}
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) || name.toLowerCase().includes(searchTerm.toLowerCase());
  }).map(([name]) => name);

  return (
    <div className="studio-layout page-transition">
      <header className="studio-topbar">
        <div className="topbar-left">
          <button className="btn-back" onClick={() => setAppMode('gallery')} title="Volver al catálogo">⮜ Galería</button>
          <div className="divider"></div>
          <div className="logo-mark">⚡</div>
          <span className="logo-text">PatternAI <span className="version">Studio V2.0</span></span>
        </div>
        <div className="topbar-center">
          <div className="view-toggle">
            <button className={viewMode === 'line' ? 'active' : ''} onClick={() => setViewMode('line')}>Ilustración</button>
            <button className={viewMode === 'photo' ? 'active' : ''} onClick={() => setViewMode('photo')}>Foto 3D</button>
          </div>
        </div>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>{isLightMode ? '🌙' : '☀️'}</button>
          {isAuthenticated ? (
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer'}} onClick={() => setAppMode('profile')}>
              <img src={user.picture} alt={user.name} style={{width: 30, height: 30, borderRadius: '50%'}} />
            </div>
          ) : (
            <button className="btn-secondary-full" style={{width: 'auto', padding: '0.2rem 0.5rem'}} onClick={() => loginWithRedirect()}>Ingresar</button>
          )}
        </div>
      </header>

      <div className="studio-body">
        <aside className="studio-sidebar-left">
          <details className="mobile-catalog-dropdown" open>
            <summary className="catalog-summary">
              <span className="summary-title">📚 Catálogo de Patrones</span>
              <span className="summary-icon">▼</span>
            </summary>
            <div className="sidebar-header desktop-only">
              <h4>Catálogo Local</h4>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Filtrar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="sidebar-list">
              {Object.entries(designs).filter(([name]) => filteredNames.includes(name)).map(([name, Design]) => {
                  let fullName = name;
                  try {
                    const p = new Design();
                    if (p.designConfig?.data?.name) fullName = p.designConfig.data.name;
                  } catch (e) {}
  
                  return (
                    <StudioPatternCard 
                      key={name} name={name} fullName={fullName} isSelected={selectedPattern && selectedPattern.name === name}
                      onClick={() => {
                        const editorState = JSON.stringify({ design: name, view: 'measurements' });
                        const editorUrl = `https://freesewing.eu/editor/#s=${encodeURIComponent(editorState)}`;
                        setSelectedPattern({ name, fullName, editorUrl, Design });
                        if (viewMode === 'editor') setViewMode(galleryViewMode);
                        if (window.innerWidth <= 768) {
                          document.querySelector('.mobile-catalog-dropdown')?.removeAttribute('open');
                        }
                      }} 
                    />
                  );
              })}
            </div>
          </details>
        </aside>

        <main className="studio-canvas">
          <div className="canvas-toolbar">
            <div className="canvas-title" style={{textTransform: 'capitalize'}}>{selectedPattern.fullName}</div>
            <div className="canvas-tools">
              <button className={viewMode === 'editor' ? 'active-editor-btn' : ''} onClick={() => setViewMode(viewMode === 'editor' ? galleryViewMode : 'editor')}>
                {viewMode === 'editor' ? 'Cerrar Editor CAD' : '✂️ Abrir Editor CAD'}
              </button>
            </div>
          </div>
          <div className="canvas-content">
            <div className={`canvas-paper ${viewMode === 'editor' ? 'editor-mode' : ''}`}>
              {viewMode === 'editor' ? (
                <iframe src={selectedPattern.editorUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }} title="Freesewing Editor" />
              ) : viewMode === 'line' ? (
                svgs[selectedPattern.name] && svgs[selectedPattern.name].includes('<svg') ? (
                  <div dangerouslySetInnerHTML={{ __html: svgs[selectedPattern.name] }} className="svg-strict-wrapper" />
                ) : <div className="canvas-empty">Sin ilustración</div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={`https://cdn.freesewing.eu/design/${selectedPattern.name}.webp`} alt={selectedPattern.fullName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="canvas-empty" style={{ display: 'none' }}>Sin render 3D/foto</div>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="studio-sidebar-right">
          <div className="sidebar-header"><h4>Inspector (IA)</h4><div className="panel-icons">⋮</div></div>
          <div className="sidebar-panel-content"><TechPanel {...selectedPattern} /></div>
        </aside>
      </div>
    </div>
  );
}
