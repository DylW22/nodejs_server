import { GoogleAuth, JWT, UserRefreshClient } from "google-auth-library";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { google } from "googleapis";
const secretClient = new SecretManagerServiceClient();
// Function to retrieve the secret from Secret Manager
async function accessSecret(secretName: string) {
  const [version] = await secretClient.accessSecretVersion({
    name: `projects/fifth-pact-440808-b3/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload;
  if (payload?.data) {
    console.log("payload type: ", typeof payload.data);
    //return JSON.parse((payload.data as Buffer).toString("utf8"));
    return JSON.parse((payload.data as Buffer).toString("utf8"));
  }
  throw new Error("Secret payload is empty.");
}

// Function to authenticate using the secret credentials

interface AuthResponse {
  client: JWT | UserRefreshClient | any; // Adjust the types as needed
  projectId: string;
}

async function cloudAuthenticate(): Promise<AuthResponse | undefined> {
  try {
    // Retrieve credentials from Secret Manager
    const credentials = await accessSecret("my-credentials");

    // Use GoogleAuth with the credentials from Secret Manager
    const auth = new GoogleAuth({
      credentials, // Provide credentials directly
      scopes: "https://www.googleapis.com/auth/cloud-platform", // Specify the required scopes
    });

    // Get the authenticated client
    const client = await auth.getClient();

    // Now you can use this client to interact with Google Cloud services
    const projectId = await auth.getProjectId();
    return { client, projectId };
  } catch (err) {
    console.error("Failed to authenticate with Google Cloud:", err);
    return undefined;
  }
}

async function authenticateWithSecret() {
  const credentials = await accessSecret("my-credentials");
  const authClient = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: "https://www.googleapis.com/auth/cloud-platform", // Example scope
  }).getClient();

  return authClient;
}

export { cloudAuthenticate, authenticateWithSecret };
