import {middyfy} from "src/libs/lambda";
import {vacationRequestService} from "src/database/services";
import {v4 as uuidv4} from "uuid";
import type {ValidatedEventAPIGatewayProxyEvent} from "src/libs/api-gateway";
import type vacationRequestSchema from "src/schema/vacationRequest";
import VacationRequestModel from "@database/models/vacationRequest";

/**
 * Handler for creating a new vacation request entry in DynamoDB.
 *
 * @param event - API Gateway event containing the request body.
 * @returns Response object with status code
 */
export const createVacationRequestHandler: ValidatedEventAPIGatewayProxyEvent<typeof vacationRequestSchema> = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Request body is required." })
        };
    }

    const { personId, draft, startDate, endDate, days, type, message, createdBy, createdAt, updatedAt, updatedBy} = event.body;

    if (!personId || !draft || !startDate || !endDate || !days || !type || !message || !createdBy || !createdAt || !updatedAt || !updatedBy) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Some required data is missing !" })
        };
    }

    const newVacationRequestId: string = uuidv4();

    try {
        const createdVacationRequest = await vacationRequestService.createVacationRequest({
            id: newVacationRequestId,
            personId: personId,
            draft: draft,
            startDate: startDate,
            endDate: endDate,
            days: days,
            type: type,
            message: message,
            createdBy: createdBy,
            createdAt: createdAt,
            updatedAt: updatedAt,
            updatedBy: updatedBy
        });

        return {
            statusCode: 201,
            body: JSON.stringify(createdVacationRequest)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: `Failed to create vacation request entry ${error}`
        }
    }
};

export const main = middyfy(createVacationRequestHandler);
