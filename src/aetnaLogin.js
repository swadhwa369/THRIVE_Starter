import axios from "axios"
import queryString from "querystring"

const redirectUri = "thrive-test2.herokuapp.com"
const clientId = process.env.REACT_APP_AETNA_ID
const clientSecret = process.env.REACT_APP_AETNA_SECRET
const scopes ="patient/*.read launch/patient"

export const aetnaLogin = (code) => {
  if (code) {
    return
  } else {
    window.location.replace(
      "https://vteapif1.aetna.com/fhirdemo/v1/fhirserver_auth/oauth2/authorize?" +
        queryString.stringify({
          response_type: "code",
          client_id: clientId,
          aud: 'https://vteapif1.aetna.com/fhirdemo',
          scope: scopes,
          redirect_uri: redirectUri,
          code_challenge: "GGqkdDekerMMQYcibZIY1gvLT6cb3TQ8ydBxXSwRem8",
          state: "1234"
        })
    )
  }
}

export const loginHelper = async (code) => {
  const accessForm = queryString.stringify({
    grant_type: "authorization_code",
    code: code,
    code_verifier: "jhkghgd5rtstrss7utfhgjhgjh",
    redirect_uri: redirectUri,
  })
  // base64 encode auth data
  const auth = btoa(`${clientId}:${clientSecret}`)
  return await axios
    .post("https://vteapif1.aetna.com/fhirdemo/v1/fhirserver_auth/oauth2/token", accessForm, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, HEAD, OPTIONS",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        Authorization: `Basic ${auth}`,
      },
    })
    .then((res) => {
      // removes 'code' query param to clean up URL
      // window.history.replaceState(null, null, window.location.pathname)
      console.log(res)
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// export const getNewToken = (refreshToken) => {
//   const accessForm = queryString.stringify({
//     grant_type: "token",
//     token: refreshToken,
//   })
//   const auth = btoa(`${clientId}:${clientSecret}`)
//   axios
//     .post("https://vteapif1.aetna.com/fhirdemo/v1/fhirserver_auth/oauth2/token", accessForm, {
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, HEAD, OPTIONS",
//         "content-type": "application/x-www-form-urlencoded;charset=utf-8",
//         Authorization: `Basic ${auth}`,
//       },
//     })
//     .then((res) => {
//       return res.data.access_token
//     })
// }

// export const getMyData = (token) => {
//   if (token) {
//     fetch("https://devhapi.aetna.com/fhirdelivery/sb/ia/v1/patientaccess/Patient/{2345678901234560001}", {
//       headers: { Authorization: "Bearer " + token },
//     })
//       .then((res) => res.json())
//       .catch((err) => console.log(err))
//       .then((data) => {
//         return data
//       })
//   }
// }
