import { APIGatewayProxyHandler } from "aws-lambda";
import { middyfy } from "src/libs/lambda";
import { getBaseFolderFiles, uploadDocsContentAsPdf } from "src/service/google-drive-api-service";


/**
 * Converts all docs within main root folder to pdf format
 */
const convertToPdf = async () => { 
  const files = await getBaseFolderFiles();
  for (const file of files) {
    await uploadDocsContentAsPdf(file);
  }
};

/**
 * Lambda for uploading PDFs.
 * 
 * @returns JSON response
 */
export const uploadGoogleFileHandler: APIGatewayProxyHandler = async () => {
  try {
    await convertToPdf();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Files created successfully" })
    };

  } catch (error) {
    console.error("Error upoading pdf:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload PDFs.', details: error.message }),
    };
  }
};

export const main = middyfy(uploadGoogleFileHandler);