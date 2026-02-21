import fetch from 'node-fetch';

async function check() {
  try {
    const response = await fetch('https://diegopoltronieri.com.br/wp-content/uploads/2026/02/Relatorio-O-que-vendi-PagBank.csv', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const text = await response.text();
    console.log('Total length:', text.length);
    const matches = (text.match(/raysant29@gmail\.com/g) || []).length;
    console.log('Matches for raysant29@gmail.com:', matches);
  } catch (e) {
    console.error(e);
  }
}

check();
