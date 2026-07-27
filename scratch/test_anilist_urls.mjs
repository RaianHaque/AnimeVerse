const queries = [
  'Solo Leveling Season 2',
  'Chainsaw Man Reze',
  'One Punch Man 3',
  'Bleach Thousand-Year Blood War Part 3',
  'Jujutsu Kaisen Culling Game'
];

const query = `
query ($search: String) {
  Media (search: $search, type: ANIME) {
    id
    title { romaji english }
    coverImage { extraLarge large }
  }
}`;

async function run() {
  for (const q of queries) {
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({ query, variables: { search: q } })
      });
      const data = await res.json();
      const m = data.data?.Media;
      console.log(`[${q}] -> ID: ${m?.id} | Title: ${m?.title?.romaji || m?.title?.english} | URL: ${m?.coverImage?.extraLarge || m?.coverImage?.large}`);
    } catch (e) {
      console.log(`[${q}] -> ERROR: ${e.message}`);
    }
  }
}

run();
