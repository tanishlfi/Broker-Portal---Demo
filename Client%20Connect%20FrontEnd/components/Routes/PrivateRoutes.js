import { useEffect } from "react";
import { useRouter } from "next/router";

import { useOidc } from "@axa-fr/react-oidc";
import Loading from "../Bits/Loading";

export default function PrivateRoute({ protectedRoutes, children }) {
  const router = useRouter();

  const { isAuthenticated } = useOidc();

  let authedTemp = true;

  const pathIsProtected = protectedRoutes.indexOf(router.pathname) !== -1;

  useEffect(() => {
    if (!isAuthenticated && pathIsProtected) {
      // Redirect route, you can point this to /login
      router.push("/Login");
    }
  }, [isAuthenticated, pathIsProtected, router]);

  if (!isAuthenticated && pathIsProtected) {
    return <Loading />;
  }

  return children;
}
