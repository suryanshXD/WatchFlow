"use client";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export function Appbar() {
  return (
    <>
      <div className="w-full flex justify-between px-20 py-3.5 fixed backdrop-blur-lg border-b border-gray-300 z-50">
        <div className="text-2xl text-black font-semibold cursor-pointer">
          <Link href={"/"}>WatchFlow</Link>
        </div>
        <div>
          <SignedOut>
            <SignInButton>
              <Button className="px-3 py-2">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button className="ml-2 px-3 py-2">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </>
  );
}
