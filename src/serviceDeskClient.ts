import axios from "axios";
import https from "https";
import type { ResponseSD } from "./types";
import { logger } from "./utils/logger";
import fs from "fs";

const URL_API = "https://localhost:8080/api/v3/users"
const API_KEY_SERVICEDESK = "A2C6B0D6-CE8F-4D22-A61D-7A0C81954266";
// const URL_API = "https://srvsdeskprd:8080/api/v3/users";
// const API_KEY_SERVICEDESK = "B632A057-CD5F-4F07-ACDE-22433C9A4063";
const OUTPUT_FILE = "C:\\AN-test\\result.json";

export const getUsersFromServiceDesk = async () => {
  logger.info("INICIANDO PROCESO SERVICE DESK....");
  try {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const responseFromApi = await axios.get(URL_API, {
      headers: {
        authtoken: API_KEY_SERVICEDESK,
      },
      httpsAgent,
    });

    const response: ResponseSD = responseFromApi.data;
    const allUsersData = response.users;
    const allUsersEmails = allUsersData.map(({ id, email_id }) => ({
      id,
      email_id,
    }));

    console.log("response", allUsersEmails);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allUsersEmails, null, 2));
    logger.info(`Resultado guardado en ${OUTPUT_FILE}`);
    logger.info("Proceso completado con éxito.");
  } catch (error) {
    logger.error("Error en el proceso:", error);
  }
};
