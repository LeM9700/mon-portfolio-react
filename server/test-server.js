import express from 'express';

const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server works!' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server listening on ${PORT}`);
});