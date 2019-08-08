import React, { Component } from 'react';
//import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
//import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import LocalAtm from '@material-ui/icons/LocalAtm';
import Money from '@material-ui/icons/Money';
//import GrainIcon from '@material-ui/icons/Grain';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = theme => ({
  root: {
    padding: theme.spacing(1, 2),
  },
  link: {
    display: 'flex',
  },
  icon: {
    marginRight: theme.spacing(0.5),
    width: 20,
    height: 20,
  },
});

class IconBreadcrumbs extends Component {
  state = {
    pe: "textPrimary" ,
    vc: "inherit"
  };

  handleClick = event => {// eslint-disable-next-line
    event .preventDefault ( );
    this.setState ( {
      pe: this.state.vc ,
      vc: this.state.pe
    } );
    this.props.toggle ( );
  }

  render (  ){
    const { classes } = this.props;
    return (
      <Paper elevation={0} className={classes.root}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color={this.state.pe} href="/" onClick={this.handleClick} className={classes.link}>
            <LocalAtm className={classes.icon} />
            PE
          </Link>
          <Link color={this.state.vc} href="/" onClick={this.handleClick} className={classes.link}>
            <Money className={classes.icon} />
            VC
          </Link>
        </Breadcrumbs>
      </Paper>
    );
  }
}

IconBreadcrumbs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(useStyles)(IconBreadcrumbs);
