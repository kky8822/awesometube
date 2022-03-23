import app from "./server";

const PORT = 9000;

const handelistening = () => {
  console.log(`✅ Server listening on port ${PORT}`);
};
app.listen(PORT, handelistening);
