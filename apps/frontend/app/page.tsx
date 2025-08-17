import Image from "next/image";
import { auth } from "./utils/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }

  return <div>Hello signed in user</div>;
}
