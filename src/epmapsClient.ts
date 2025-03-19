import { createClientAsync } from "soap";

const SOAP_URL = "http://localhost:3001/soap?wsdl";

export const getInfoUserEmpams = async (email: string) => {
    console.log("llego a la función");
    try {
        
        const client = await createClientAsync(SOAP_URL);
        console.log("creo al cliente", client);

        const args = {
          CORREO_EMPLEADO: email,
        };
        const response = await client.MT_EstrucOrgEmpleados_ReqAsync(args);
      
        console.log("response en api soap", response[0]);
    } catch (error) {
        console.log("error", error);
    }
};
