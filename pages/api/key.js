export default function handler(req, res) {
    const apiKey = process.env.API_KEY; // API Key from .env
  
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing' });
    }
    
    res.status(200).json({ apiKey });
    // res.status(200).json({ message: "Success", data: "Your data here" });
    
  }
  