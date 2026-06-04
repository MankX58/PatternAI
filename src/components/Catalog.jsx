import React from 'react';
import patrones from '../data/patrones.json';
import PatternCard from './PatternCard';

const Catalog = () => {
  if (!patrones || patrones.length === 0) {
    return <div className="empty-catalog">No se encontraron patrones.</div>;
  }

  return (
    <div className="catalog-grid">
      {patrones.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}
    </div>
  );
};

export default Catalog;
