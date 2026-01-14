import React, { useState } from 'react';
import './App.css';
// ▼ 백엔드 없이 직접 데이터를 가져옵니다.
import songsData from './data.json'; 

function App() {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);

  // ▼ 서버 요청 대신 브라우저에서 직접 계산하는 함수
  const fetchRandomChart = () => {
    setLoading(true);
    
    // 로딩 효과를 주기 위해 약간의 지연 시간(0.3초) 추가
    setTimeout(() => {
      const MIN_LEVEL = 16;
      const MAX_LEVEL = 20;
      const validCharts = [];

      songsData.forEach(song => {
        if (!song.levels) return;
        song.levels.forEach(chartData => {
          if (chartData.level >= MIN_LEVEL && chartData.level <= MAX_LEVEL) {
            validCharts.push({
              id: song.songIdx,
              title: song.songName,
              artist: song.artist,
              date: song.dateString,
              image: song.imageUrl,
              difficulty: chartData.difficulty,
              level: chartData.level,
              censored: song.censored,
              unlock: song.unlock
            });
          }
        });
      });

      if (validCharts.length === 0) {
        alert("해당 레벨 범위의 곡이 없습니다.");
        setLoading(false);
        return;
      }

      // 랜덤 뽑기
      const randomIndex = Math.floor(Math.random() * validCharts.length);
      const selectedChart = validCharts[randomIndex];

      setChart(selectedChart);
      setLoading(false);
    }, 300); 
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