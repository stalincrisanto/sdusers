import { departmentsProcess } from "./departmentsProcess";
import { getInfoUserEmpams } from "./epmapsClient";
import { getUsersFromServiceDesk } from "./serviceDeskClient";
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
    await createDepartments(departmentsSdp, usersSdp);
    await updateUsers(usersSdp);
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
