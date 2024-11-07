//const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
const client = new SecretManagerServiceClient();

async function accessSecret(secret_name: string): Promise<string> {
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/fifth-pact-440808-b3/secrets/${secret_name}/versions/latest`,
    });

    const payload = version.payload; //?.data?.toString("utf8");

    if (payload?.data) {
      //console.log("Secret payload:", payload.data);
      return (payload.data as Buffer).toString("utf8");
    }

    throw new Error("Secret payload is empty.");
  } catch (error) {
    console.error(`Failed to access secret ${secret_name}:`, error);
    throw new Error(`Failed to access secret ${secret_name}: ${error}`);
  }
}
export default accessSecret;
