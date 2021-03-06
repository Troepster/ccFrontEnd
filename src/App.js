import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import ReactGA from 'react-ga';

import TheAppBar from './containers/applicationBar.jsx';
import AppDrawer from './containers/drawer.jsx';
import AppFooter from './containers/footer.jsx';

import Welcome from './containers/welcome.jsx';
import RegisterAccount from './containers/registerAccount.jsx';
import ForgotPassword from './containers/forgotPassword.jsx';
import ForgotPasswordDone from './containers/forgotPasswordDone.jsx';
import ResetPassword from './containers/resetPassword.jsx';
import EthAccounts from './containers/ethAccounts.jsx';
import WanAccounts from './containers/wanAccounts.jsx';
import UpdatePassword from './containers/updatePassword.jsx';
import Manage2FA from './containers/manage2fa.jsx';
import Contacts from './containers/contacts.jsx';
import Whitelist from './containers/whitelist.jsx';
import SendEthereum from './containers/sendEthereum.jsx';
import WhitelistMe from './containers/whitelistMe.jsx';
import WhitelistMeDone from './containers/whitelistMeDone.jsx';
//import KYC from './containers/kyc.jsx';
import WhitelistCheck from './containers/whitelistCheck.jsx';

import WhitelistMeUnavailable from './components/whitelistMeUnavailable.jsx'
import ComingSoon from './components/comingSoon.jsx';
import PrivacyPolicy from './components/privacyPolicy.jsx';
import CookiePolicy from './components/cookiePolicy.jsx';
import TermsAndConditions from './components/termsAndConditions.jsx';
import ContactUs from './components/contactUs.jsx';
var sha256 = require('sha256');

let accountEmitter = require('./store/accountStore.js').default.emitter

let contactsEmitter = require('./store/contactsStore.js').default.emitter
let contactsDispatcher = require('./store/contactsStore.js').default.dispatcher

let ethEmitter = require('./store/ethStore.js').default.emitter
let ethDispatcher = require('./store/ethStore.js').default.dispatcher

let wanEmitter = require('./store/wanStore.js').default.emitter
let wanDispatcher = require('./store/wanStore.js').default.dispatcher

let whitelistEmitter = require('./store/whitelistStore.js').default.emitter
let whitelistDispatcher = require('./store/whitelistStore.js').default.dispatcher

let emitter = require('./store/ipStore.js').default.emitter
let dispatcher = require('./store/ipStore.js').default.dispatcher

const theme = createMuiTheme({
  overrides: {
    MuiStepIcon: {
      root: {
        '&-active': {
          color: "#2ad4dc"
        }
      },
      active: {
        color: "#2ad4dc !important"
      },
      completed: {
        color: "#2ad4dc !important"
      }
    },
    MuiInput: {
      underline: {
        '&:before': { //underline color when textfield is inactive
          backgroundColor: 'black',
          height: '2px'
        },
        '&:hover:not($disabled):before': { //underline color when hovered
          backgroundColor: 'black',
          height: '2px'
        },
      }
    },
    MuiButton: {
      root: {
        transition: "1s ease",
        '&:hover:not($disabled)' : {
          backgroundColor: "#2ad4dc",
          color: 'black'
        }
      }
    }
  },
  typography: {
    // Use the system font over Roboto.
    fontFamily: 'Abel, sans-serif',
  },
  palette: {
    primary: {
      light: '#2c2c2c',
      main: '#000000',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#72ffff',
      main: '#2ad4dc',
      dark: '#00a2aa',
      contrastText: '#000000',
    }
  }
});

class App extends Component {
  constructor(props) {
    super(props);

    var userString = sessionStorage.getItem('cc_user')
    var user = null;
    if (userString != null) {
      user = JSON.parse(userString)
    }

    var whitelistString = sessionStorage.getItem('cc_whiteliststate')
    var whitelistState = null;
    if (whitelistString != null) {
      whitelistState = JSON.parse(whitelistString)
    }

    this.state = {
      drawerOpen: false,
      user: user,
      ethAddresses: null,
      wanAddresses: null,
      contacts: null,
      whitelistState: whitelistState,
      uriParameters: {},
      ipValid: false,
      ipLoading: true,
      rejectionReason: ''
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.locationHashChanged = this.locationHashChanged.bind(this);

    this.setUser = this.setUser.bind(this);
    this.setWhitelistState = this.setWhitelistState.bind(this);
    this.logUserOut = this.logUserOut.bind(this);
    this.openSendEther = this.openSendEther.bind(this);

    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.navClicked = this.navClicked.bind(this);

    this.getEthAddressReturned = this.getEthAddressReturned.bind(this);
    this.getWanAddressReturned = this.getWanAddressReturned.bind(this);
    this.getContactsReturned = this.getContactsReturned.bind(this);
    this.getWhitelistStateReturned = this.getWhitelistStateReturned.bind(this);

    this.getIpReturned = this.getIpReturned.bind(this);
  };

  componentWillMount() {
    ReactGA.initialize('UA-106832873-2', { cookieDomain: 'auto' });

    var user = null;
    var userString = sessionStorage.getItem('cc_user');
    if(userString) {
      user = JSON.parse(userString);
      this.setUser(user);
    }

    var currentScreen = window.location.hash.substring(1);
    var paramsIndex = window.location.hash.indexOf('?')
    if(paramsIndex > -1) {
      currentScreen = window.location.hash.substring(1, paramsIndex)
    }
    if(!['welcome', 'registerAccount', 'forgotPassword', 'forgotPasswordDone', 'resetPassword', 'privacyPolicy', 'cookiePolicy', 'termsAndConditions', 'about', 'press', 'contactUs', 'bugBounty', 'blog', 'faq', 'fees', 'add', 'added', 'addUnavailable', 'whitelistStatus'].includes(currentScreen)) {
      if(user == null) {
        window.location.hash = 'welcome';
      }
    }

    window.removeEventListener('resize', this.updateWindowDimensions);
    contactsEmitter.removeAllListeners('Unauthorised');
    ethEmitter.removeAllListeners('Unauthorised');
    wanEmitter.removeAllListeners('Unauthorised');
    accountEmitter.removeAllListeners('Unauthorised');
    ethEmitter.removeAllListeners('getEthAddress');
    wanEmitter.removeAllListeners('getWanAddress');
    contactsEmitter.removeAllListeners('getContacts');
    whitelistEmitter.removeAllListeners('whitelistCheck');

    contactsEmitter.on('Unauthorised', this.logUserOut);
    ethEmitter.on('Unauthorised', this.logUserOut);
    wanEmitter.on('Unauthorised', this.logUserOut);
    accountEmitter.on('Unauthorised', this.logUserOut);

    ethEmitter.on('getEthAddress', this.getEthAddressReturned);
    wanEmitter.on('getWanAddress', this.getWanAddressReturned);
    contactsEmitter.on('getContacts', this.getContactsReturned);

    whitelistEmitter.on('getWhitelistState', this.getWhitelistStateReturned);

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

    window.onhashchange = this.locationHashChanged;
    this.locationHashChanged();

    var loader = document.getElementById("loader")
    document.body.removeChild(loader);

    emitter.on('getIp', this.getIpReturned);
    dispatcher.dispatch({ type: 'getIp' });

  };

  getIpReturned(err, data) {
    this.setState({ipLoading: false})
    emitter.removeAllListeners('getIp');

    if(data == null || data.country == null) {
      this.setState({rejectionReason: 'Could not identify country. Please disable any add blockers then reload the page.'})
    } else {
      if(data.country.code != 'US') {
        this.setState({ipValid: true})
      } else {
        this.setState({rejectionReason: 'Whitelisting is not available in your area.'})
      }
    }
  };

  getUserDetails(user) {
    var content = {id: user.id};
    ethDispatcher.dispatch({type: 'getEthAddress', content, token: user.token });
    wanDispatcher.dispatch({type: 'getWanAddress', content, token: user.token });
    contactsDispatcher.dispatch({type: 'getContacts', content, token: user.token });

    if(this.state.whitelistState == null) {
      if(user.whitelistToken != null && user.whitelistTokenKey != null) {
        var whitelistContent = { emailAddress: user.email };
        whitelistDispatcher.dispatch({type: 'getWhitelistState', content: whitelistContent, token: user.whitelistToken, tokenKey: user.whitelistTokenKey });
      }
    }
  };

  getWhitelistStateReturned(error, data) {
    if(error) {
      return this.setState({error: error.toString()});
    }

    if(data.success) {
      var whitelistState = this.decodeWhitelistResponse(data.message)
      if(whitelistState) {
        this.setWhitelistState(whitelistState);
      } else {
        this.setState({error: "An unexpected error has occurred"})
      }
    } else if (data.errorMsg) {
      this.setState({error: data.errorMsg});
    } else {
      this.setState({error: data.statusText})
    }
  };

  getEthAddressReturned(error, data) {
    if(error) {
      return this.setState({error: error.toString()});
    }

    if(data.success) {
      this.setState({ethAddresses: data.ethAddresses})
    } else if (data.errorMsg) {
      this.setState({error: data.errorMsg, ethAddresses: []});
    } else {
      this.setState({error: data.statusText, ethAddresses: []})
    }
  };

  getWanAddressReturned(error, data) {
    if(error) {
      return this.setState({error: error.toString()});
    }

    if(data.success) {
      this.setState({wanAddresses: data.wanAddresses})
    } else if (data.errorMsg) {
      this.setState({error: data.errorMsg, wanAddresses: []});
    } else {
      this.setState({error: data.statusText, wanAddresses: []})
    }
  };

  getContactsReturned(error, data) {
    if(error) {
      return this.setState({error: error.toString()});
    }

    if(data.success) {
      this.setState({contacts: data.contacts})
    } else if (data.errorMsg) {
      this.setState({error: data.errorMsg, contacts: []});
    } else {
      this.setState({error: data.statusText, contacts: []})
    }
  };

  updateWindowDimensions() {

    var size = 'sm'
    if(window.innerWidth < 600) {
      size = 'xs'
    } else if (window.innerWidth < 1024) {
      size = 'sm'
    } else if (window.innerWidth < 1440) {
      size = 'md'
    } else {
      size = 'lg'
    }

    this.setState({ width: window.innerWidth, height: window.innerHeight, size });
  };

  closeDrawer() {
    this.setState({drawerOpen: false});
  };
  openDrawer() {
    this.setState({drawerOpen: true});
  };
  navClicked(event, currentScreen) {
    this.setState({drawerOpen: false});
    window.location.hash=currentScreen;
  };

  logUserOut() {
    sessionStorage.removeItem('cc_user');
    sessionStorage.removeItem('cc_whiteliststate');
    window.location.hash = 'welcome';
  };

  setUser(user) {
    this.setState({user});
    sessionStorage.setItem('cc_user', JSON.stringify(user));
    this.getUserDetails(user);
  };

  setWhitelistState(whitelistState) {
    if(whitelistState != null && whitelistState.activeStep == null) {
      whitelistState.activeStep = 0;
      whitelistState.completed = {};
    } else if (whitelistState != null) {
      if(whitelistState.jwt) {
        var user = this.state.user;

        user.whitelistToken = whitelistState.jwt.token;
        user.whitelistTokenKey = sha256(whitelistState.user.emailAddress);
        delete whitelistState.jwt;

        this.setState({user});
        sessionStorage.setItem('cc_user', JSON.stringify(user));
      }
    }
    this.setState({whitelistState});
    sessionStorage.setItem('cc_whiteliststate', JSON.stringify(whitelistState));

    whitelistDispatcher.dispatch({type: 'setWhitelistState', content: whitelistState, token: this.state.user.whitelistToken, tokenKey: this.state.user.whitelistTokenKey });
  };

  openSendEther(sendEtherContact, sendEtherAccount) {
    this.setState({ sendEtherContact, sendEtherAccount});
    window.location.hash = 'sendEthereum'
  };

  locationHashChanged() {
    var uriParameters = {}
    var currentScreen = ''
    var paramsIndex = window.location.hash.indexOf('?')
    if(paramsIndex > -1) {
      var params = window.location.hash.substring(paramsIndex+1)
      params.split('&').forEach((pair) => {
        var arr = pair.split('=')
        var val = decodeURIComponent(arr[1])
        if(val.indexOf("'>here</a") > -1) {
          val = val.substring(0, val.length - 9)
        }
        uriParameters[decodeURIComponent(arr[0])] = val
      })
      currentScreen = window.location.hash.substring(1, paramsIndex)
    } else {
      currentScreen = window.location.hash.substring(1);
    }
    if(['', 'welcome', 'logOut', 'registerAccount'].includes(currentScreen)) {
      sessionStorage.removeItem('cc_user');
      sessionStorage.removeItem('cc_whiteliststate');

      this.setState({drawerOpen: false, user: null, contacts: null, ethAddresses: null, wanAddress: null});
      if(currentScreen != 'registerAccount') {
        this.setState({currentScreen: 'welcome'});
      }
    }

    if(!['welcome', 'registerAccount', 'forgotPassword', 'forgotPasswordDone', 'resetPassword', 'privacyPolicy', 'cookiePolicy', 'termsAndConditions', 'about', 'press', 'contactUs', 'bugBounty', 'blog', 'faq', 'fees', 'add', 'added', 'addUnavailable', 'whitelistStatus'].includes(currentScreen)) {
      if(this.state.user == null) {
        return window.location.hash = 'welcome';
      }
    }

    var content = {}
    if(currentScreen == 'wanAccounts') {
      content = {id: this.state.user.id};
      wanDispatcher.dispatch({type: 'getWanAddress', content, token: this.state.user.token });
    } else if (currentScreen == 'ethAccounts') {
      content = {id: this.state.user.id};
      ethDispatcher.dispatch({type: 'getEthAddress', content, token: this.state.user.token });
    } else if (currentScreen == 'contacts') {
      content = {id: this.state.user.id};
      contactsDispatcher.dispatch({type: 'getContacts', content, token: this.state.user.token });
    }

    ReactGA.set({ page: window.location.pathname + window.location.hash })
    ReactGA.pageview(window.location.pathname + window.location.hash)

    this.setState({currentScreen, uriParameters});
  };

  renderAppBar() {
    var menuClicked = null
    if(this.state.user != null) {
      menuClicked = this.openDrawer
    }

    return (<TheAppBar
      menuClicked={menuClicked}
      user={this.state.user}
    />)
  };

  renderDrawer() {
    var drawer = null
    if(this.state.user != null) {
      drawer = (<AppDrawer
        canWhitelist={this.state.whitelistState!=null&&this.state.whitelistState.user!=null?this.state.whitelistState.user.canWhitelist:false}
        navClicked={this.navClicked}
        currentScreen={this.state.currentScreen}
        closeDrawer={this.closeDrawer}
        user={this.state.user}
        open={this.state.drawerOpen}
      />)
    }
    return drawer;
  };

  renderFooter() {
    return <AppFooter
      user={this.state.user}
      navClicked={this.navClicked}
      ipValid={this.state.ipValid} />
  };

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        {this.renderAppBar()}
        {this.renderDrawer()}
        <CssBaseline />
        <Grid container justify="space-around" alignItems="flex-start" direction="row" spacing={0} style={{minHeight: '562px', position: 'relative'}}>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            {this.renderScreen()}
          </Grid>
        </Grid>
        {this.renderFooter()}
      </MuiThemeProvider>
    )
  };

  renderScreen() {
    switch (this.state.currentScreen) {
      case 'welcome':
        return (<Welcome setUser={this.setUser} setWhitelistState={this.setWhitelistState} />);
      case 'registerAccount':
        return (<RegisterAccount setUser={this.setUser} setWhitelistState={this.setWhitelistState}/>);
      case 'forgotPassword':
        return (<ForgotPassword />);
      case 'forgotPasswordDone':
        return (<ForgotPasswordDone />);
      case 'resetPassword':
        return (<ResetPassword uriParameters={this.state.uriParameters} />);
      case 'whitelist':
        return (<Whitelist whitelistObject={this.state.whitelistState} setWhitelistState={this.setWhitelistState} user={this.state.user} size={this.state.size} ethAddresses={this.state.ethAddresses} wanAddresses={this.state.wanAddresses} />);
      case 'ethAccounts':
        return (<EthAccounts user={this.state.user} ethAddresses={this.state.ethAddresses} openSendEther={this.openSendEther} />);
      case 'wanAccounts':
        return (<WanAccounts user={this.state.user} wanAddresses={this.state.wanAddresses} />);
      case 'contacts':
        return (<Contacts user={this.state.user} contacts={this.state.contacts} openSendEther={this.openSendEther} />);
      case 'updatePassword':
        return (<UpdatePassword user={this.state.user} />);
      case 'manage2FA':
        return (<Manage2FA user={this.state.user} setUser={this.setUser} />);
      /*case 'kyc':
        return (<KYC user={this.state.user} setUser={this.setUser} />);*/
      case 'privacyPolicy':
        return (<PrivacyPolicy />);
      case 'cookiePolicy':
        return (<CookiePolicy />);
      case 'termsAndConditions':
        return (<TermsAndConditions />);
      case 'manageEthPools':
        return (<ComingSoon />);
      case 'sendEthereum':
        return (<SendEthereum user={this.state.user} sendEtherContact={this.state.sendEtherContact} sendEtherAccount={this.state.sendEtherAccount} ethAddresses={this.state.ethAddresses} size={this.state.size} contacts={this.state.contacts}/>)
      case 'about':
        return (<ComingSoon />);
      case 'press':
        return (<ComingSoon />);
      case 'contactUs':
        return (<ContactUs />);
      case 'bugBounty':
        return (<ComingSoon />);
      case 'blog':
        return (<ComingSoon />);
      case 'faq':
        return (<ComingSoon />);
      case 'fees':
        return (<ComingSoon />);
      case 'add':
        if(!this.state.ipValid) {
          window.location.hash = 'addUnavailable'
          return <div></div>
        }
        return (<WhitelistMe ipLoading={this.state.ipLoading} />);
      case 'added':
        return (<WhitelistMeDone />);
      case 'addUnavailable':
        if(this.state.ipValid == true) {
          window.location.hash = 'add'
          return <div></div>
        }
        return (<WhitelistMeUnavailable ipLoading={this.state.ipLoading} rejectionReason={this.state.rejectionReason}/>);
      case 'whitelistStatus':
        return (<WhitelistCheck />)
      case 'logOut':
        return (<Welcome setUser={this.setUser} setWhitelistState={this.setWhitelistState} />);
      default:
        return (<Welcome setUser={this.setUser} setWhitelistState={this.setWhitelistState} />);
    }
  }
}

export default App;
