import axios from "axios";
import https from "https";
import { logger } from "../../../utils/logger";
import { generateUpdateDepartmentsXml } from "../../../utils/generateXML";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const SERVICE_DESK_API_URL = "https://aquasoporte.aguaquito.gob.ec/api";
const API_KEY_SERVICEDESK = "072D8F37-AC13-4E0E-BB76-547FCC57435A";

// Función para esperar una cantidad de milisegundos
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateDepartment = async (
  departmentsToUpdate: {
    nameToUpdate: string;
    codeToUpdate: string;
  }[]
) => {
  const batchSize = 10;
  const delayBetweenBatches = 2000;
  for (let i = 0; i < departmentsToUpdate.length; i += batchSize) {
    const batch = departmentsToUpdate.slice(i, i + batchSize);

    const promises = batch.map(({ nameToUpdate, codeToUpdate }) => {
      const INPUT_DATA = generateUpdateDepartmentsXml(
        nameToUpdate,
        codeToUpdate
      );
      const dataForUpdateDepartments = new URLSearchParams({
        OPERATION_NAME: "update",
        INPUT_DATA,
      });

      return updateDepartmentToSdp(dataForUpdateDepartments);
    });

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.error(`Error en batch [${i + index}]: ${result.reason}`);
      }
    });

    // Esperar antes de procesar el siguiente batch (excepto en el último)
    if (i + batchSize < departmentsToUpdate.length) {
      await sleep(delayBetweenBatches);
    }
  }
};

export const updateDepartmentToSdp = async (
  dataForUpdateDepartments: URLSearchParams
) => {
  try {
    await axios.post(
      `${SERVICE_DESK_API_URL}/cmdb/ci`,
      dataForUpdateDepartments,
      {
        headers: {
          authtoken: API_KEY_SERVICEDESK,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent,
      }
    );
  } catch (error) {
    throw new Error(`Fallo al actualizar: ${error}`);
  }
};
