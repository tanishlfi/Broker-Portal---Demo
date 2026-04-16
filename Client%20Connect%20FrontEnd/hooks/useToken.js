import axios from "axios";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

const useToken = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  const fetchToken = async () => {
    const response = await axios.get(`/api/accessToken`);
    const accessToken = response?.data?.accessToken;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    let decoded;
    try {
      decoded = jwtDecode(accessToken);
      setUserId(decoded.sub);
    } catch (error) {
      throw new Error("Failed to decode token");
    }

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      throw new Error("Token expired");
    }

    return { accessToken, decoded };
  };

  const { data } = useQuery(["userToken", userId], fetchToken, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache for 10 minutes after it's stale
    onError: (err) => {
      console.error(err);
      router.push("/api/auth/login");
    },
  });

  return data?.accessToken;
};

export default useToken;

// hooks/useToken.js
// import axios from "axios";
// import { useRouter } from "next/router";
// import { useQuery, useQueryClient } from "react-query"; // Import useQueryClient
// import { jwtDecode } from "jwt-decode";
// // Removed useState for userId as it's problematic for the query key here
// import { useUser } from "@auth0/nextjs-auth0/client"; // Import for reliable user state

// const useToken = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const { user, isLoading: isUserLoading, error: auth0UserError } = useUser(); // Get user state from Auth0

//   const fetchToken = async () => {
//     console.log(
//       "useToken: fetchToken called. Current Auth0 user from useUser:",
//       user?.sub
//     );

//     // If useUser indicates no authenticated user, we shouldn't proceed.
//     // This check is somewhat redundant due to `enabled` in useQuery, but good for clarity.
//     if (!user) {
//       console.warn(
//         "useToken: No active Auth0 user session. Aborting token fetch."
//       );
//       throw new Error("User not authenticated");
//     }

//     const response = await axios.get(`/api/accessToken`);
//     const accessToken = response?.data?.accessToken;

//     if (!accessToken) {
//       console.warn("useToken: /api/accessToken did not return a token.");
//       throw new Error("No access token found from API");
//     }

//     let decoded;
//     try {
//       decoded = jwtDecode(accessToken);
//     } catch (error) {
//       console.error("useToken: Failed to decode token", error);
//       throw new Error("Failed to decode token");
//     }

//     // Check if token is expired
//     if (decoded.exp * 1000 < Date.now()) {
//       console.warn("useToken: Fetched token is already expired.");
//       throw new Error("Token expired");
//     }

//     console.log(
//       "useToken: Successfully fetched and decoded token for sub:",
//       decoded.sub
//     );
//     // Important: Verify if decoded.sub matches user.sub from useUser()
//     if (user && decoded.sub !== user.sub) {
//       console.error(
//         `CRITICAL MISMATCH: Auth0 context user (${user.sub}) vs Token user (${decoded.sub})`
//       );
//       // This indicates a severe problem, potentially that /api/accessToken is still somehow
//       // returning an old token despite a new user session.
//       // Or that the Auth0 client-side user state updated faster/slower than the token refetch.
//       // Consider invalidating and re-fetching or forcing logout/login.
//     }

//     return { accessToken, decoded };
//   };

//   // Query key now depends on `user?.sub` from the Auth0 client SDK.
//   // This ensures that if the user changes, react-query treats it as a new query.
//   const queryKey = ["currentUserAccessToken", user?.sub];

//   const { data, error, isLoading, isError } = useQuery(queryKey, fetchToken, {
//     staleTime: 1 * 60 * 1000, // 1 minute (adjust as needed)
//     cacheTime: 5 * 60 * 1000, // 5 minutes (adjust as needed)
//     enabled: !isUserLoading && !!user && !auth0UserError, // Only run query if user is loaded, exists, and no auth error
//     retry: (failureCount, err) => {
//       // Don't endlessly retry auth-related errors
//       if (
//         err.message === "No access token found from API" ||
//         err.message === "User not authenticated" ||
//         err.message === "Token expired"
//       ) {
//         return false;
//       }
//       return failureCount < 2; // Retry other types of errors a couple of times
//     },
//     onError: (err) => {
//       console.error(
//         `useToken: React Query error for key (${queryKey.join(", ")}):`,
//         err.message
//       );
//       // If error is due to auth issues, redirect to login.
//       // Ensure the login page itself doesn't fall into a loop by using this hook without protection.
//       if (
//         err.message === "No access token found from API" ||
//         err.message === "User not authenticated" ||
//         err.message === "Token expired"
//       ) {
//         queryClient.removeQueries(queryKey); // Clear bad cache entry
//         console.log("useToken: Redirecting to login due to token error.");
//         router.push(
//           "/api/auth/login?returnTo=" + encodeURIComponent(router.asPath)
//         );
//       }
//     },
//     onSuccess: (fetchedData) => {
//       if (fetchedData?.decoded?.sub) {
//         console.log(
//           `useToken: Successfully updated token in cache for user: ${fetchedData.decoded.sub}`
//         );
//       }
//     },
//   });

//   // Debugging: Log what token is being returned by the hook
//   if (isLoading) {
//     // console.log(`useToken: Hook is loading for user: ${user?.sub}`);
//   } else if (isError) {
//     // console.error(`useToken: Hook has error for user ${user?.sub}: ${error?.message}`);
//   } else if (data?.accessToken) {
//     // console.log(`useToken: Hook is returning token for user: ${data?.decoded?.sub}`);
//   }

//   return data?.accessToken;
// };

// export default useToken;
