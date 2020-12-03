import React from 'react';
import './App.css';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login';
import { GoogleLogout } from 'react-google-login'
import { useEffect, useState, setState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FHIR from "fhirclient"
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { cernerLogin } from './cernerLogin';
import { loginHelper, data1 } from './aetnaLogin';
import { aetnaLogin } from './aetnaLogin';
import * as Querystring from "query-string"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    padding: theme.spacing(0, 3),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    maxWidth: 600,
    margin: `${theme.spacing(2)}px auto`,
    padding: theme.spacing(3),
  },
}));

const aetnaClientId = process.env.REACT_APP_AETNA_ID
const aetnaClientSecret = process.env.REACT_APP_AETNA_SECRET
const clientId = process.env.REACT_APP_GOOGLE_ID

function App(props) {
  const classes = useStyles();
  //temp until we want clicking on dif providers to take them somewhere
  const [anchorEl, setAnchorEl] = React.useState(null);
  //temp
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  //temp
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [code, setCode] = React.useState(null);
  const [data, setData] = React.useState([1,2]);
  const [access_token, setAT] = React.useState(null);
  const [patient, setPatient] = React.useState(null);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [insurance, setInsurance] = useState('');
  const [ins, setIns] = useState('');

  useEffect(() => {
    if (!code) {
      let code = new URLSearchParams(window.location.search).get("code")
      if (code) {
        setCode(code.slice(0, -1))
        let data1 = null;
        async function getData(){
          data1 = await loginHelper(code)
          console.log(data1)
          setData(data1)
          if(data1){
            setAT(data1[0])
            setPatient(data1[1])      
          }
        }
        getData()
       
        
      }
    }
  }, [])
  
  const getPatientInfo = async (token, patient_id) => {
    try {
      const patientInfo = await axios.get(
        
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      console.log(patientInfo)
      return patientInfo;
    } catch (err) {
      console.log(err);
    }
  };
  
// const getPatientInfo = async (token, patient_id) => {
//   try {
//     const patientInfo = await fetch(`vteapif1.aetna.com/fhirdemo/v1/patientaccess/Patient/` + patient_id, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const piText = await patientInfo.text();
//     console.log(piText)
//     return piText;
//   } catch (err) {
//     console.log(err);
//   }
// };
useEffect(() =>{
  if(access_token !== null && patient !== null){
    getPatientInfo(access_token, patient)
  }
}, [])

  const onSuccess = (res) => {
    setisLoggedIn(true)
    console.log('Google Login Success:', res.profileObj);
    if(res.profileObj.name){
      const name = res.profileObj.name
      console.log(name)
      setUserName(name)
    }   
  };
  
  //Google logout info
  const onSuccessLogout = () => {
    setisLoggedIn(false)
    setInsurance('')
    setUserName('')
    console.log('Logout successful');
  };
  const onFailure = (res) => {
    console.log('Login failed: res:', res);
  }

  const CernerAuthorization = (event, res) => {
    //This doesn't work, need to figure this out, but this is one way to get through oauth2 w/ fhir. I think issue w/ iss
    FHIR.oauth2.authorize({
      "iss": "https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d",
      "client_id": process.env.REACT_APP_CERNER_ID,
      "scope": "patient/*.read"
  });
  FHIR.oauth2.ready()
  .then(client => client.request("Patient"))
  .then(console.log)
  .catch(console.error);
    setInsurance('Cerner')
    console.log('Cerner Login Success: currentUser:', res);
  }
  const AetnaAuthorization = (event, res) => {
    //Might want to use something similar for Aetna OAuth??
    // FHIR.oauth2.authorize({
    //   'iss' : "https://oauth-api.cerner.com/oauth/access",
    //   'client_id': process.env.REACT_APP_CERNER_ID,
    //   'scope':  'patient/AllergyIntolerance.read patient/Appointment.read patient/CarePlan.read patient/Condition.read patient/DiagnosticReport.read patient/DocumentReference.read patient/Encounter.read patient/Goal.read patient/Immunization.read patient/MedicationAdministration.read'
    // });
    aetnaLogin(code)
    setInsurance('Aetna')
    console.log('Aetna Login Success: currentUser:', res);
    console.log(code)
    if(data !== [1,2]){
      console.log(access_token)
      console.log(patient)
    }
    
  }
  return (
    <div className="App">
      {!isLoggedIn?
      <div>
        <header className="App-header">
         <h1>THRIVE</h1>
        <p>
          A health app
        </p>
        <GoogleLogin
          clientId={clientId}
          buttonText="Login"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          style={{ marginTop: '100px' }}
          isSignedIn={true}
        /> 
        </header>
      </div>
      
      :
      <div>
      <div className={classes.root}>
      <AppBar position="fixed" style={{ background: '#C24E42' }}>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={handleClick}>
          <Button aria-controls="simple-menu" aria-haspopup="true" >
            <MenuIcon />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Health Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
          </Menu>
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            THRIVE
          </Typography>
          <GoogleLogout
          clientId={clientId}
          buttonText="Logout"
          onLogoutSuccess={onSuccessLogout}
        ></GoogleLogout>
        </Toolbar>
      </AppBar>
    </div>
    <br />
    <br />
    <br />
    <br />
    {insurance == '' ?
    <div>
    <Typography variant="h4" component="h4">
    Which insurance/EHR would you like to authorize?
    </Typography>
      <List
      component="nav"
      subheader={
        <ListSubheader component="div" id="list-subheader">
          Companies
        </ListSubheader>
      }
      className={classes.root}
    >
      <ListItem button onClick={() => AetnaAuthorization()}>
      <ListItemText primary="Aetna"  style={{textAlign: "center"}}/>
      </ListItem>
      <ListItem button onClick={handleClick}>
        <ListItemText primary="Cigna" style={{textAlign: "center"}} />
      </ListItem>
      <ListItem button onClick={handleClick}>
        <ListItemText primary="Humana" style={{textAlign: "center"}}/>
      </ListItem>
      <ListItem button onClick={handleClick}>
        <ListItemText primary="UnitedHealth" style={{textAlign: "center"}}/>
      </ListItem>
      <ListItem button onClick={handleClick}>
        <ListItemText primary="EPIC" style={{textAlign: "center"}}/>
      </ListItem>
      <ListItem button onClick={() => cernerLogin(code)}>
        <ListItemText primary="Cerner" style={{textAlign: "center"}}/>
      </ListItem>
    </List>
    </div>
    : 
    <div>
      <Typography variant="h3" className={classes.title}> 
      {insurance}
      </Typography>
    <Typography variant="h6" className={classes.title}> 
      Hi, {userName} this is your Explanation of Benefits
      </Typography>
      <br />
      <br />
      <div>
      <Paper className={classes.paper}>
        <Grid container wrap="nowrap" spacing={2} >
          <Grid item>
          </Grid>
          <Grid item xs>
            <Typography align="left">Medical services recieved and from who</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item>
          </Grid>
          <Grid item xs>
            <Typography align="left">Amount billed: Cost of those services</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item>
          </Grid>
          <Grid item xs>
            <Typography align="left">Amount paid by your health insurance plan</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item>
          </Grid>
          <Grid item xs>
            <Typography align="left">What costs your health plan did not cover</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item>
          </Grid>
          <Grid item xs>
            <Typography align="left">Amount covered by HRA</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item>
          </Grid>
          <Grid item xs>
            <Typography align="left">Outstanding amount you are responsible for paying</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      </div>
    </div>
    }
    </div>
      }
    </div>
  );
}

export default App;