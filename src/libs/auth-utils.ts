import { APIGatewayProxyEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

interface DecodedToken {
  sub: string;
  realm_access?: {
    roles: string[];
  };
}

/**
 * Helper function to get the user's sub (user ID) and roles from the Authorization header.
 * @param event - The API Gateway event containing the headers.
 * @returns The sub claim (user ID) and roles.
 */
export const getAuthDataFromToken = (event: { headers: APIGatewayProxyEvent['headers'] }): DecodedToken | null => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    
    if (!authHeader) {
      console.error("Missing Authorization header.");
      return null;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.error("Authorization header does not contain a valid token.");
      return null;
    }

    const decodedToken = jwt.decode(token) as DecodedToken;

    if (!decodedToken || typeof decodedToken === 'string') {
      console.error("Invalid token format or content.");
      return null;
    }

    if (!decodedToken.sub) {
      console.error("Token is missing 'sub' claim.");
      return null;
    }

    console.log('Decoded JWT Token:', JSON.stringify(decodedToken, null, 2));

    return {
      sub: decodedToken.sub,
      realm_access: decodedToken.realm_access
    };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};
