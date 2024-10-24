const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

app.get('/api/weather', async (req, res) => {
  const { latitude, longitude } = req.query;
  try {
    const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`);
    // console.log(cityResponse)
    res.json(weatherResponse.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send('Error fetching weather data');
  }
});

app.get('/api/city',async(req,res)=>{
  const {city} = req.query;
  try{
    const cityResponse=await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
    const { latitude, longitude } = cityResponse.data.results[0];
    res.json({ latitude, longitude });
  } catch (error){
    console.error('Error fetching city data',error);
    res.status(500).send('Error fetching city data');
  }
});

app.post('/api/chatgpt', async (req, res) => {
  const { weatherData, userPreferences } = req.body;
  try {
    const chatResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo-1106',
        messages: [
          {
            role: 'system',
            content: 'You are a weather assistant. Provide recommendations based on customer preferences.'
          },
          {
            role: 'user',
            content: `Here is the weather data: ${JSON.stringify(weatherData)}. Customer preferences: ${JSON.stringify(userPreferences)}.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(chatResponse.data.choices[0].message.content);
  } catch (error) {
    console.error('Error fetching ChatGPT response:', error);
    res.status(500).send('Error fetching ChatGPT response');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
