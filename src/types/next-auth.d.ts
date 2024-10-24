import "next-auth";
import { DefaultSession } from "next-auth";

// importing the whole next-auth package and updating the interface by adding some extra fields so the error could gone from options.ts file in callback section
declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }

  //modifing the session too as we're storing data on session also
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession["user"];
  }
}

//another method and modifing jwt too
declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
