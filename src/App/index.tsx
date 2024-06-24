// src/App.js
import { AuthProvider, useAuth } from "../AuthProvider";
import FileViewer from "../FileViewer";
import "./index.css";

const AppContent = () => {
  const auth = useAuth();
  const { account, login, logout } = auth || {};

  return (
    <div className="App">
      <header>
          <div className="logo">OneDrive File Viewer</div>
          {account ? (
            <button className="login" onClick={logout}>Logout</button>
          ) : (
            <button className="logout" onClick={login}>Login</button>
          )}
      </header>
      <main>
        {account ? <FileViewer /> : <div>Please log in to view your files.</div>}
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
