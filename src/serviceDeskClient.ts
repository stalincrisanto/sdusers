import axios from "axios";
import https from "https";
import type { ResponseSD, UserEpmap } from "./types";
import { logger } from "./utils/logger";
import fs from "fs";
import { getInfoUserEmpams } from "./epmapsClient";

const inputData = `{
  "list_info": {
      "row_count": "10000",
      "get_total_count": true,
  }
}`;

const encodedInputData = encodeURIComponent(inputData);

const URL_API = `https://localhost:8080/api/v3/users`;
const URL_WITH_PARAMS = `${URL_API}?input_data=${encodedInputData}`;
const API_KEY_SERVICEDESK = "A2C6B0D6-CE8F-4D22-A61D-7A0C81954266"; //machine in metro
// const API_KEY_SERVICEDESK = "2A61B73F-5C50-4C45-B022-B6471454E007"; //my computer
const OUTPUT_FILE = "D:\\result.json";
// const URL_API = "https://srvsdeskprd:8080/api/v3/users";
// const API_KEY_SERVICEDESK = "B632A057-CD5F-4F07-ACDE-22433C9A4063";
// const OUTPUT_FILE = "C:\\AN-test\\result.json";

export const getUsersFromServiceDesk = async () => {
  logger.info("INICIANDO PROCESO SERVICE DESK....");

  try {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const responseFromApi = await axios.get(URL_WITH_PARAMS, {
      headers: {
        authtoken: API_KEY_SERVICEDESK,
      },
      httpsAgent,
    });

    const response: ResponseSD = responseFromApi.data;
    const allUsersData = response.users;
    const allUsersEmails = allUsersData.map(({ id, email_id, name }) => ({
      id,
      email_id,
      name,
    }));

    const promises = allUsersEmails.map(({ id, email_id }) => {
      if (email_id) {
        return getInfoUserEmpams(email_id).then(async (userFromEpmap) => {
          const responseUpdate = await axios.put(
            `${URL_API}/${id}`,
            new URLSearchParams({
              input_data: JSON.stringify({
                user: {
                  jobtitle: userFromEpmap?.ZTPLANS,
                },
              }),
            }),
            {
              headers: {
                authtoken: API_KEY_SERVICEDESK,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              httpsAgent,
            }
          );
          return responseUpdate;
        });
      }
      return Promise.resolve(); // Si no hay email_id, no hace nada
    });

    // Solo ejecutamos Promise.all si hay promesas
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    // fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allUsersEmails, null, 2));
    // logger.info(`Resultado guardado en ${OUTPUT_FILE}`);
    // logger.info("Proceso completado con éxito.");
  } catch (error) {
    logger.error("Error en el proceso:", error);
  }
};
