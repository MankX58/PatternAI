import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import { designs } from '@freesewing/collection';
import { GalleryView } from './views/GalleryView';
import { StudioView } from './views/StudioView';
import { ProfileView } from './views/ProfileView';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const [appMode, setAppMode] = useState('gallery'); 
  const [viewMode, setViewMode] = useState('line'); 
  const [galleryViewMode, setGalleryViewMode] = useState('photo'); 
  const [favorites, setFavorites] = useState([]);
  const [isLightMode, setIsLightMode] = useState(false);

  const defaultPattern = Object.entries(designs)[0];
  const [selectedPattern, setSelectedPattern] = useState({
    name: defaultPattern[0],
    fullName: (new defaultPattern[1]()).designConfig?.data?.name || defaultPattern[0],
    Design: defaultPattern[1],
    editorUrl: `https://freesewing.eu/editor/#s=${encodeURIComponent(JSON.stringify({ design: defaultPattern[0], view: 'measurements' }))}`
  });

  useEffect(() => {
    if (user?.sub) {
      const stored = JSON.parse(localStorage.getItem(`patternAI_favs_${user.sub}`));
      setFavorites(stored || []);
    } else {
      setFavorites([]);
    }
  }, [user?.sub]);

  const toggleFavorite = (name, e) => {
    if(e) e.stopPropagation();
    if (!user?.sub) return;
    let newFavs = favorites.includes(name) ? favorites.filter(f => f !== name) : [...favorites, name];
    setFavorites(newFavs);
    localStorage.setItem(`patternAI_favs_${user.sub}`, JSON.stringify(newFavs));
  };

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.body.setAttribute('data-theme', !isLightMode ? 'light' : 'dark');
  };

  const selectPatternAndGoToStudio = (name, fullName, Design) => {
    const editorState = JSON.stringify({ design: name, view: 'measurements' });
    const editorUrl = `https://freesewing.eu/editor/#s=${encodeURIComponent(editorState)}`;
    setSelectedPattern({ name, fullName, editorUrl, Design });
    setViewMode(galleryViewMode);
    setAppMode('studio');
  };

  if (appMode === 'gallery') {
    return (
      <GalleryView 
        galleryViewMode={galleryViewMode} setGalleryViewMode={setGalleryViewMode}
        isLightMode={isLightMode} toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated} user={user} loginWithRedirect={loginWithRedirect}
        setAppMode={setAppMode} favorites={favorites} toggleFavorite={toggleFavorite}
        selectPatternAndGoToStudio={selectPatternAndGoToStudio}
      />
    );
  }

  if (appMode === 'profile' && isAuthenticated) {
    return (
      <ProfileView 
        user={user} logout={logout} setAppMode={setAppMode}
        favorites={favorites} toggleFavorite={toggleFavorite}
        selectPatternAndGoToStudio={selectPatternAndGoToStudio}
      />
    );
  }

  return (
    <StudioView 
      setAppMode={setAppMode} viewMode={viewMode} setViewMode={setViewMode}
      galleryViewMode={galleryViewMode} isLightMode={isLightMode} toggleTheme={toggleTheme}
      isAuthenticated={isAuthenticated} user={user} loginWithRedirect={loginWithRedirect}
      selectedPattern={selectedPattern} setSelectedPattern={setSelectedPattern}
    />
  );
}

export default App;
