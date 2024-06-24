// src/authConfig.js
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: import.meta.env.REACT_APP_ONEDRIVE_CLIENT_ID, // Replace with your client ID
    authority: "https://login.microsoftonline.com/Common",
    redirectUri: import.meta.env.REACT_APP_ONEDRIVE_REDIRECT_URI
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
