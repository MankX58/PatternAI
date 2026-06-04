import React from 'react';

const PatternCard = ({ pattern }) => {
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
  };

  return (
    <div className="pattern-card">
      <img 
        src={pattern.urls.imagen} 
        alt={pattern.nombre} 
        onError={handleImageError}
        className="card-img"
      />
      <div className="card-body">
        <div className="card-category">{pattern.categoria}</div>
        <h2 className="card-title">{pattern.nombre}</h2>
        <p className="card-desc">{pattern.descripcion}</p>
        <div className="card-author">Autor: <strong>{pattern.autor}</strong></div>
        
        <div className="card-actions">
          <a href={pattern.urls.archivo} download className="btn-download">
            Descargar Patrón
          </a>
          <a href={pattern.urls.github} target="_blank" rel="noopener noreferrer" className="btn-github">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default PatternCard;
