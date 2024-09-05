import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { CreateKeycloakApiService, type KeycloakApiService } from "src/apis/keycloak-api-service";
import { middyfy } from "src/libs/lambda";

/**
 * Response schema for lambda
 */
interface Response {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  severaGuid: string;
  forecastId: number;
}

/**
 * Gets user from keycloak
 *
 * @param api
 * @param userId
 * @returns user information by Id
 */
const findUser = async (api: KeycloakApiService, userId: string): Promise<Response[]> => {
  const user = await api.findUser(userId);

  return user.map((user) => {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      severaGuid: user.severaGuid,
      forecastId: user.forecastId
    };
  });
};

const findUserHandler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent) => {
  const api = CreateKeycloakApiService();
  const { queryStringParameters } = _event;

  // Ensure queryStringParameters and id are present
  if (!queryStringParameters || !queryStringParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid path parameter: id" })
    };
  }

  try {
    const userById = await findUser(api, queryStringParameters.id);

    if (userById && userById.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(userById)
      };
    }
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "User not found" })
    };
  } catch (error) {
    console.error("Error finding user from KeyCloak:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to retrieve user.", details: error.message })
    };
  }
};

export const main = middyfy(findUserHandler);
