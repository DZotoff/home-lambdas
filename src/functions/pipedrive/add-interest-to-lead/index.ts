import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: 'PATCH',
        path: '/addLeadInterest/{id}',
        authorizer: {
          name: "timebankKeycloakAuthorizer"
        }
      },
    },
  ],
}