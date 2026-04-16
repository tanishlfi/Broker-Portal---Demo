// Add bellow trusted domains, access tokens will automatically injected to be send to
// trusted domain can also be a path like https://www.myapi.com/users,
// then all subroute like https://www.myapi.com/useers/1 will be authorized to send access_token to.

// Domains used by OIDC server must be also declared here
const trustedDomains = {
  default: [
    "https://tst-life.randmutual.co.za/",
    "https://tst-life.randmutual.co.za/auth",
    "http://localhost:4200",
    "http://localhost:4200/authentication/callback",
    "http://localhost:4200/signin-callback",
  ],
  config_classic: ["https://tst-life.randmutual.co.za"],
  config_without_silent_login: ["https://tst-life.randmutual.co.za/"],
  config_without_refresh_token: ["https://tst-life.randmutual.co.za/"],
  config_without_refresh_token_silent_login: [
    "https://tst-life.randmutual.co.za/",
  ],
  config_with_hash: ["https://tst-life.randmutual.co.za/"],
};
