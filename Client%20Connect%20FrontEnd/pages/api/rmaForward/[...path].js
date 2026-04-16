import { getSession } from "@auth0/nextjs-auth0";
import axios from "axios";
import qs from "qs";
import { logToFile } from "../../../utils/logger";
import cache from "../../../utils/cache";

const baseUrl = `${process.env.RMA_BASE_URL}`;

// list of urls to cache
const urlsToCache = [
  "clc/api/Product/Benefit",
  "mdm/api/CoverMemberType",
  "clc/api/Broker/Brokerage",
  "clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId",
  "clc/api/Policy/PolicyStatus",
  "mdm/api/CancellationReason",
  "mdm/api/lookup/DocumentType",
  "clc/api/Policy/PolicyIntegration/GetEuropAssistFee",
  "/clc/api/Policy/PolicyIntegration/GetGroupSchemePremiumRoundingExclusions",
];

// brokerUrl to check for brokerage id
const brokerUrl = [
  "clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId",
  "clc/api/Policy/Policy",
  "clc/api/Policy/Policy/GetPolicyByNumber",
  "clc/api/Policy/Policy/GetPoliciesByRolePlayerIdNumber",
];

const getRmaAccessToken = async () => {
  try {
    // check if token exists in cache
    if (cache.has("rmaAccessToken")) {
      console.log("RMA Token is in cache");

      return cache.get("rmaAccessToken");
    }

    // console.log("RMA Token is NOT in cache");

    const token = await axios.post(
      `${process.env.RMA_AUTH_URL}`,
      qs.stringify({
        client_id: process.env.RMA_CLIENT_ID,
        client_secret: process.env.RMA_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    // console log the bearer token being sent
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      console.log("RMA Bearer token", token.data.access_token);
    }

    // set token in cache for 90% of expiry time
    const expiryTime = token.data.expires_in * 0.9;
    cache.set("rmaAccessToken", token.data.access_token, expiryTime);
    console.log(
      `RMA Token set in cache expiring in ${expiryTime} seconds or ${
        expiryTime / 60
      } minutes`,
    );

    return token.data.access_token;
  } catch (err) {
    console.log(`Error on ${err}`);
    return null;
  }
};

export async function POST(req, res) {
  try {
    const session = await getSession(req, res);

    if (!session) {
      throw new Error(`Requires authentication`);
    }

    // console.log("session", session.user);
    const userInfo = session.user;

    // get RMA access token
    const rmaAccessToken = await getRmaAccessToken();
    if (!rmaAccessToken) {
      return res.status(401).json({
        success: false,
        message:
          "GET RMA Token = User not authorized to make request to this API",
      });
    }

    // set original url from query path
    const originalUrl = req.query.path.join("/");

    console.log(`Request URL: ${originalUrl}`);

    // CDA-BROKERAGE-Broker Representative
    // CDA-BROKERAGE-Broker Manager
    const userRoles = userInfo.rmaAppRoles;
    const userMetaData = userInfo.rmaAppUserMetadata;

    // check if brokerage id is set
    const userBrokerageId =
      userMetaData?.BrokerageIds && userMetaData?.BrokerageIds.length > 0
        ? userMetaData?.BrokerageIds[0]
        : null;

    // console.log("userRoles", userRoles);
    // console.log("userMetaData", userMetaData);
    // console.log("userBrokerageId", userBrokerageId);

    const url = `${baseUrl}${originalUrl}`;

    console.log(`Forwarding request to RMA: ${url}`);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rmaAccessToken}`,
    };

    const requestObj = {
      method: POST,
      url,
      headers,
      data: req.body,
    };

    console.log("requestObj", requestObj);

    // return res.status(200).json({ requestObj });

    const response = await axios(requestObj);

    console.log(`Response from RMA: ${response.status}`);

    // check if response.data is json and if not then return error
    if (typeof response.data !== "object") {
      return res.status(400).json({
        success: false,
        message: "Error in response from RMA",
      });
    }

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.log(`Error: ${error}`);
    console.log(`Error: ${error.response.data}`);
    return res.status(500).json({
      success: false,
      message: "Unable to process request",
    });
  }
}

export default async function GET(req, res) {
  const requestTime = new Date().toISOString();
  try {
    const session = await getSession(req, res);

    if (!session) {
      throw new Error(`Requires authentication`);
    }

    // console.log("session", session.user);
    const userInfo = session.user;

    // get RMA access token
    const rmaAccessToken = await getRmaAccessToken();
    if (!rmaAccessToken) {
      return res.status(401).json({
        success: false,
        message:
          "GET RMA Token = User not authorized to make request to this API",
      });
    }

    // set original url from query path
    const originalUrl = req.query.path.join("/");

    console.log(`Request URL: ${originalUrl}`);

    logToFile("api-get-requests", {
      timestamp: requestTime,
      requestUrl: originalUrl,
    });

    // check if the req url response is cached
    const cachedResponse = cache.get(originalUrl);

    // CDA-BROKERAGE-Broker Representative
    // CDA-BROKERAGE-Broker Manager
    const userRoles = userInfo.rmaAppRoles;
    const userMetaData = userInfo.rmaAppUserMetadata;

    // check if brokerage id is set
    const userBrokerageId =
      userMetaData?.BrokerageIds && userMetaData?.BrokerageIds.length > 0
        ? userMetaData?.BrokerageIds[0]
        : null;

    // console.log("userRoles", userRoles);
    // console.log("userMetaData", userMetaData);
    // console.log("userBrokerageId", userInfo);

    // if user in (CDA-BROKERAGE-Broker Representative, CDA-BROKERAGE-Broker Manager) and userBrokerageId is not set return 403
    if (
      userRoles &&
      userRoles.some(
        (role) =>
          role === "CDA-BROKERAGE-Broker Representative" ||
          role === "CDA-BROKERAGE-Broker Manager",
      ) &&
      !userBrokerageId
    ) {
      return res.status(403).json({
        success: false,
        message: "User not authorized to make request to this API",
      });
    }

    if (cachedResponse) {
      console.log(`Response from cache: ${originalUrl}`);

      // filter response by brokerage id if userBrokerageId is set
      if (
        userBrokerageId &&
        brokerUrl.some((url) => originalUrl.includes(url))
      ) {
        // filter for "clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId"
        if (
          originalUrl.includes(
            "clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId",
          )
        ) {
          // console.log("cachedResponse", cachedResponse);
          const filteredBrokerage =
            cachedResponse.filter((data) => {
              return data.brokerageId === userBrokerageId;
            }) || [];

          return res.status(200).json(filteredBrokerage);
        }
      }

      return res.status(200).json(cachedResponse);
    }

    const url = `${baseUrl}${originalUrl}`;

    console.log(`Forwarding request to RMA: ${url}`);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rmaAccessToken}`,
    };

    let requestObj = {};
    if (req.method === "GET") {
      requestObj = {
        method: req.method,
        url,
        headers,
      };
    } else {
      requestObj = {
        method: req.method,
        url,
        headers,
        data: req.body,
      };
    }
    const response = await axios(requestObj);

    console.log(`Response from RMA: ${response.status}`);

    // if url is for /clc/api/Policy/PolicyIntegration/GetEuropAssistFee then convert the response to json
    // if (
    //   originalUrl.match(
    //     /clc\/api\/Policy\/PolicyIntegration\/GetEuropAssistFee/,
    //   )
    // ) {
    //   // console.log("converting response to json", response.data);
    //   response.data = { europeAssistFee: response.data };
    // }

    // check if response.data is json and if not then return error
    if (typeof response.data !== "object") {
      return res.status(400).json({
        success: false,
        message: "Error in response from RMA",
      });
    }

    // check if the response should be cached and cache it
    // check should be for part of the url as the url may contain query params
    // console.log("url to cache", originalUrl);
    if (urlsToCache.some((url) => originalUrl.includes(url))) {
      cache.set(originalUrl, response.data, 300); // cache for 5 minutes

      console.log(`Response cached: ${originalUrl}`);
    }

    // filter response by brokerage id if userBrokerageId is set
    if (userBrokerageId && brokerUrl.some((url) => originalUrl.includes(url))) {
      // filter for "clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId"
      if (
        originalUrl.includes(
          "clc/api/Policy/Policy/GetParentPolicyBrokerageByBrokerageId",
        )
      ) {
        const filteredBrokerage =
          response.data.filter((data) => {
            return data.brokerageId === userBrokerageId;
          }) || [];

        return res.status(200).json(filteredBrokerage);
      }

      // check clc/api/Policy/Policy/GetPolicyByNumber
      if (originalUrl.match("clc/api/Policy/Policy/GetPolicyByNumber")) {
        if (response.data?.brokerageId !== userBrokerageId) {
          return res.status(200).json(null);
        }
      }
      // check for "clc/api/Policy/Policy/GetPoliciesByRolePlayerIdNumber"
      else if (
        originalUrl.match(
          "clc/api/Policy/Policy/GetPoliciesByRolePlayerIdNumber",
        )
      ) {
        const filteredBrokerage =
          response.data.filter((data) => {
            return data.brokerageId === userBrokerageId;
          }) || [];

        return res.status(200).json(filteredBrokerage);
      }
      // check for "clc/api/Policy/Policy" and response.data is an object
      else if (originalUrl.match(/clc\/api\/Policy\/Policy\/\d+$/)) {
        if (response.data?.brokerageId !== userBrokerageId) {
          return res.status(200).json([]);
        }
      }
    }

    // filter /rma/mdm/api/CommunicationType for 1,3 (Email and SMS)
    if (originalUrl.match("mdm/api/CommunicationType")) {
      const filteredCommunicationType = response.data.filter((data) => {
        return [1, 3].includes(data.id);
      });

      return res.status(200).json(filteredCommunicationType);
    }

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.log(`Error GET: ${error}`);
    // console.log(`Error GET:`, error.response.data);
    logToFile("api-get-requests-error", {
      timestamp: requestTime,
      data: error,
    });
    return res.status(500).json({
      success: false,
      message: "Unable to process request",
    });
  }
}
