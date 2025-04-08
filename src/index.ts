import { departmentsProcess } from "./departmentsProcess";
import { getUsersFromServiceDesk } from "./serviceDeskClient";
import { getInfoUserEmpams } from "./tasks/epmaps/epmapsTasks";
import {
  createDepartments,
  getDepartments,
  getUsers,
  updateUsers,
} from "./tasks/serviceDesk/serviceDeskTasks";
import { logger } from "./utils/logger";

export const main = async () => {
  try {
    const departmentsSdp = await getDepartments();
    const usersSdp = await getUsers();
    logger.info(`USUARIOS QUE VINIERON DESDE SERVICE DESK ${JSON.stringify(usersSdp)}`);
    // await createDepartments(departmentsSdp, usersSdp);
    // await updateUsers(usersSdp);
    // ESTO NO VA: await getInfoUserEmpams("alex.pozo@aguaquito.gob.ec");
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
