import { createClientAsync } from "soap";
import axios from "axios";

const WSDL_URL =
  "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL";

const testSoapService = async () => {
  const client = await createClientAsync(WSDL_URL);
  const args = { sCountryISOCode: "US" };
  const result = await client.CapitalCityAsync(args);

  console.log("result----->", result);
};

const testSoapServiceWithoutParams = async () => {
  //   let data =
  //     '<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <ListOfLanguagesByName xmlns="http://www.oorsprong.org/websamples.countryinfo">\n    </ListOfLanguagesByName>\n  </soap:Body>\n</soap:Envelope>';

  //   let config = {
  //     method: "post",
  //     maxBodyLength: Infinity,
  //     url: "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso",
  //     headers: {
  //       "Content-Type": "text/xml; charset=utf-8",
  //     },
  //     data: data,
  //   };

  //   axios
  //     .request(config)
  //     .then((response) => {
  //       console.log(JSON.stringify(response.data));
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  const client = await createClientAsync(WSDL_URL);

  const [result] = await client.ListOfLanguagesByNameAsync({});
  console.log(
    "result",
    result.ListOfLanguagesByNameResult.tLanguage.map((data: any) =>
      console.log(data.sName)
    )
  );
};

testSoapServiceWithoutParams();
