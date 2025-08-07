import { useUser } from "@clerk/nextjs";

const { user } = useUser();
const email = user?.emailAddresses[0]?.emailAddress;

await fetch("/api/save-user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email }),
});
