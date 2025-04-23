import axios from "axios";
import https from "https";
import { logger } from "../../../utils/logger";
import {
  generateCreateDepartmentsXml,
  generateUpdateDepartmentsXml,
} from "../../../utils/generateXML";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const updateDepartment = async (
  departmentsToUpdate: {
    nameToUpdate: string;
    codeToUpdate: string;
  }[]
) => {
  departmentsToUpdate.forEach(async ({ nameToUpdate, codeToUpdate }) => {
    const INPUT_DATA = generateUpdateDepartmentsXml(nameToUpdate, codeToUpdate);
    const dataForUpdateDepartments = new URLSearchParams({
      OPERATION_NAME: "update",
      INPUT_DATA,
    });
    await updateDepartmentToSdp(dataForUpdateDepartments);
  });
};

export const updateDepartmentToSdp = async (
  dataForUpdateDepartments: URLSearchParams
) => {
  try {
    await axios.post(
      `${process.env.SERVICE_DESK_API_URL}/cmdb/ci`,
      dataForUpdateDepartments,
      {
        headers: {
          authtoken: process.env.API_KEY_SERVICEDESK,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent,
      }
    );
    // logger.info("Se han actualizado los departamentos correctamente");
  } catch (error) {
    logger.error(
      `Se ha producido un error al guardar los departamentos: ${error}`
    );
  }
};
