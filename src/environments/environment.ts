/** Public defaults only. Deployments provide /assets/runtime-config.json. */
export const environment = {
  production: false,
  base_url: 'http://127.0.0.1:3000',
  amplify: { Auth: {
    userPoolId: 'ap-northeast-1_LOCAL',
    userPoolWebClientId: 'localclient',
  } },
};
