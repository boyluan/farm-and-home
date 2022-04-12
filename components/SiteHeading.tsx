import { PropsWithChildren } from "react";

export default function SiteHeading({ children }: PropsWithChildren<{}>) {
  return <h1 className="font-loader2 text-8xl my-8 font-extrabold self-center text-transparent bg-clip-text bg-gradient-to-r from-black to-black">{children}</h1>
}
