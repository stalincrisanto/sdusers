import { logger } from "../../utils/logger";
import { UserEpmap, UserSdp } from "../../utils/types";
import { getInfoUserEmpams } from "../epmaps/epmapsTasks";
import { generateCreateDepartmentsXml } from "./generateXML";
import { addDepartmentToSdp } from "./serviceDeskTasks";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const createDepartments = async (
  departmentsSdp: string[],
  usersSdp: UserSdp[]
): Promise<void> => {
  const BATCH_SIZE = 20; // Puedes ajustar esto según rendimiento/pruebas
  const users: (UserEpmap | null)[] = [];

  try {
    for (let i = 0; i < usersSdp.length; i += BATCH_SIZE) {
      const batch = usersSdp.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async ({ email_id }) => {
        try {
          return await withTimeout(getInfoUserEmpams(email_id!), 10000); // 10s
        } catch (err) {
          logger.error(`Timeout o error con usuario ${email_id}: ${err}`);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      users.push(...batchResults);

      // Optional: agregar pequeño delay para dar respiro al servidor SOAP
      await delay(200); // 200ms entre lotes
    }

    const departmentsEpmaps = Array.from(
      new Set(users.map((userEpmap) => [userEpmap?.ZTORGEH]).flat())
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
  } catch (error) {
    logger.error(`Se ha producido un error ${error}`);
  }
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout de ${ms}ms alcanzado`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
};
