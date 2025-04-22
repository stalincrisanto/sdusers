import { loadEnv } from "./config/config";
import { getUsersEpmaps } from "./tasks/epmaps/user/getUsersEpmaps";
import { createDepartments } from "./tasks/serviceDesk/department/createDepartments";
import { getDepartments } from "./tasks/serviceDesk/department/getDepartments";
import { updateUsers } from "./tasks/serviceDesk/updateUsers";
import { getUsers } from "./tasks/serviceDesk/user/getUsers";
import { logger } from "./utils/logger";

// AMBIENTE DE DESARROLLO
// Para el cambio a producción, modificar "dev" por "prod"
loadEnv("dev");

export const main = async () => {
  try {
    const departmentsSdp = await getDepartments();
    const usersSdp = await getUsers();
    const usersEpmaps = await getUsersEpmaps(usersSdp);
    await createDepartments(departmentsSdp, usersEpmaps!);
    //HASTA AQUI EL PROCESO NORMAL; ANTES VA EL MODIFICADO
    // const usersEpmaps = await createDepartments(departmentsSdp, usersSdp);
    // logger.info(`Departamentos actualizados correctamente`);
    // await updateUsers(usersSdp, usersEpmaps!);
    // logger.info("Usuarios actualizados correctamente");
    // setTimeout(() => {}, 3000);
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
