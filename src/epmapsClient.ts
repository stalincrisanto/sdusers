import { createClientAsync } from "soap";
import { UserEpmap } from "./types";

const SOAP_URL = "http://localhost:3001/soap?wsdl";

export const getInfoUserEmpams = async (email: string) => {
  try {
    const client = await createClientAsync(SOAP_URL);
    const args = {
      CORREO_EMPLEADO: email,
    };
    const response = await client.MT_EstrucOrgEmpleados_ReqAsync(args);

    const user: UserEpmap = response[0].DATOS;
    console.log("response en api soap", response[0].DATOS);
    return user;
  } catch (error) {
    console.log("error", error);
  }
};

// import { createClientAsync, BasicAuthSecurity } from "soap";
// import { logger } from "./utils/logger";
// import fs from "fs";

// const WSDL_URL = "http://srvpiqas.emaapq.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BS_INTRANET_QAS&receiverParty=&receiverService=&interface=SI_EstrucOrgEmpleados_Req&interfaceNamespace=urn:epmaps.com:INTRANET:ERP:EstrucOrgEmpleados";
// // const WSDL_URL =
// //   "http://srvpiqas.emaapq.local:50000/dir/wsdl?p=ic/35398c31057f3401bc39d197fff37622";
// const USERNAME = "PIQSERVICE";
// const PASSWORD = "PIQEPM@P$2016";
// const OUTPUT_FILE = "D:\\info-user.json";
// const CLIENT_SOAP_DEBBUG = "D:\\client-soap.json";
// const security = new BasicAuthSecurity(USERNAME, PASSWORD);

// // const WSDL_URL = "http://localhost:3001/soap?wsdl";

// export const getInfoUserEmpams = async (email: string) => {
//   logger.info("CONECTANDO CON API SOAP...");
//   try {
//     const requestBody = {
//       CORREO_EMPLEADO: email,
//     };

//     const client = await createClientAsync(WSDL_URL);
//     client.setSecurity(security);
//     // console.log("creo al cliente", client);

//     const response = await client.SI_EstrucOrgEmpleados_ReqAsync({
//       MT_EstrucOrgEmpleados_Req: requestBody,
//     });
//     const responseData = response[0];
//     console.log("response en api soap", responseData[0]);
//     fs.writeFileSync(OUTPUT_FILE, JSON.stringify(responseData[0], null, 2));
//     fs.writeFileSync(CLIENT_SOAP_DEBBUG, JSON.stringify(client, null, 2));
//     logger.info(
//       `Información del usuario con correo ${email} ha sido obtenido exitosamente: ${responseData[0]}`
//     );
//   } catch (error) {
//     logger.error(`No se pudo obtener la información del usuario ${email} --> ${error}`);
//     console.log("error", error);
//   }
// };
