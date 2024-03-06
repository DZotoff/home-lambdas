import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: 'get',
        path: '/on-call',
        authorizer: {
          name: "timebankKeycloakAuthorizer"
        }
      }
    }
  ],
}