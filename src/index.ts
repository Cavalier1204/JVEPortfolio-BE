import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import app from "./server";

app.listen(8000, () => {});
