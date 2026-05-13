import axios from "axios";

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8080";
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? "crm-realm";
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "crm-frontend";

function getTokenEndpoint() {
  return `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
}

function getLogoutEndpoint() {
  return `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;
}

export function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

export async function refreshAccessToken(refreshToken) {
  const payload = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "openid profile email",
  });

  const { data } = await axios.post(getTokenEndpoint(), payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const tokenPayload = decodeJwt(data.access_token);
  const user = {
    username: tokenPayload.preferred_username ?? "",
    name: tokenPayload.name ?? tokenPayload.given_name ?? "",
    email: tokenPayload.email ?? "",
    roles: tokenPayload.realm_access?.roles ?? [],
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    user,
  };
}

export async function loginWithPassword(username, password) {
  const payload = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    grant_type: "password",
    username,
    password,
    scope: "openid profile email",
  });

  const { data } = await axios.post(getTokenEndpoint(), payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const tokenPayload = decodeJwt(data.access_token);
  const user = {
    username: tokenPayload.preferred_username ?? username,
    name: tokenPayload.name ?? tokenPayload.given_name ?? username,
    email: tokenPayload.email ?? "",
    roles: tokenPayload.realm_access?.roles ?? [],
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user,
  };
}

export async function logoutFromKeycloak(refreshToken) {
  if (!refreshToken) {
    return;
  }

  const payload = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    refresh_token: refreshToken,
  });

  await axios.post(getLogoutEndpoint(), payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}
