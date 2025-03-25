import { departmentsProcess } from "./departmentsProcess";
import { getInfoUserEmpams } from "./epmapsClient";
import { getUsersFromServiceDesk } from "./serviceDeskClient";
import { logger } from "./utils/logger";

export const main = async () => {
  await departmentsProcess();
  // await getUsersFromServiceDesk();
  // await getInfoUserEmpams("katherine.mera@aguaquito.gob.ec");
};
try {
  main();
} catch (error) {
  logger.info(`Ha ocurrido un error al ejecutar el proceso ${error}`);
}

// //TODO: probar creando más de 10 usuarios la respuesta de todos los usuarios
// import express from "express";
// import type { Request, Response } from "express";
// import axios from "axios";
// import https from "https";
// import type { ResponseSD } from "./types";
// import qs from "qs";

// const app = express();
// const PORT = 3000;

// const URL_API = "https://localhost:8080/api/v3/users";
// const API_KEY_SERVICEDESK = "39E103FE-9155-4956-83C8-351AA4AE1A60";

// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// app.get("/usuarios", async (req: Request, res: Response) => {
//   try {
//     // const input_data = {
//     //   list_info: {
//     //     sort_field: "name",
//     //     start_index: 1,
//     //     sort_order: "asc",
//     //     row_count: 25,
//     //     get_total_count: true,
//     //   },
//     //   fields_required: [
//     //     "name",
//     //     "email_id",
//     //     "employee_id",
//     //     "first_name",
//     //     "middle_name",
//     //     "last_name",
//     //     "ciid",
//     //   ],
//     // };

//     const response = await axios.get(URL_API, {
//       headers: {
//         authtoken: API_KEY_SERVICEDESK,
//       },
//       httpsAgent,
//     });
//     console.log("response------------->", response);
//     // const fullResponse: ResponseSD = response.data;
//     // const users = fullResponse.users.map(({ name, last_name, email_id }) => ({
//     //   name,
//     //   last_name,
//     //   email_id,
//     // }));
//     // res.json(users);
//     res.json({});
//   } catch (error) {
//     res.status(500).send(`Error al obtener los usuarios ${error}`);
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });

// // import axios from 'axios';
// // import qs from 'qs'; // Para codificar los datos en x-www-form-urlencoded

// // async function updateUser() {
// //   const url = 'https://localhost:8080/api/v3/users/302'; // URL de la API
// //   const authToken = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'; // Tu token de autenticación
// //   const csrfToken = '43bc383204b3996af370fc6f7dc43820286ac37faafa309f0a62b441c6f25fd46f399ec4b51459dc5d6aff20ddd92210bb1461d81c751b0cf1e4059595331712'; // Token CSRF

// //   // El objeto que quieres enviar
// //   const inputData = {
// //     user: {
// //       email_id: 'test@test.com',
// //     },
// //   };

// //   // Convertir el objeto `inputData` a un string JSON
// //   const inputDataString = JSON.stringify(inputData);

// //   // Usar `qs.stringify` para convertir los datos a `x-www-form-urlencoded`
// //   const data = qs.stringify({
// //     input_data: inputDataString,
// //     sdpcsrfparam: csrfToken, // Si el token CSRF es requerido como parámetro
// //   });

// //   try {
// //     const response = await axios.put(url, data, {
// //       headers: {
// //         'Content-Type': 'application/x-www-form-urlencoded', // Especifica el tipo de contenido
// //         'authtoken': authToken, // Token de autenticación
// //       },
// //     });

// //     console.log('Respuesta del servidor:', response.data);
// //   } catch (error) {
// //     console.error('Error al realizar la solicitud:', error.response ? error.response.data : error.message);
// //   }
// // }

// // // Llamar a la función para hacer la petición
// // updateUser();
