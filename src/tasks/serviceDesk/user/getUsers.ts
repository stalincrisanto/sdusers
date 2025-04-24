import https from "https";
import axios from "axios";
import { ResponseSDP, UserSdp } from "../../../utils/types";
import { logger } from "../../../utils/logger";
import { dataForGetUsers } from "../consts";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const getUsers = async () => {
    const allUsers: UserSdp[] = [];
    let startIndex = 1;
    const batchSize = 100;
    let totalUsers = 0;
    let hasMoreUsers = true;
  
    try {
      while (hasMoreUsers) {
        const inputData = dataForGetUsers(startIndex, batchSize);
  
        const encodedInputData = encodeURIComponent(inputData);
        const url = `${process.env.SERVICE_DESK_API_URL}/v3/users?input_data=${encodedInputData}`;
        const response = await axios.get(url, {
          headers: { authtoken: process.env.API_KEY_SERVICEDESK },
          httpsAgent,
        });
  
        const responseData: ResponseSDP = response.data;
  
        // Solo en la primera iteración obtenemos el total
        if (startIndex === 1) {
          totalUsers = responseData.list_info.total_count;
          logger.info(`Total de usuarios en SDP: ${totalUsers}`);
        }
  
        // Procesamos los usuarios del batch actual
        const batchUsers = responseData.users.map(({ id, email_id, name }) => ({
          id,
          email_id,
          name,
        }));
  
        allUsers.push(...batchUsers);
  
        // Verificamos si debemos continuar
        startIndex += batchSize;
        hasMoreUsers = startIndex <= totalUsers;
  
        // Pequeña pausa para evitar saturar la API
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      logger.info(`Total de usuarios obtenidos: ${allUsers.length}`);
      return allUsers;
    } catch (error) {
      logger.error(`Error al obtener usuarios: ${error}`);
      throw new Error("Error al sincronizar usuarios desde Service Desk Plus");
    }
  };