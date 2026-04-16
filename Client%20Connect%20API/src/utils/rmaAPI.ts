import axios from "axios";
export const baseUrl = `${process.env.RMA_BASE_URL}`;

export const rmaAPI = async (
  rmaEndpoint: string,
  access_token: string,
  request_method: string = "GET",
  body: any = null,
) => {
  const url = `${baseUrl}${rmaEndpoint}`;

  console.log(`Sending request to RMA: ${url}`);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${access_token}`,
  };

  let requestObj: any = {};
  if (request_method === "GET") {
    requestObj = {
      method: request_method,
      url,
      headers,
    };
  } else {
    requestObj = {
      method: request_method,
      url,
      headers,
      data: body,
    };
  }

  try {
    const response = await axios(requestObj);
    console.log(`Response from RMA: ${response.status}`);
    return response;
  } catch (error) {
    console.log(`URL ${url}`);
    console.log(`Error: ${error}`);
    return null;
  }
};
