import https from "https";
import axios from "axios";
import { logger } from "../../../utils/logger";
import { UserEpmapWithEmail } from "../../../utils/types";
import { generateCreateDepartmentsXml } from "../generateXML";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const createDepartments = async (
  departmentsSdp: string[],
  usersEpmaps: UserEpmapWithEmail[]
): Promise<void> => {
  try {


    const departmentsEpmaps = Array.from(
      new Set(usersEpmaps.map((userEpmap) => [userEpmap?.ZTORGEH]).flat())
    ).filter((department) => department !== undefined);

    const departmentsToCreate = departmentsEpmaps.filter(
      (department) => !departmentsSdp.includes(department!)
    );

    if (departmentsToCreate.length > 0) {
      const INPUT_DATA = generateCreateDepartmentsXml(
        departmentsToCreate as string[]
      );
      const dataForAddDepartments = new URLSearchParams({
        OPERATION_NAME: "add",
        INPUT_DATA,
      });
      await addDepartmentToSdp(dataForAddDepartments);
    }
    logger.info(`Se han actualizado --->`);
  } catch (error) {
    logger.error(`Se ha producido un error ${error}`);
    return;
  }
};

export const addDepartmentToSdp = async (
  dataForAddDepartments: URLSearchParams
) => {
  try {
    await axios.post(`${process.env.SERVICE_DESK_API_URL}/cmdb/ci`, dataForAddDepartments, {
      headers: {
        authtoken: process.env.API_KEY_SERVICEDESK,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent,
    });
    logger.info("Se han actualizado los departamentos correctamente");
  } catch (error) {
    logger.error(
      `Se ha producido un error al guardar los departamentos: ${error}`
    );
  }
};
