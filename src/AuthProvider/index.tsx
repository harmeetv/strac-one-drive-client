// src/AuthProvider.js
import { createContext, useContext, useState, ReactNode } from "react";
import { msalInstance } from "./config";
import { AccountInfo } from "@azure/msal-browser";
import useLegacyEffect from "../hooks/useLegacyEffect";

const AuthContext = createContext<{ account: AccountInfo | null; accessToken: string | null; login: () => Promise<void>; logout: () => void; } | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // handle logic to refresh access token before it expires
  useLegacyEffect(() => {
    const interval = setInterval(async () => {
      if (account) {
        try {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ["Files.Read.All", "Sites.Read.All"],
            account: account,
          });
          setAccessToken(tokenResponse.accessToken);
        } catch (error) {
          console.error("Failed to refresh access token", error);
        }
      }
    }, 1000 * 60 * 5); // 5 minutes

    return () => clearInterval(interval);
  }, [account]);

  useLegacyEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        setIsInitialized(true);
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // set access token
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ["Files.Read.All", "Sites.Read.All"],
            account: accounts[0],
          });
          setAccessToken(tokenResponse.accessToken);
        }
      } catch (error) {
        console.error("MSAL initialization failed", error);
      }
    };

    initializeMsal();
  }, []);

  const login = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["Files.Read.All", "Sites.Read.All"],
      });
      setAccessToken(loginResponse.accessToken);
      setAccount(loginResponse.account);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    msalInstance.logoutPopup().then(() => {
      setAccount(null);
      setAccessToken(null);
    });
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ account, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
