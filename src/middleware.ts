export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/worlds/:path*",
    "/learn/:path*",
    "/arena/:path*",
    "/ide/:path*",
    "/labs/:path*",
    "/mastery/:path*",
    "/history/:path*",
    "/projects/:path*",
    "/settings/:path*"
  ]
};
