import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  type BlobDownloadResponseParsed,
  type ContainerClient,
} from "@azure/storage-blob";

type UploadToAzureBlobInput = {
  buffer: Buffer;
  blobName: string;
  contentType: string;
};

let containerClientCache: ContainerClient | null = null;
let ensureContainerPromise: Promise<void> | null = null;

function getStorageConfig() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER;

  if (!containerName) {
    throw new Error("Missing AZURE_STORAGE_CONTAINER environment variable.");
  }

  return { connectionString, accountName, accountKey, containerName };
}

function getContainerClient() {
  if (containerClientCache) return containerClientCache;

  const { connectionString, accountName, accountKey, containerName } =
    getStorageConfig();

  if (connectionString) {
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    containerClientCache = blobServiceClient.getContainerClient(containerName);
    return containerClientCache;
  }

  if (!accountName || !accountKey) {
    throw new Error(
      "Missing Azure storage credentials. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY."
    );
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  );
  containerClientCache = blobServiceClient.getContainerClient(containerName);
  return containerClientCache;
}

async function ensureContainerExists(containerClient: ContainerClient) {
  if (!ensureContainerPromise) {
    ensureContainerPromise = containerClient
      .createIfNotExists()
      .then(() => undefined)
      .catch((error) => {
        ensureContainerPromise = null;
        throw error;
      });
  }
  await ensureContainerPromise;
}

export async function uploadBufferToAzureBlob({
  buffer,
  blobName,
  contentType,
}: UploadToAzureBlobInput) {
  const containerClient = getContainerClient();
  await ensureContainerExists(containerClient);

  const normalizedBlobName = blobName.replace(/\\/g, "/");
  const blockBlobClient = containerClient.getBlockBlobClient(normalizedBlobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType || "application/octet-stream",
      blobCacheControl: "public, max-age=31536000",
    },
  });

  return blockBlobClient.url;
}

export async function downloadBlobByName(
  blobName: string
): Promise<BlobDownloadResponseParsed> {
  const containerClient = getContainerClient();
  const normalizedBlobName = blobName.replace(/^\/+/, "").replace(/\\/g, "/");
  const blobClient = containerClient.getBlobClient(normalizedBlobName);
  return blobClient.download();
}

export async function doesBlobExist(blobName: string): Promise<boolean> {
  const containerClient = getContainerClient();
  const normalizedBlobName = blobName.replace(/^\/+/, "").replace(/\\/g, "/");
  const blobClient = containerClient.getBlobClient(normalizedBlobName);
  return blobClient.exists();
}

export function isAzureBlobUrl(inputUrl: string) {
  try {
    const parsed = new URL(inputUrl);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.hostname.endsWith(".blob.core.windows.net")
    );
  } catch {
    return false;
  }
}

function extractBlobNameFromAzureUrl(inputUrl: string) {
  try {
    const parsed = new URL(inputUrl);
    const { containerName } = getStorageConfig();
    const path = parsed.pathname.replace(/^\/+/, "");
    if (!path) return null;
    const segments = path.split("/");
    if (segments.length < 2) return null;
    if (segments[0] !== containerName) return null;
    return decodeURIComponent(segments.slice(1).join("/"));
  } catch {
    return null;
  }
}

export function extractBlobNameFromAppImageUrl(inputUrl: string) {
  const trimmed = String(inputUrl || "").trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/api/blob/")) {
    const rawPath = trimmed.slice("/api/blob/".length);
    if (!rawPath) return null;
    return rawPath
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/");
  }

  if (trimmed.startsWith("/api/blob?blob=")) {
    const rawBlob = trimmed.slice("/api/blob?blob=".length);
    if (!rawBlob) return null;
    return decodeURIComponent(rawBlob).replace(/^\/+/, "");
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.replace(/^\/+/, "");
  }

  if (isAzureBlobUrl(trimmed)) {
    return extractBlobNameFromAzureUrl(trimmed);
  }

  return null;
}

export function toAppImageUrl(inputUrl: string) {
  const trimmed = String(inputUrl || "").trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("/api/blob?blob=")) {
    const rawBlob = trimmed.slice("/api/blob?blob=".length);
    const decodedBlob = decodeURIComponent(rawBlob).replace(/^\/+/, "");
    const safePath = decodedBlob
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `/api/blob/${safePath}`;
  }

  if (
    trimmed.startsWith("/uploads/home-content/") &&
    !trimmed.startsWith("/uploads/home-content/placeholders/")
  ) {
    const blobName = trimmed.replace(/^\/+/, "");
    const safePath = blobName
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `/api/blob/${safePath}`;
  }
  if (!isAzureBlobUrl(trimmed)) return trimmed;

  const blobName = extractBlobNameFromAzureUrl(trimmed);
  if (!blobName) return trimmed;

  const safePath = blobName
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/blob/${safePath}`;
}

// Optional direct-upload SAS helper (kept for compatibility if needed later)
export function generateUploadUrl(fileName: string, contentType: string) {
  const { accountName, accountKey, containerName } = getStorageConfig();
  if (!accountName || !accountKey) {
    throw new Error(
      "generateUploadUrl requires AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY."
    );
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const blobName = `${Date.now()}-${fileName}`;
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      expiresOn: new Date(Date.now() + 10 * 60 * 1000),
      contentType,
    },
    credential
  ).toString();

  const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  return {
    uploadUrl: `${url}?${sas}`,
    fileUrl: url,
    blobName,
  };
}
