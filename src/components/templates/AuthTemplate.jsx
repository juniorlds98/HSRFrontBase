import hospitalBg from "../../assets/images/fachada HSR.jpg";

export function AuthTemplate({ children }) {
  return (
    <main className="auth-page" style={{ backgroundImage: `url(${hospitalBg})` }}>
      <div className="auth-overlay" />
      {children}
    </main>
  );
}
