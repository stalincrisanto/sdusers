import axios from "axios";
import https from "https";
import { logger } from "../../../utils/logger";
import { generateCreateDepartmentsXml } from "../generateXML";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const createDepartment = async (
  departmentsToCreate: {
    nameToCreate: string;
    codeToCreate: string;
  }[]
) => {
  const INPUT_DATA = generateCreateDepartmentsXml(departmentsToCreate);
  const dataForAddDepartments = new URLSearchParams({
    OPERATION_NAME: "add",
    INPUT_DATA,
  });
  await addDepartmentToSdp(dataForAddDepartments);
};

export const addDepartmentToSdp = async (
  dataForAddDepartments: URLSearchParams
) => {
  try {
    await axios.post(
      `${process.env.SERVICE_DESK_API_URL}/cmdb/ci`,
      dataForAddDepartments,
      {
        headers: {
          authtoken: process.env.API_KEY_SERVICEDESK,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent,
      }
    );
    logger.info("Se han actualizado los departamentos correctamente");
  } catch (error) {
    logger.error(
      `Se ha producido un error al guardar los departamentos: ${error}`
    );
  }
};
