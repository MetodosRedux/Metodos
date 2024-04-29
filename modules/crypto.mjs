import { createHmac } from "crypto";

export function generateHash(data) {
  const hash = createHmac("sha256", process.env.CRYPTO)
    .update(data)
    .digest("hex");

  return hash;
}
