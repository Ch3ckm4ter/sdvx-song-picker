// server.js
console.log("1. 스크립트 시작..."); // <-- 이 로그가 찍히는지 확인

const express = require('express');
const cors = require('cors');

// data.json 파일이 같은 폴더에 있어야 합니다.
// 만약 없으면 에러가 나야 정상입니다.
const songsData = require('./data.json'); 

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/api/random', (req, res) => {
  console.log("API 요청 받음!"); // <-- 요청 들어오면 찍힘
  
  const MIN_LEVEL = 16;
  const MAX_LEVEL = 20;
  const validCharts = [];

  songsData.forEach(song => {
    if (!song.levels) return;
    song.levels.forEach(chart => {
      if (chart.level >= MIN_LEVEL && chart.level <= MAX_LEVEL) {
        validCharts.push({
          id: song.songIdx,
          title: song.songName,
          artist: song.artist,
          date: song.dateString,
          image: song.imageUrl,
          difficulty: chart.difficulty,
          level: chart.level,
          censored: song.censored, // true 또는 false
          unlock: song.unlock      // 해금 조건 문자열 또는 null
        });
      }
    });
  });

  if (validCharts.length === 0) {
    return res.status(404).json({ error: "해당 레벨 범위의 곡이 없습니다." });
  }

  const randomIndex = Math.floor(Math.random() * validCharts.length);
  const selectedChart = validCharts[randomIndex];
  
  console.log(`선택된 곡: ${selectedChart.title}`);
  res.json(selectedChart);
});

// ▼▼▼ 이 부분이 서버를 계속 켜두는 핵심 코드입니다 ▼▼▼
app.listen(PORT, () => {
  console.log(`2. 서버가 정상적으로 켜졌습니다! http://localhost:${PORT}`);
});