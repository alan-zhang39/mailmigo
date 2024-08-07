import { Environment, EnvironmentType } from "./types";

if (process.env["WEB_ENV"] === undefined)
  throw Error("WEB_ENV environment var not set");

const environment: Environment = {
  type: EnvironmentType.DEV,
  firebaseConfig: JSON.parse(process.env["WEB_ENV"]),
};

export default environment;
