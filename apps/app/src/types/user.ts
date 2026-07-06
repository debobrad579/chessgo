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

export type LichessAccount =
  | { connected: false }
  | { connected: true; id: string; username: string; access_token: string }

export function assertLichessAccount(
  account: unknown,
): asserts account is LichessAccount {
  if (
    account == null ||
    typeof account !== "object" ||
    !("connected" in account) ||
    typeof account.connected !== "boolean"
  )
    throw new Error(`Invalid Lichess Account: ${JSON.stringify(account)}`)

  if (
    account.connected &&
    (!("id" in account) ||
      typeof account.id !== "string" ||
      !("username" in account) ||
      typeof account.username !== "string" ||
      !("access_token" in account) ||
      typeof account.access_token !== "string")
  )
    throw new Error(`Invalid Lichess Account: ${JSON.stringify(account)}`)
}
