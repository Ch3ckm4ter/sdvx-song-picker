import React, { useState } from 'react';
import './App.css';

function App() {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomChart = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/random');
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setChart(data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 연결 실패");
    }
    setLoading(false);
  };

  const getDifficultyClass = (difficulty) => {
    if (!difficulty) return '';
    if (difficulty.includes('NOVICE')) return 'diff-nov';
    if (difficulty.includes('ADVANCED')) return 'diff-adv';
    if (difficulty.includes('EXHAUST')) return 'diff-exh';
    if (difficulty.includes('MAXIMUM')) return 'diff-mxm';
    if (difficulty.includes('INFINITE')) return 'diff-inf';
    if (difficulty.includes('GRAVITY')) return 'diff-grv';
    if (difficulty.includes('HEAVENLY')) return 'diff-hvn';
    if (difficulty.includes('VIVID')) return 'diff-vvd';
    if (difficulty.includes('EXCEED')) return 'diff-xcd';
    if (difficulty.includes('ULTIMATE')) return 'diff-ult';
    return '';
  };

  return (
    <div className="app-container">
      <div className="sdvx-interface">
        <h1 className="logo">SDVX LEVEL 16~20 PICKER</h1>
        
        <div className="jacket-frame">
          {loading ? (
            <div className="loading">SEARCHING...</div>
          ) : chart ? (
            <img 
              src={chart.censored ? '/c.png' : chart.image} 
              alt={chart.title} 
              className="jacket-img" 
            />
          ) : (
            <div className="placeholder">READY?</div>
          )}
        </div>

        {/* ▼▼▼ 위치 이동됨: 자켓 프레임 밖으로 나옴 ▼▼▼ */}
        {chart && (
          <div className={`level-badge ${getDifficultyClass(chart.difficulty)}`}>
            <span className="diff-name">{chart.difficulty}</span>
            <span className="diff-level">{chart.level}</span>
          </div>
        )}

        <div className="info-panel">
          {chart && (
            <>
              <h2 className="song-title">{chart.title}</h2>
              <p className="artist-name">{chart.artist}</p>
              
              {chart.unlock && (
                <p className="unlock-info">🔑 {chart.unlock}</p>
              )}
              
              <p className="date-added">Update: {chart.date}</p>
            </>
          )}
        </div>

        <button className="start-btn" onClick={fetchRandomChart} disabled={loading}>
          {loading ? 'LOADING...' : 'GAME START'}
        </button>
      </div>
    </div>
  );
}

export default App;