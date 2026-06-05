import React from 'react';

export function StudioPatternCard({ name, fullName, isSelected, onClick }) {
  return (
    <div className={`studio-pattern-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="card-icon">📄</div>
      <div className="card-name" style={{textTransform: 'capitalize'}}>{fullName}</div>
    </div>
  );
}
