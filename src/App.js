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
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
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
import { cignaLoginHelper, cignaLogin } from './cignaLogin';
import * as Querystring from "query-string";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    minWidth:275,
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
  const [patientData, setPatientData] = React.useState(null);
  const [userName, setUserName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAddress, setPatientAddress] = useState('')
  const [patientBday, setPatientBday] = useState('')
  const [patientGender, setPatientGender] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientMemberID, setPatientMemberID] = useState('')
  const [patientPeriod, setPatientPeriod] = useState('')
  const [isLoggedIn, setisLoggedIn] = useState(false);
  // const [insurance, setInsurance] = useState('');
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
              getPatientInfo(data1[0], data1[1])
              getCoverageInfo(data1[0])
            }
             
          }
          getData()  
        
        
      }
    }
  }, [])
  
  const getPatientInfo = async (token, patient_id) => {
    try {
      const patientInfo = await axios.get(
        `https://vteapif1.aetna.com/fhirdemo/v1/patientaccess/Patient/` + patient_id ,
        {
          headers: {
            Authorization: "Bearer " + token,
           
          },
        }
      );
      // const piJSON = await patientInfo.json();
      // console.log(piJSON)
      console.log(patientInfo.data)
      setPatientData(patientInfo.data)
      setPatientName(patientInfo.data.name[0].text)
      setPatientAddress(patientInfo.data.address[0].text)
      setPatientBday(patientInfo.data.birthDate)
      setPatientGender(patientInfo.data.gender)
      setPatientPhone(patientInfo.data.telecom[0].value)
      setPatientMemberID(patientInfo.data.identifier[0].value)
      setPatientPeriod(JSON.stringify(patientInfo.data.identifier[0].period))
      return patientInfo;
    } catch (err) {
      console.log(err);
    }
  };
  

  const getCoverageInfo = async (token) => {
    try {
      const coverageInfo = await axios.get(
        `https://vteapif1.aetna.com/fhirdemo/v1/patientaccess/Coverage` ,
        {
          headers: {
            Authorization: "Bearer " + token,
           
          },
        }
      );
      // const piJSON = await patientInfo.json();
      // console.log(piJSON)
      console.log('Coverage: ', coverageInfo.data)
      return coverageInfo;
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
    aetnaLogin(code)
    sessionStorage.setItem('insurance', 'Aetna')
    console.log('Aetna Login Success: currentUser:', res);
    console.log(code)
    if(data !== [1,2]){
      console.log(access_token)
      console.log(patient)
      setInsurance('Aetna')
    }
    
  }
  const cignaAuthorization = (event, res) => {
    cignaLogin(code)
    sessionStorage.setItem('insurance', 'Cigna')
    console.log('Aetna Login Success: currentUser:', res);
    console.log(code)
    if(data !== [1,2]){
      console.log(access_token)
      console.log(patient)
      setInsurance('Cigna')
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
      <ListItem button onClick={() => cignaAuthorization()}>
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
      These are the APIs and information retrieved for the test member
      </Typography>
      <br />
      <br />
      <div>
      </div>
      <div>
      <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h2">
          Patient API
        </Typography>
        
        <Typography variant="body2" component="p">
          Member Name: {patientName}
          <br />
          Gender: {patientGender}
          <br />
          Address: {patientAddress}
          <br />
          Birth date: {patientBday}
          <br />
          Phone Number: {patientPhone}
          <br />
          Member ID: {patientMemberID}
          <br />
          Period: {patientPeriod}
          <br />
        </Typography>
      </CardContent>
    </Card>
      
      </div>
    </div>
    }
    </div>
      }
    </div>
  );
}

export default App;