// src/authConfig.js
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "52b573ba-c4e5-42e5-9855-1ad0536ae3c3", // Replace with your client ID
    authority: "https://login.microsoftonline.com/Common", // Replace with your tenant ID
    redirectUri: process.env.REACT_APP_ONEDRIVE_REDIRECT_URI
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
