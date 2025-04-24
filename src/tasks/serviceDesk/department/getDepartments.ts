import https from "https";
import axios from "axios";
import { dataForGetDepartments } from "../consts";
import { logger } from "../../../utils/logger";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const getDepartments = async (): Promise<string[]> => {
  try {
    const response = await axios.post(
      `${process.env.SERVICE_DESK_API_URL}/cmdb/ci`,
      dataForGetDepartments,
      {
        headers: {
          authtoken: process.env.API_KEY_SERVICEDESK,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent,
      }
    );

    const { data } = response;

    // Verificar si la respuesta es exitosa (status code 200)
    const statusCode = data.API.response.operation.result.statuscode;
    const message = data.API.response.operation.result.message;
    if (statusCode === 3000) {
      logger.info(`No se han encontrado departamentos registrados`);
      return [];
    }
    if (statusCode !== 200 && statusCode !== 3000) {
      logger.error(
        `Error al recibir departamentos: ${statusCode} - ${message}`
      );
      return [];
    }

    const departmentsData =
      data.API.response.operation.Details["field-values"]?.record;
    if (!departmentsData) {
      logger.error("No se han encontrado departamentos");
      return [];
    }

    const departmentsInSdp = departmentsData
      .map((item: any) => item.value)
      .flat()
      .filter((val: any) => val !== "Department");

    return departmentsInSdp;
  } catch (error) {
    logger.error(`Error al obtener departamentos: ${error}`);
    return [];
  }
};
