// Where the optional shared login and the results API live. Nothing here is needed to play.
//
// The shared cookie (sso_access) is set for *.hedgies.cloud, so signing in only works on a page served from there.
// Everywhere else (GitHub Pages, localhost, a preview) the account features stay hidden and the app is exactly the offline app.
// Vite variables for local testing against a real stack:
//   VITE_SSO_DOMAIN   domain of the shared platform (default hedgies.cloud)
//   VITE_AUTH_BASE    full URL of the login service (default https://auth.<domain>)
//   VITE_API_BASE     where /api/v1 is served (default: same origin)
//   VITE_FORCE_SYNC   '1' to show the account features on any origin (development only)
const env=import.meta.env??{};

export const SSO_DOMAIN=env.VITE_SSO_DOMAIN||'hedgies.cloud';
export const AUTH_BASE=(env.VITE_AUTH_BASE||`https://auth.${SSO_DOMAIN}`).replace(/\/$/,'');
export const API_BASE=(env.VITE_API_BASE||'').replace(/\/$/,'')+'/api/v1';

export function syncAvailable(hostname=globalThis.location?.hostname||''){
 if(env.VITE_FORCE_SYNC==='1')return true;
 return hostname===SSO_DOMAIN||hostname.endsWith('.'+SSO_DOMAIN);
}
