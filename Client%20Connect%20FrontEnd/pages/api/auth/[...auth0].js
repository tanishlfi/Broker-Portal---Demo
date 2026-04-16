import { handleAuth } from "@auth0/nextjs-auth0";

export default handleAuth();

// to troubleshout repsponse on auth0 and windows IIS
// import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

// export default handleAuth({
//     async login(req, res) {
//       try {
//         // console.log(req.headers);
//         // await handleLogin(req, res, {
//         //     returnTo: '/', // Custom redirect URL after login
//         // });
//         await handleLogin(req, res, {
//             // You can set custom parameters here, like the returnTo URL

//           });
//         console.log(res);
//         const location = res.get('Location');
//         console.log(location); // Use the location URL as needed
//       } catch (error) {
//         res.status(error.status || 500).end(error.message);
//       }
//     },
//   });
