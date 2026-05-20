import { useState } from "react";
import { Button } from "../atoms/Button";
import { TextInput } from "../atoms/TextInput";

export function LoginForm({ onSubmit, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ username, password });
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <TextInput
        id="username"
        label="UsuÃ¡rio"
        placeholder="Digite seu usuÃ¡rio"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />

      <TextInput
        id="password"
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

