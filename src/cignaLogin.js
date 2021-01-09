import axios from "axios"
import queryString from "querystring"

const redirectUri = "thrive-test2.herokuapp.com"
const clientId = process.env.REACT_APP_CIGNA_ID
const clientSecret = process.env.REACT_APP_CIGNA_SECRET
const scopes ="patient/*.read openid fhirUser"

export const cignaLogin = (code) => {
  if (code) {
    return
  } else {
    window.location.replace(
      "https://hi2.cigna.com/mga/sps/oauth/oauth20/authorize?" +
        queryString.stringify({
          response_type: "code",
          nonce:"123456",
          client_id: clientId,
          scope: scopes,
          redirect_uri: redirectUri,
          code_challenge: "SSa8BbRUOZiD3YM9znT7eOnmvff7LKqR-2QlDOCKXbQ",
          code_challenge_method: "S256",
          state: "123456"
        })
    )
  }
}

export const cignaLoginHelper = async (code) => {
  const accessForm = queryString.stringify({
    grant_type: "authorization_code",
    code: code,
    code_verifier: "0mAXBW6gDOTERvn7jph3sqs4kgkcBh7JJ457Xxwlb7k",
    redirect_uri: redirectUri,
  })
  // base64 encode auth data
  console.log(accessForm)
  const auth = btoa(`${clientId}:${clientSecret}`)
  return await axios
    .post("https://hi2.cigna.com/mga/sps/oauth/oauth20/token", accessForm, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, HEAD, OPTIONS",
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
    })
    .then((res) => {
      // removes 'code' query param to clean up URL
      // window.history.replaceState(null, null, window.location.pathname)
      console.log(res)
      return [res.data.access_token, res.data.patient]
    })
    .catch((err) => {
      console.log(err)
    })
}
