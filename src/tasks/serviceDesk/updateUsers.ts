import https from "https";
import axios from "axios";
import {
  UserEpmapWithEmail,
  UserSdp,
  UserSdpComplete,
} from "../../utils/types";
import { configProd } from "../../config/config";
import { logger } from "../../utils/logger";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const { SERVICE_DESK_API_URL, API_KEY_SERVICEDESK } = configProd;

export const updateUsers = async (
  usersSdp: UserSdp[],
  usersEpmaps: UserEpmapWithEmail[]
) => {
  try {
    // Constantes de configuración interna
    const BATCH_SIZE = 20; // Tamaño del lote
    const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo de retardo entre lotes

    // Actualización de datos de usuarios
    const updatedUsersSdp: UserSdpComplete[] = usersSdp.map((userSdp) => {
      if (userSdp.email_id) {
        const userFromEpmap = usersEpmaps.find(
          (userEpmap) => userEpmap.EMAIL === userSdp.email_id
        );

        if (userFromEpmap) {
          return {
            ...userSdp,
            ...(userFromEpmap?.ZTPLANS && { jobtitle: userFromEpmap.ZTPLANS }),
            ...(userFromEpmap?.ZTORGEH && {
              department: {
                name: userFromEpmap.ZTORGEH,
              },
            }),
          };
        }
      }
      return userSdp;
    });

    logger.info(
      `USUARIOS FORMATEADOS PARA MODIFICAR ${JSON.stringify(updatedUsersSdp)}`
    );

    // Función para procesar un lote de usuarios
    const processBatch = async (batch: UserSdpComplete[]) => {
      const batchPromises = batch.map(({ id, email_id, ...rest }) => {
        if (!email_id) return Promise.resolve();

        logger.info(
          `DATOS MODIFICADOS EN EL PROCESO BATCH ${{
            input_data: JSON.stringify({
              user: {
                ...(rest.jobtitle && { jobtitle: rest.jobtitle }),
                ...(rest.department && { department: rest.department }),
              },
              IDUSUARIO: id,
              EMAIL: email_id,
              RESTINFO: rest
            }),
          }}`
        );

        return axios
          .put(
            `${SERVICE_DESK_API_URL}/v3/users/${id}`,
            new URLSearchParams({
              input_data: JSON.stringify({
                user: {
                  ...(rest.jobtitle && { jobtitle: rest.jobtitle }),
                  ...(rest.department && { department: rest.department }),
                },
              }),
            }),
            {
              headers: {
                authtoken: API_KEY_SERVICEDESK,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              httpsAgent,
            }
          )
          .catch((error) => {
            logger.error(`Error al actualizar usuario ${id}: ${error}`);
            return null;
          });
      });

      return Promise.all(batchPromises);
    };

    // Procesamiento por lotes
    const totalUsers = updatedUsersSdp.length;
    let processed = 0;
    let successCount = 0;
    let errorCount = 0;

    while (processed < totalUsers) {
      const batch = updatedUsersSdp.slice(processed, processed + BATCH_SIZE);
      logger.info(
        `Procesando lote ${processed / BATCH_SIZE + 1} de ${Math.ceil(
          totalUsers / BATCH_SIZE
        )}`
      );

      const batchResults = await processBatch(batch);
      successCount += batchResults.filter((r) => r !== null).length;
      errorCount += batchResults.filter((r) => r === null).length;
      processed += BATCH_SIZE;

      // Esperar antes del siguiente lote si no es el último
      if (processed < totalUsers) {
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    // Mensaje final con resultados
    logger.info(
      "==================== ACTUALIZACIÓN DE USUARIOS COMPLETADA ===================="
    );
    logger.info(`Total procesados: ${totalUsers}`);
    logger.info(`Actualizaciones exitosas: ${successCount}`);
    logger.info(`Errores: ${errorCount}`);
  } catch (error) {
    logger.error("ERROR GENERAL EN EL PROCESO DE ACTUALIZACIÓN DE USUARIOS");
    logger.error(`Detalles del error: ${error}`);
    throw error; // Relanzamos el error para manejo externo
  }
};
