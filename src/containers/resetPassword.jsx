import React from 'react'
import ResetPasswordComponent from '../components/resetPassword'
const createReactClass = require('create-react-class')
let emitter = require('../store/accountStore.js').default.emitter
let dispatcher = require('../store/accountStore.js').default.dispatcher

let ResetPassword = createReactClass({
  getInitialState() {
    return {
      loading: false,
      error: null
    };
  },

  componentWillMount() {
    if(this.props.uriParameters.token == null || this.props.uriParameters.code == null) {
      window.location.hash = 'welcome';
    }
    return emitter.on('resetPassword', this.resetPasswordReturned);
  },

  componentWillUnmount() {
    emitter.removeAllListeners('resetPassword');
  },

  render() {
    return (
      <ResetPasswordComponent
        handleChange={this.handleChange}
        submitReset={this.submitReset}
        submitLoginNavigate={this.submitLoginNavigate}
        onResetKeyDown={this.onResetKeyDown}
        password={this.state.password}
        passwordError={this.state.passwordError}
        confirmPassword={this.state.confirmPassword}
        confirmPasswordError={this.state.confirmPasswordError}
        error={this.state.error}
        loading={this.state.loading}
        />
    )
  },

  handleChange (event, name) {
    if(event != null && event.target != null) {
      this.setState({
        [name]: event.target.value
      });
    }
  },

  onResetKeyDown(event) {
    if (event.which == 13) {
      this.submitReset()
    }
  },

  submitReset() {
    var error = false;

    if(this.state.password == '') {
      this.setState({passwordError: true});
      error = true;
    }
    if(this.state.confirmPassword == '') {
      this.setState({confirmPasswordError: true});
        error = true;
    }
    if(this.state.password != this.state.confirmPassword) {
      this.setState({passwordError: true, confirmPasswordError: true});
      error = true;
    }

    if(!error) {
      this.setState({loading: true});
      var content = { token: this.props.uriParameters.token, code: this.props.uriParameters.code, password: this.state.password};
      dispatcher.dispatch({type: 'resetPassword', content});
    }
  },

  resetPasswordReturned(error, data) {
    this.setState({loading: false})
    if(error) {
      return this.setState({error: error.toString()});
    }

    if(data.success) {
      window.location.hash = 'account'; //or show 'Your password has been updated'
    } else if (data.errorMsg) {
      this.setState({error: data.errorMsg});
    } else {
      this.setState({error: data.statusText})
    }
  },

  submitLoginNavigate() {
    window.location.hash = 'welcome';
  },
})

export default (ResetPassword);
