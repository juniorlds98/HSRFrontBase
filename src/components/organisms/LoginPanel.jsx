import { LogoBadge } from "../atoms/LogoBadge";
import { LoginForm } from "../molecules/LoginForm";

export function LoginPanel({ onLogin, loading, error }) {
  return (
    <section className="login-panel">
      <LogoBadge />
      <hr className="separator" />
      <h1>Seja bem vindo!</h1>
      <p className="login-subtitle">
        Estrutura hospitalar completa para cirurgias estéticas, reparadoras e procedimentos de curta internacao.
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      <LoginForm onSubmit={onLogin} loading={loading} />
    </section>
  );
}
