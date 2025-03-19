import express from "express";
import soap from "soap";

// Configuración del servidor Express
const app = express();
const port = 3001;

// Simulación de autenticación básica
const USERNAME = "PIQSERVICE";
const PASSWORD = "PIQEPM@P$2016";

// Datos simulados en base al correo del empleado
const employeesData: Record<string, any> = {
  "katherine.mera@aguaquito.gob.ec": {
    ZNAME_EMP: "NELLY KATHERINE MERA PEREIRA",
    ZTGEREN: "GERENCIA DE TECNOLOGIA DE INFORMACIÓN",
    ZTORGEH: "DPTO SOSTENIB PLATAFORMA EMPRES ERP/ISU",
    ZTPLANS: "FUNCIONARIO 1",
    ZNAME_JF: "PAUL EDUARDO VALLEJO SALAZAR",
    ZTPLANS_JF: "FUNCIONARIO 7 (JEFE DPTO)",
  },
  "washington.pilligua@aguaquito.gob.ec": {
    ZNAME_EMP: "WASHINGTON ALEJANDRO PILLIGUA CHILIGUANO",
    ZTORGEH: "DPTO INFRAESTRUCTURA Y SEG INFORMATICA",
    ZNAME_JF: "WENCESLAO RAFAEL RUIZ SANCHEZ",
    ZTPLANS_JF: "FUNCIONARIO 7 (JEFE DPTO)",
  },
  "luis.guilcapi@aguaquito.gob.ec": {
    ZNAME_EMP: "LUIS ARMANDO GUILCAPI ORTEGA",
    ZTGEREN: "GERENCIA DE TECNOLOGIA DE INFORMACIÓN",
    ZTORGEH: "DPTO INFRAESTRUCTURA Y SEG INFORMATICA",
    ZTPLANS: "TECNICO ELECTRONICO",
    ZNAME_JF: "WENCESLAO RAFAEL RUIZ SANCHEZ",
    ZTPLANS_JF: "FUNCIONARIO 7 (JEFE DPTO)",
  },
};

// Definir el servicio SOAP
const service = {
  EstrucOrgEmpleadosService: {
    EstrucOrgEmpleadosPort: {
      MT_EstrucOrgEmpleados_Req: (args: any, callback: any) => {
        // Validar usuario y contraseña (deberían estar en el Header)
        // const auth = args.security; // Asumiendo que la autenticación está en el Header
        // if (!auth || auth.username !== USERNAME || auth.password !== PASSWORD) {
        //   callback({
        //     RETORNO: { COD: 1, MSG: "Credenciales inválidas" },
        //   });
        //   return;
        // }

        // Obtener datos según el correo del empleado
        const employee = employeesData[args.CORREO_EMPLEADO];
        if (!employee) {
          callback({
            RETORNO: { COD: 2, MSG: "Empleado no encontrado" },
          });
          return;
        }

        callback({
          DATOS: employee,
          RETORNO: { COD: 0, MSG: "Información obtenida con éxito" },
        });
      },
    },
  },
};

// Definir el WSDL
const wsdl = `
<definitions name="EstrucOrgEmpleadosService" 
    targetNamespace="urn:epmaps.com:INTRANET:ERP:EstrucOrgEmpleados"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="urn:epmaps.com:INTRANET:ERP:EstrucOrgEmpleados"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

    <types>
      <xsd:schema targetNamespace="urn:epmaps.com:INTRANET:ERP:EstrucOrgEmpleados">
        <xsd:element name="MT_EstrucOrgEmpleados_Req">
          <xsd:complexType>
            <xsd:sequence>
              <xsd:element name="CORREO_EMPLEADO" type="xsd:string"/>
            </xsd:sequence>
          </xsd:complexType>
        </xsd:element>
        <xsd:element name="MT_EstrucOrgEmpleados_Rsp">
          <xsd:complexType>
            <xsd:sequence>
              <xsd:element name="DATOS" type="xsd:string"/>
              <xsd:element name="RETORNO" type="xsd:string"/>
            </xsd:sequence>
          </xsd:complexType>
        </xsd:element>
      </xsd:schema>
    </types>

    <message name="MT_EstrucOrgEmpleados_Req">
        <part name="parameters" element="tns:MT_EstrucOrgEmpleados_Req"/>
    </message>

    <message name="MT_EstrucOrgEmpleados_Rsp">
        <part name="parameters" element="tns:MT_EstrucOrgEmpleados_Rsp"/>
    </message>

    <portType name="EstrucOrgEmpleadosPort">
        <operation name="MT_EstrucOrgEmpleados_Req">
            <input message="tns:MT_EstrucOrgEmpleados_Req"/>
            <output message="tns:MT_EstrucOrgEmpleados_Rsp"/>
        </operation>
    </portType>

    <binding name="EstrucOrgEmpleadosBinding" type="tns:EstrucOrgEmpleadosPort">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="MT_EstrucOrgEmpleados_Req">
            <soap:operation soapAction="urn:MT_EstrucOrgEmpleados_Req"/>
            <input>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
    </binding>

    <service name="EstrucOrgEmpleadosService">
        <port name="EstrucOrgEmpleadosPort" binding="tns:EstrucOrgEmpleadosBinding">
            <soap:address location="http://localhost:${port}/soap"/>
        </port>
    </service>
</definitions>
`;

// Crear el servidor SOAP
soap.listen(app, "/soap", service, wsdl);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor SOAP corriendo en http://localhost:${port}/soap?wsdl`);
});