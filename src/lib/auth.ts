import { jwtVerify, SignJWT } from "jose"

const SECRET_KEY = process.env.JWT_SECRET || "ola-cloud-super-secret-key-for-dev-only-2026"
const encodedKey = new TextEncoder().encode(SECRET_KEY)

export async function signJWT(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey)
    return payload
  } catch (error) {
    return null
  }
}
