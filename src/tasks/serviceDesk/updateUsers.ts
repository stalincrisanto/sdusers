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
    // Constantes de configuración optimizadas
    const BATCH_SIZE = 15; // Reducido para mayor estabilidad
    const DELAY_BETWEEN_BATCHES = 2000; // Aumentado a 2 segundos
    const MAX_RETRIES = 3; // Máximo de reintentos por usuario
    const INITIAL_RETRY_DELAY = 1000; // 1 segundo inicial entre reintentos

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

    logger.info(`Total de usuarios a actualizar: ${updatedUsersSdp.length}`);

    // Función mejorada con reintentos para procesar un usuario individual
    const updateSingleUser = async (user: UserSdpComplete) => {
      const { id, email_id, ...rest } = user;
      if (!email_id) return { success: false, id, error: "Email no disponible" };

      let attempt = 0;
      let lastError: any = null;

      while (attempt < MAX_RETRIES) {
        try {
          const response = await axios.put(
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
              timeout: 10000, // Timeout de 10 segundos
            }
          );

          return { success: true, id, response: response.data };
        } catch (error: any) {
          lastError = error;
          attempt++;
          
          if (attempt < MAX_RETRIES) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1); // Backoff exponencial
            logger.warn(`Reintento ${attempt} para usuario ${id} en ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      logger.error(`Error persistente al actualizar usuario ${id} después de ${MAX_RETRIES} intentos: ${lastError?.message}`);
      return { success: false, id, error: lastError };
    };

    // Función para procesar un lote de usuarios
    const processBatch = async (batch: UserSdpComplete[]) => {
      const results = [];
      for (const user of batch) {
        results.push(await updateSingleUser(user));
      }
      return results;
    };

    // Procesamiento por lotes
    const totalUsers = updatedUsersSdp.length;
    let processed = 0;
    let successCount = 0;
    let errorCount = 0;
    const errorDetails: {id: string, error: any}[] = [];

    while (processed < totalUsers) {
      const batch = updatedUsersSdp.slice(processed, processed + BATCH_SIZE);
      logger.info(
        `Procesando lote ${Math.ceil(processed / BATCH_SIZE) + 1} de ${Math.ceil(
          totalUsers / BATCH_SIZE
        )}`
      );

      const batchResults = await processBatch(batch);
      
      // Contabilizar resultados
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          if (result.id && result.error) {
            errorDetails.push({id: result.id, error: result.error});
          }
        }
      });

      processed += batch.length;

      // Esperar antes del siguiente lote si no es el último
      if (processed < totalUsers) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    // Reporte final detallado
    logger.info(
      "==================== RESUMEN DE ACTUALIZACIÓN ===================="
    );
    logger.info(`Total procesados: ${totalUsers}`);
    logger.info(`Actualizaciones exitosas: ${successCount} (${((successCount / totalUsers) * 100).toFixed(1)}%)`);
    logger.info(`Errores: ${errorCount} (${((errorCount / totalUsers) * 100).toFixed(1)}%)`);
    
    if (errorDetails.length > 0) {
      logger.info("==================== DETALLES DE ERRORES ====================");
      logger.info(`Primeros 10 errores de ${errorDetails.length}:`);
      errorDetails.slice(0, 10).forEach((err, index) => {
        logger.info(`${index + 1}. Usuario ID ${err.id}: ${err.error?.message || err.error}`);
      });
      
      // Opcional: Guardar todos los errores en un archivo si son muchos
      if (errorDetails.length > 10) {
        logger.info(`... y ${errorDetails.length - 10} errores adicionales`);
      }
    }

    // Advertencia si hay muchos errores
    if (errorCount > 0 && errorCount / totalUsers > 0.1) {
      logger.warn("ADVERTENCIA: Más del 10% de las actualizaciones fallaron");
    }

    if (errorCount === 0) {
      logger.info("TODAS las actualizaciones se completaron exitosamente");
    }

  } catch (error) {
    logger.error("ERROR CRÍTICO EN EL PROCESO DE ACTUALIZACIÓN DE USUARIOS");
    logger.error(`Detalles del error: ${error}`);
    throw error;
  }
};