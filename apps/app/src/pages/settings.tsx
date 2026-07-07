import { useLichessAccount } from "@/context/LichessContext"
import { useUser } from "@/context/UserContext"
import { API_BASE } from "@/lib/api"
import { Button } from "@chessgo/ui/button"

export default function SettingsPage() {
  const user = useUser()
  const lichessAccount = useLichessAccount()

  return (
    <div className="m-auto max-w-96 space-y-4">
      {" "}
      {!user.email ? (
        <h1 className="text-center text-4xl font-bold">
          Must be logged in to change settings
        </h1>
      ) : (
        <>
          <h1 className="text-center text-4xl font-bold">Settings</h1>
          {!lichessAccount.connected ? (
            <Button
              className="w-full"
              disabled={lichessAccount.connected}
              onClick={() => {
                fetch(`${API_BASE}/lichess/tokens`, {
                  method: "POST",
                  credentials: "include",
                })
                  .then((res) => res.json())
                  .then((data) => {
                    const authURL = data.authURL
                    if (typeof authURL === "string") {
                      window.location.href = authURL
                    }
                  })
              }}
            >
              Link Lichess Account
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                fetch(`${API_BASE}/lichess/tokens`, {
                  method: "DELETE",
                  credentials: "include",
                })
              }}
            >
              Unlink Lichess Account
            </Button>
          )}
        </>
      )}
    </div>
  )
}
