import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const client = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3/",
  params: {
    key: process.env.GOOGLE_API_KEY,
  },
});

export default client;
