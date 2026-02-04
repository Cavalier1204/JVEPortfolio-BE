import app from "./app";

app.listen(process.env.PORT, () => {
  console.log("NODE_ENV:", process.env.NODE_ENV, "PORT:", process.env.PORT);
});
