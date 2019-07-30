import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import ThreeSixtyIcon from '@material-ui/icons/ThreeSixty';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';

const styles = theme => ({
  root: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

class PrimarySearchAppBar extends React.Component {
  state = {
    anchorEl: null ,
    mobileMoreAnchorEl: null ,
    sitePage: "www.3i.com/our-people/"
  };

  handleProfileMenuOpen = event => {
    //console.log ( event.currentTarget );
    this.setState ( { anchorEl: event.currentTarget } );
  };

  handleMenuClose = ( page , get ) => {
    this.setState ( { anchorEl: null  , sitePage: page  } );
    this.handleMobileMenuClose ( );
    this.props.fetcher ( page , get );
  };

  handleMobileMenuOpen = event => {
    this.setState ( { mobileMoreAnchorEl: event.currentTarget } );
  };

  handleMobileMenuClose = ( ) => {
    this.setState ( { mobileMoreAnchorEl: null } );
  };

  render() {
    const { anchorEl , mobileMoreAnchorEl , sitePage } = this.state;
    const { classes } = this.props;
    const isMenuOpen = Boolean ( anchorEl );
    const isMobileMenuOpen = Boolean ( mobileMoreAnchorEl );
    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={( ) => this.handleMenuClose ( "www.3i.com/our-people/" , "1" )}>3i.com/our-people/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "aaccapital.com/nl/team/" , "2" )}>aaccapital.com/nl/team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.5square.nl/#page_458" , "3" )}>5square.nl/#page_458</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.activecapitalcompany.com/over-ons/team" , "4" )}>activecapitalcompany.com/over-ons/team</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.adventinternational.com/team/" , "5" )}>adventinternational.com/team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.alpinvest.com/leadership" , "6" )}>alpinvest.com/leadership</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.antea.nl/de-mensen/de-directie/" , "7" )}>antea.nl/de-mensen/de-directie/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.baincapital.com/people" , "8" )}>baincapital.com/people</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://bbcapital.nl/team/" , "9" )}>bbcapital.nl/team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://avedoncapital.com/team/#main-content" , "10" )}>avedoncapital.com/team</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://bolsterinvestments.nl/team/" , "11" )}>bolsterinvestments.nl</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.bridgepoint.eu/en/our-team/?&page=0" , "12" )}>bridgepoint.eu/en/our-team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://brightlandsventurepartners.com/team/" , "13" )}>brightlandsventurepartners.com/team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.capitalapartners.nl/team" , "14" )}>capitalapartners.nl/team</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.cinven.com/who-we-are/the-team/" , "15" )}>cinven.com/who-we-are/the-team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://committedcapital.nl/team/" , "16" )}>committedcapital.nl/team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.cottonwood.vc/" , "17" )}>cottonwood.vc/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.cvc.com/people/working-at-cvc" , "18" )}>cvc.com/people/working-at-cvc</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.dehogedennencapital.nl/team/" , "19" )}>dehogedennencapital.nl/team/</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.delftenterprises.nl/wat-we-doen/onze-mensen/" , "20" )}>delftenterprises.nl</MenuItem>
      </Menu>
    );

    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleMobileMenuClose}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <MailIcon />
            </Badge>
          </IconButton>
          <p>Messages</p>
        </MenuItem>
        <MenuItem onClick={this.handleMobileMenuClose}>
          <IconButton color="inherit">
            <Badge badgeContent={11} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <p>Notifications</p>
        </MenuItem>
        <MenuItem onClick={this.handleProfileMenuOpen}>
          <IconButton color="inherit">
            <ThreeSixtyIcon />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      </Menu>
    );

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Open drawer">
              <MenuIcon />
            </IconButton>
            <Typography className={classes.title} variant="h6" color="inherit" noWrap>
              Material-UI
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
              />
            </div>
            <div className={classes.grow} />
            { sitePage }
            <div className={classes.sectionDesktop}>
              <IconButton
                aria-owns={isMenuOpen ? 'material-appbar' : undefined}
                aria-haspopup="true"
                onClick={this.handleProfileMenuOpen}
                color="inherit"
              >
                <ThreeSixtyIcon />
              </IconButton>
            </div>
            <div className={classes.sectionMobile}>
              <IconButton aria-haspopup="true" onClick={this.handleMobileMenuOpen} color="inherit">
                <MoreIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {renderMenu}
        {renderMobileMenu}
      </div>
    );
  }
}

PrimarySearchAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PrimarySearchAppBar);
