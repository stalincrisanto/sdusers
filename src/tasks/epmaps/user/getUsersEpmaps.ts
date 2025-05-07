// import { getInfoUserEmpams } from "../../../soapFake";
// import { logger } from "../../../utils/logger";
// import { UserEpmap, UserEpmapWithEmail, UserSdp } from "../../../utils/types";
// import { getUserEpmaps } from "./getUserEpmaps";

// const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// export const getUsersEpmaps = async (
//   usersSdp: UserSdp[]
// ): Promise<UserEpmapWithEmail[] | null> => {
//   const BATCH_SIZE = 5; // Puedes ajustar esto según rendimiento/pruebas
//   const users: (UserEpmap | null)[] = [];
//   const usersWithFailed: string[] = [];
//   let userFailed: number = 0;

//   try {
//     for (let i = 0; i < usersSdp.length; i += BATCH_SIZE) {
//       const batch = usersSdp.slice(i, i + BATCH_SIZE);

//       const batchPromises = batch.map(async ({ email_id, id }) => {
//         try {
//           const userInfo = await withTimeout(getUserEpmaps(email_id!), 10000); // 5s
//           if (!userInfo) {
//             logger.error(`Usuario con email: ${email_id} NO ENCONTRADO`);
//             userFailed ++;
//             usersWithFailed.push(email_id!)
//             return null;
//           }
//           // Agregar el email al objeto devuelto por getInfoUserEmpams
//           return  { ...userInfo, EMAIL: email_id, USER_ID: id };
//         } catch (err) {
//           return null;
//         }
//       });

//       const batchResults = await Promise.all(batchPromises);
//       // Filtra los null antes de agregarlos al array final
//       const validResults = batchResults.filter(result => result !== null);
//       users.push(...validResults);

//       logger.info(`Se han procesado ${validResults.length} usuarios desde EPMAPS`);

//       // Optional: agregar pequeño delay para dar respiro al servidor SOAP
//       // AQUI AL PARECER HAY UNA LENTITUD EN ALGUN LADO
//       await delay(5000); // 200ms entre lotes
//     }

//     // TODO: agregar un log aparte con los correos sin respuesta
//     logger.info(`Total de usuarios obtenidos desde EPMAPS ${users.length}`);
//     logger.info(`Total de registros sin respuesta de EPMAPS ${userFailed}`);
//     logger.info(`Total de usuarios errores obtenidos desde EPMAPS ${usersWithFailed.length}`);
//     logger.info(`Total de usuarios errores obtenidos desde EPMAPS ${usersWithFailed}`);

//     return users.filter((user) => user !== null) as UserEpmapWithEmail[];
//   } catch (error) {
//     logger.error(`Se ha producido un error ${error}`);
//     return null;
//   }
// };

// const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
//   return new Promise((resolve, reject) => {
//     const timeoutId = setTimeout(() => {
//       reject(new Error(`Timeout de ${ms}ms alcanzado`));
//     }, ms);

//     promise
//       .then((res) => {
//         clearTimeout(timeoutId);
//         resolve(res);
//       })
//       .catch((err) => {
//         clearTimeout(timeoutId);
//         reject(err);
//       });
//   });
// };

import { getUserEpmaps } from "./getUserEpmaps";
import { logger } from "../../../utils/logger";
import { UserEpmapWithEmail, UserSdp } from "../../../utils/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface ProcessBatchOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
}

export const getUsersEpmaps = async (
  usersSdp: UserSdp[],
  options: ProcessBatchOptions = {}
): Promise<UserEpmapWithEmail[] | null> => {
  const {
    batchSize = 10, // Tamaño de lote por defecto
    delayBetweenBatches = 4000 // Retraso por defecto
  } = options;

  const users: UserEpmapWithEmail[] = [];
  const usersWithErrors: Array<{email: string, error: any}> = [];
  const usersNotFound: string[] = [];

  try {
    logProcessStart(usersSdp.length);

    // Procesamos los usuarios en lotes
    for (let i = 0; i < usersSdp.length; i += batchSize) {
      const batch = usersSdp.slice(i, i + batchSize);
      const batchResults = await processBatch(batch, usersWithErrors);

      logger.info(`RESPUESTA DE batchResults en el proceso del batch en getUsersEpmaps ${JSON.stringify(batchResults)}`);
      
      const validResults = batchResults.filter((result): result is UserEpmapWithEmail => result !== null);
      users.push(...validResults);

      logBatchProgress(validResults.length, i + batchSize, usersSdp.length);
      
      if (i + batchSize < usersSdp.length) {
        await delayWithLog(delayBetweenBatches);
      }
    }

    logProcessResults(users.length, usersNotFound.length, usersWithErrors.length, usersWithErrors);
    return users;

  } catch (error) {
    logger.error(`Error en getUsersEpmaps: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// Helper functions for better code organization
const logProcessStart = (totalUsers: number) => {
  logger.info("==============================================================");
  logger.info("========== INICIO PROCESO DE OBTENCIÓN DE USUARIOS ==========");
  logger.info(`========== Total de usuarios a procesar: ${totalUsers} ==========`);
  logger.info("==============================================================");
};

const logBatchProgress = (processed: number, current: number, total: number) => {
  logger.info(`Procesados ${processed} usuarios | Progreso: ${current}/${total} (${Math.round((current / total) * 100)}%)`);
};

const delayWithLog = async (ms: number) => {
  logger.info(`⏳ Esperando ${ms} ms antes del siguiente lote...`);
  await delay(ms);
};

const logProcessResults = (
  successCount: number,
  notFoundCount: number,
  errorCount: number,
  usersWithErrors: Array<{email: string, error: any}>
) => {
  logger.info("==============================================================");
  logger.info("================== RESUMEN DE PROCESAMIENTO ==================");
  logger.info(`Total de usuarios obtenidos: ${successCount}`);
  logger.info(`Total de usuarios no encontrados: ${notFoundCount}`);
  logger.info(`Total de usuarios con errores: ${errorCount}`);
  
  if (usersWithErrors.length > 0) {
    logger.info("Usuarios con errores:");
    usersWithErrors.forEach(({email, error}) => {
      logger.info(`- ${email}: ${error instanceof Error ? error.message : String(error)}`);
    });
  }
  logger.info("==============================================================");
};

const processBatch = async (
  batch: UserSdp[],
  errorTracker: Array<{email: string, error: any}>
): Promise<(UserEpmapWithEmail | null)[]> => {
  const batchResults = await Promise.all(
    batch.map(async ({ email_id, id }) => {
      try {
        const userInfo = await getUserEpmaps(email_id!); // email_id siempre existe
        logger.info(`USUARIO QUE OBTENGO EN EL PROCESO DE BATCH DE EPMAPS ${JSON.stringify(userInfo)}`);
        if (!userInfo) {
          logger.warn(`Usuario con email: ${email_id} no encontrado`);
          return null;
        }
        return { ...userInfo, EMAIL: email_id, USER_ID: id };
      } catch (err) {
        errorTracker.push({email: email_id!, error: err});
        logger.error(`Error al obtener usuario ${email_id}: ${err instanceof Error ? err.message : String(err)}`);
        return null;
      }
    })
  );
  return batchResults;
};