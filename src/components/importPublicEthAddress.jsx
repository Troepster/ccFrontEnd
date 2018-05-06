import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Card, {  CardContent } from 'material-ui/Card';

const styles = {};

class ImportPublicEthAddress extends Component {

  constructor(props) {
    super(props);
  };

  render() {
    return (
      <Grid container justify="flex-start" alignItems="flex-start" direction="row" spacing={40}>
        <Grid item xs={12} align='center' style={{marginBottom: '12px'}}>
          <Typography variant="title">
            No problems! Then we just need to know your Ethereum address.
          </Typography>
        </Grid>
        <Grid item xs={12} align='center'>
          <Typography variant="body2">
            Please provide us with your Ethereum Address.
          </Typography>
        </Grid>
        <Grid item xs={12} align='center'>
          <TextField style={{maxWidth:'400px', width: '100%'}} fullWidth={false} required color="textSecondary" error={this.props.ethereumAddressError} disabled={this.props.loading}
            id="ethereumAddress" placeholder="Ethereum Public Address" value={this.props.ethereumAddress}
            onChange={(event) => { this.props.handleChange(event, 'ethereumAddress'); }} onBlur={this.props.validateETHAddress} margin="normal" onKeyDown={this.props.importPublicEthAddressKeyDown}
            helperText={this.props.ethereumAddressErrorMessage} />
        </Grid>
        <Grid item xs={3} align='left' style={{marginTop: '24px '}}>
          <Button size="small" variant="flat" onClick={this.props.navigateBack}>Back</Button>
        </Grid>
        <Grid item xs={9} align='right' style={{marginTop: '24px '}}>
          <Button size="small" variant={this.props.ethereumAddressValid?"raised":"flat"} disabled={!this.props.ethereumAddressValid} color="primary" onClick={this.props.importPublicEthAddress}>Import my address</Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(ImportPublicEthAddress);
