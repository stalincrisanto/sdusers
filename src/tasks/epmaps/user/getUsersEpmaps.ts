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
        if (!userInfo) {
          logger.info(`Usuario con email: ${email_id} no encontrado`);
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