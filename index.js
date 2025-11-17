import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/chat/message', (req, res) => {
    console.log(`Message from client: ${req.body.message}`);
    res.send({ reply: 'Placeholder response from Amelia Earhart.'});
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});