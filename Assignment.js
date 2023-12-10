const express = require('express');
const app = express();
const PORT = 3000;


const axios = require('axios');
const pgp = require('pg-promise')();
const db = pgp('postgres://username:kartik123@localhost:5432/wazirx_data'); 
app.get('/fetch-and-store', async (req, res) => {
  try {
    const apiResponse = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const top10Tickers = Object.values(apiResponse.data).slice(0, 10);

    const insertQueries = top10Tickers.map(ticker => {
      return db.none('INSERT INTO ticker_data(name, last, buy, sell, volume, base_unit) VALUES($1, $2, $3, $4, $5, $6)', [
        ticker.symbol,
        ticker.last,
        ticker.buy,
        ticker.sell,
        ticker.volume,
        ticker.baseAsset
      ]);
    });

    await Promise.all(insertQueries);

    res.json({ success: true, message: 'Data successfully fetched and stored.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
