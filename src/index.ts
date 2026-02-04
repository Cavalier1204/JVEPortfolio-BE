import "dotenv/config";
import app from "./server";

app.listen(process.env.PORT, () => {
  console.log("NODE_ENV:", process.env.NODE_ENV, "PORT:", process.env.PORT);
});
