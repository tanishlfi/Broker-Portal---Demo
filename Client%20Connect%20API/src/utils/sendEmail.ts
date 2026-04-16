const nodemailer = require("nodemailer");
import * as msal from "@azure/msal-node";
import { logger } from "../middleware/logger";
import axios from "axios";
import cache from "../utils/cache";

// options = {email,subject,message}

// await sendEmail("wayne@cda.co.za", "this is the subject", "this is the message");

// options types

interface Options {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: Options) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  // send mail with defined transport object
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email, // list of receivers
    subject: options.subject, // Subject line

    html: options.message, // html body
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  // Add DataBase Logging
};

const getMSALToken = async () => {
  try {
    // check if token exists in cache
    if (cache.has("emailAccessToken")) {
      logger.debug("Email Token is in cache");

      // return token from cache
      return cache.get("emailAccessToken");
    }

    const msalConfig: msal.Configuration = {
      auth: {
        clientId: process.env.RMA_MSAL_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${process.env.RMA_MSAL_TENANT_ID}`,
        clientSecret: process.env.RMA_MSAL_SECRET,
      },
    };
    // console.log(`MSAL Config: ${JSON.stringify(msalConfig)}`);
    const cca = new msal.ConfidentialClientApplication(msalConfig);

    const authResult = await cca.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });

    if (authResult === null) {
      return null;
    }

    // console.log(`Access token: ${JSON.stringify(authResult)}`);

    // set token in cache for expiry time - 10 minutes
    const expiryTime = authResult?.expiresOn
      ? authResult?.expiresOn?.getTime() - 600000
      : 0;

    cache.set("emailAccessToken", authResult?.accessToken, expiryTime);

    return authResult?.accessToken;
  } catch (err) {
    console.log(`Access token err: ${err}`);
    logger.error(err);
  }
};

// send email with graph api using msal token in try catch block
export const sendEmailWithGraphApi = async (
  emailTo: string,
  subject: string,
  message: string,
  contentType: string = "Text",
  fromEmail: string = "noreply@randmutual.co.za",
) => {
  // get token
  const token = await getMSALToken();

  if (token === null) {
    return null;
  }
  try {
    const endpoint = `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`;
    const data = {
      Message: {
        Subject: subject,
        Body: {
          ContentType: contentType,
          Content: message,
        },
        ToRecipients: [
          {
            EmailAddress: {
              Address: emailTo,
            },
          },
        ],
      },
      SaveToSentItems: "false",
    };

    // post request config
    const config = {
      method: "post",
      url: endpoint,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };

    // get response
    const response = await axios(config);

    return { result: true, data: response.data };
  } catch (err) {
    logger.error(err);
    return { result: false, data: err };
  }
  return { result: false, data: null };
};
