import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginPanel } from "../components/organisms/LoginPanel";
import { AuthTemplate } from "../components/templates/AuthTemplate";
import { useAuth } from "../features/auth/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin({ username, password }) {
    setErrorMessage("");

    const result = await login(username, password);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  return (
    <AuthTemplate>
      <LoginPanel onLogin={handleLogin} loading={isLoading} error={errorMessage} />
    </AuthTemplate>
  );
}

