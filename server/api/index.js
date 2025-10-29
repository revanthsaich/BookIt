import serverless from "serverless-http";
import appPromise from "../server.js";

let handler;

export default async function (req, res) {
  // await the connected Express app from server.js
  const app = (await appPromise) || (appPromise.default && (await appPromise).default);
  if (!handler) handler = serverless(app);
  return handler(req, res);
}
