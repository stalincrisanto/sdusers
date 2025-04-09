import { departmentsProcess } from "./departmentsProcess";
import { getUsersFromServiceDesk } from "./serviceDeskClient";
import { getInfoUserEmpams } from "./tasks/epmaps/epmapsTasks";
import { createDepartments } from "./tasks/serviceDesk/createDepartments";
import {
  getDepartments,
  getUsers,
  updateUsers,
} from "./tasks/serviceDesk/serviceDeskTasks";
import { logger } from "./utils/logger";

export const main = async () => {
  try {
    const departmentsSdp = await getDepartments();
    const usersSdp = await getUsers();
    await createDepartments(departmentsSdp, usersSdp);
    // await updateUsers(usersSdp);
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
