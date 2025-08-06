"use client";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function Appbar() {
  return (
    <>
      <div className="w-full flex justify-between bg-stone-800 px-20 py-3.5">
        <div className="text-xl text-white">WatchFlow</div>
        <div>
          <SignedOut>
            <SignInButton>
              <button className="bg-blue-400 text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-8 px-2.5  cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-blue-400 text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-8 px-2.5  cursor-pointer ml-2">
                Sign Up
              </button>
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
