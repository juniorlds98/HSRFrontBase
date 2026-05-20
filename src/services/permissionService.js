/**
 * ServiÃ§o de PermissÃµes
 * Gerencia acesso a funcionalidades baseado em roles do Keycloak
 */

import { getAccessToken } from "../features/auth/authStorage";

// Mapeamento de telas para roles necessÃ¡rias
const SCREEN_PERMISSIONS = {
  financeiro: ['ROLE_ADMIN', 'ROLE_FINANCEIRO'],
  relatorio: ['ROLE_ADMIN', 'ROLE_RELATORIO', 'ROLE_USER'],
  servicos: ['ROLE_ADMIN', 'ROLE_SERVICOS'],
};

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function getCanonicalRoles(role) {
  const normalized = String(role || "").trim().toUpperCase();
  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("ROLE_")) {
    return [normalized, normalized.replace(/^ROLE_/, "")];
  }

  return [normalized, `ROLE_${normalized}`];
}

/**
 * ObtÃ©m as roles do usuÃ¡rio a partir do token JWT do Keycloak
 * @returns {string[]} Array com roles do usuÃ¡rio
 */
export function getUserRoles() {
  try {
    const token = getAccessToken();
    if (!token) return [];

    const tokenParsed = decodeJwt(token);
    const realmRoles = tokenParsed?.realm_access?.roles || [];
    const resourceAccess = tokenParsed?.resource_access || {};

    const clientRoles = Object.values(resourceAccess)
      .flatMap((client) => client?.roles || []);

    return Array.from(new Set([...realmRoles, ...clientRoles]));
  } catch (error) {
    console.warn('Erro ao extrair roles do token:', error);
    return [];
  }
}

/**
 * Verifica se o usuÃ¡rio possui uma role especÃ­fica
 * @param {string} role - Role a verificar
 * @returns {boolean}
 */
export function hasRole(role) {
  const userRoles = getUserRoles();
  const required = getCanonicalRoles(role);
  if (required.length === 0) return false;

  return userRoles.some((userRole) => {
    const candidates = getCanonicalRoles(userRole);
    return candidates.some((candidate) => required.includes(candidate));
  });
}

/**
 * Verifica se o usuÃ¡rio possui alguma das roles fornecidas
 * @param {string[]} roles - Array de roles
 * @returns {boolean}
 */
export function hasAnyRole(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.some(role => hasRole(role));
}

/**
 * Verifica se o usuÃ¡rio tem acesso a uma tela especÃ­fica
 * @param {string} screenCode - CÃ³digo da tela (ex: 'financeiro', 'relatorio', 'servicos')
 * @returns {boolean}
 */
export function canAccessScreen(screenCode) {
  const requiredRoles = SCREEN_PERMISSIONS[screenCode];
  if (!requiredRoles) return true; // Se nÃ£o hÃ¡ restriÃ§Ã£o definida, permite acesso
  return hasAnyRole(requiredRoles);
}

/**
 * ObtÃ©m a lista de telas que o usuÃ¡rio pode acessar
 * @returns {string[]} Array com cÃ³digos das telas acessÃ­veis
 */
export function getAccessibleScreens() {
  return Object.keys(SCREEN_PERMISSIONS).filter(screen => canAccessScreen(screen));
}

/**
 * Verifica se o usuÃ¡rio Ã© admin (possui ROLE_ADMIN)
 * @returns {boolean}
 */
export function isAdmin() {
  return hasRole('ROLE_ADMIN');
}

/**
 * ObtÃ©m informaÃ§Ãµes do usuÃ¡rio do token
 * @returns {object} Objeto com informaÃ§Ãµes do usuÃ¡rio
 */
export function getUserInfo() {
  try {
    const keycloak = window.keycloak;
    if (!keycloak?.tokenParsed) return {};
    
    const tokenParsed = keycloak.tokenParsed;
    return {
      sub: tokenParsed.sub,
      name: tokenParsed.name,
      email: tokenParsed.email,
      roles: getUserRoles(),
      isAdmin: isAdmin(),
    };
  } catch (error) {
    console.warn('Erro ao extrair informaÃ§Ãµes do usuÃ¡rio:', error);
    return {};
  }
}

