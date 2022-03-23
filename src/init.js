import "dotenv/config";
import "./db";
import app from "./server";

const handelistening = () => {
  console.log(`✅ Server listening on port ${process.env.PORT}`);
};
app.listen(process.env.PORT, handelistening);
