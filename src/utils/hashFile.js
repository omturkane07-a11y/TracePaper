// src/utils/hashFile.js

export async function calculateSHA256(file) {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }

  const arrayBuffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    arrayBuffer
  );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  const hashHex = hashArray
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");

  return hashHex;
}