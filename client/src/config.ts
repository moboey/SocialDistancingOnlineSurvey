// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'u9qevv47ji'
export const apiEndpoint = `https://${apiId}.execute-api.ap-southeast-1.amazonaws.com/dev/survey`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-nb46-pro.auth0.com',            // Auth0 domain
  clientId: '5D9c2k94JBTpSa16ySpuv6yvCvsk0ahj',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback' 
}
