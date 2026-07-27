import fs from 'fs';

async function test() {
  const urls = [
    "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tN1511AAsz5D6H90zRGEqjAGr4q.jpg",
    "https://image.tmdb.org/t/p/w600_and_h900_bestv2/geVluXgqBbqKnhS0zUjT06OQ4p2.jpg",
    "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1XddVTamt0fG57g21Hk5bN133d1.jpg",
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx175206-mO2S6bXp0O2V.jpg",
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1gX3niBLLhL.png"
  ];
  const out = {};
  for (const u of urls) {
    try {
      const res = await fetch(u);
      out[u] = res.status;
    } catch (e) {
      out[u] = e.message;
    }
  }
  const absPath = "d:/Class/4th Sem Winter 2026/Frontend/Project Proposal/FinalTermProject/scratch/tmdb.json";
  fs.writeFileSync(absPath, JSON.stringify(out, null, 2));
}
test();
