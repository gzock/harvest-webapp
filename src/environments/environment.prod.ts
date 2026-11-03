/** All deployment-specific values are validated and supplied before bootstrap. */
export const environment = {
  production: true,
  base_url: '',
  amplify: { Auth: { userPoolId: '', userPoolWebClientId: '' } },
};
