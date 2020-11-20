import axios from "axios"
import queryString from "querystring"

const redirectUri = "https://localhost:3000/callback"
const clientId = process.env.REACT_APP_CERNER_ID
const clientSecret = process.env.REACT_APP_CERNER_SECRET
const scopes =
  "'patient/Patient.*'"

export const cernerLogin = (code) => {
  if (code) {
    return
  } else {
    window.location.replace(
      "https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/patient/authorize?" +
        queryString.stringify({
          response_type: "code",
          client_id: clientId,
          scope: scopes,
          redirect_uri: redirectUri,
        })
    )
    
  }
}

export const loginHelper = async (code) => {
  const accessForm = queryString.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  })
  // base64 encode auth data
  const auth = btoa(`${clientId}:${clientSecret}`)
  return await axios
    .post("https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/api/token", accessForm, {
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        Authorization: `Basic ${auth}`,
      },
    })
    .then((res) => {
      // removes 'code' query param to clean up URL
      window.history.replaceState(null, null, window.location.pathname)
      return res.data
    })
    .catch((err) => {
      console.log(err)
    })
}


export const getMyData = (token) => {
  if (token) {
    fetch("https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .catch((err) => console.log(err))
      .then((data) => {
        return data
      })
  }
}