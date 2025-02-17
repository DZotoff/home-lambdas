import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { vacationRequestService } from "src/database/services";
import type vacationRequestSchema from "src/schema/vacationRequest";

/**
 * Lambda function to update a vacation request
 *
 * @param event event
 */
const updateVacationRequestHandler: ValidatedEventAPIGatewayProxyEvent<typeof vacationRequestSchema> = async event => {
  const { pathParameters, body } = event;
  const {
    createdAt,
    createdBy,
    days,
    draft,
    endDate,
    message,
    startDate,
    status,
    type,
    updatedAt,
    userId
  } = body;
  const id = pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: "Bad request, missing id"
    };
  }

  if(!userId || !startDate || !endDate || !days || !type || !status || !message || !createdBy || !createdAt || !updatedAt) {
    return {
      statusCode: 400,
      body: "Invalid request body. Some data is missing."
    }
  }

  const existingVacationRequest = await vacationRequestService.findVacationRequest(id);
  if (!existingVacationRequest) {
    return {
      statusCode: 404,
      body: `Vacation request ${id} not found`
    };
  }

  const vacationRequestUpdates = {
    id: existingVacationRequest.id,
    userId: existingVacationRequest.userId,
    draft: draft ? draft : false,
    startDate: startDate,
    endDate: endDate,
    days: days,
    type: type,
    status: status,
    message: message,
    createdBy: existingVacationRequest.createdBy,
    createdAt: existingVacationRequest.createdAt,
    updatedAt: updatedAt
  };

  try {
    const updatedVacationRequest = await vacationRequestService.updateVacationRequest(vacationRequestUpdates);
    return {
      statusCode: 200,
      body: JSON.stringify(updatedVacationRequest)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error updating vacation request record with id ${id}, ${error}`
    };
  }
};

export const main = middyfy(updateVacationRequestHandler);