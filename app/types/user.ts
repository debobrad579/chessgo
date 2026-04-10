export type User = {
  id: string
  created_at: string
  updated_at: string
  email: string
  name: string
}

export function assertUser(user: unknown): asserts user is User {
  if (
    user == null ||
    typeof user !== "object" ||
    !("id" in user) ||
    typeof user.id !== "string" ||
    !("created_at" in user) ||
    typeof user.created_at !== "string" ||
    !("updated_at" in user) ||
    typeof user.updated_at !== "string" ||
    !("email" in user) ||
    typeof user.email !== "string" ||
    !("name" in user) ||
    typeof user.name !== "string"
  )
    throw new Error(`Invalid User: ${JSON.stringify(user)}`)
}
