const logo = "/assets/images/logo-login.png";

export function LogoBadge() {
  return (
    <div className="logo-badge" aria-label="Hospital Sao Rafael">
      <img src={logo} alt="Hospital Sao Rafael" className="logo-image" />
    </div>
  );
}

