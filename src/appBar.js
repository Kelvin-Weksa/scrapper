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
        <MenuItem onClick={( ) => this.handleMenuClose ( "www.3i.com/our-people/" , "1" )}>3i</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "aaccapital.com/nl/team/" , "2" )}>aaccapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.5square.nl/#page_458" , "3" )}>5square</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.activecapitalcompany.com/over-ons/team" , "4" )}>activecapitalcompany</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.adventinternational.com/team/" , "5" )}>adventinternational</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.alpinvest.com/leadership" , "6" )}>alpinvest</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.antea.nl/de-mensen/de-directie/" , "7" )}>antea</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.baincapital.com/people" , "8" )}>baincapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://bbcapital.nl/team/" , "9" )}>bbcapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://avedoncapital.com/team/#main-content" , "10" )}>avedoncapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://bolsterinvestments.nl/team/" , "11" )}>bolsterinvestments</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.bridgepoint.eu/en/our-team/?&page=0" , "12" )}>bridgepoint</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://brightlandsventurepartners.com/team/" , "13" )}>brightlandsventurepartners</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.capitalapartners.nl/team" , "14" )}>capitalapartners</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.cinven.com/who-we-are/the-team/" , "15" )}>cinven</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://committedcapital.nl/team/" , "16" )}>committedcapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.cottonwood.vc/" , "17" )}>cottonwood</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.cvc.com/people/working-at-cvc" , "18" )}>cvc</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.dehogedennencapital.nl/team/" , "19" )}>dehogedennencapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.delftenterprises.nl/wat-we-doen/onze-mensen/" , "20" )}>delftenterprises</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.ecart.nl/en/organisatie-missie/" , "21" )}>ecart</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://egeria.nl/team-overzicht/" , "22" )}>egeria</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.eqtpartners.com/Organization/Executive-Committee/" , "23" )}>eqtpartners</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://forbion.com/en/team/" , "24" )}>forbion</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://gembenelux.com/over-ons/235/mensen.html" , "25" )}>gembenelux</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://gilde.com/team/investment-team" , "26" )}>gilde</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://gildehealthcare.com/team/" , "27" )}>gildehealthcare</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.gimv.com/en/team" , "28" )}>gimv</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.healthinnovations.nl/nl/het-team" , "29" )}>delftenterprises</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.healthinvestmentpartners.nl/over-ons" , "30" )}>healthinvestmentpartners</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://hollandcapital.nl/ons-team/" , "31" )}>hollandcapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.horizonflevoland.nl/wij" , "32" )}>horizonflevoland</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://hpegrowth.com/about-us/" , "33" )}>hpegrowth</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://ibsca.nl/about-ibs/over-ons/" , "34" )}>ibsca</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.innovationquarter.nl/ons-team/" , "35" )}>innovationquarter</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.karmijnkapitaal.nl/25-over-ons.html" , "36" )}>karmijnkapitaal</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.kkr.com/our-firm/team" , "37" )}>kkr</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.llcp.com/about/our-team" , "38" )}>llcp</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://liof.nl/over-liof/contact" , "39" )}>liof</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.lspvc.com/team.html" , "40" )}>lspvc</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://main.nl/team/" , "41" )}>main</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.mgf.nl/ons-team/" , "42" )}>mgf</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.menthacapital.com/" , "43" )}>menthacapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.nom.nl/over-ons/het-team/" , "44" )}>nom</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.navitascapital.nl/het-team" , "45" )}>navitascapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://shiftinvest.com/nbi-investors/#contentbox" , "46" )}>shiftinvest</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.zlto.nl/wieiswie" , "47" )}>zlto</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.newion.com/team" , "48" )}>newion</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.nordian.nl/team" , "49" )}>nordian</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.npm-capital.com/nl/team" , "50" )}>npm-capital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://oostnl.nl/nl/medewerkers" , "51" )}>oostnl</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://o2capital.nl/over-ons/" , "52" )}>o2capital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.parcomcapital.com/about/" , "53" )}>parcomcapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://plainvanilla.nl/team/" , "54" )}>plainvanilla</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://pridecapital.nl/over-ons/#team" , "55" )}>pridecapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.primeventures.com/team/" , "56" )}>primeventures</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://raboprivateequity.com/" , "57" )}>raboprivateequity</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.riversideeurope.com/Team.aspx" , "58" )}>riversideeurope</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.setventures.com/#Team" , "59" )}>setventures</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://smile-invest.com/team-3/" , "60" )}>smile_invest</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.startgreen.nl/nl/overons/team/" , "61" )}>startgreen</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://seaminvestments.nl/#team" , "62" )}>seaminvestments</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.strongrootcapital.nl/" , "63" )}>strongrootcapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.thujacapital.com/new-page-3" , "64" )}>thujacapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://tiincapital.nl/over-ons/het-team/" , "65" )}>tiincapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.synergia.nl/nl/over-synergia#leo-schenk" , "66" )}>synergia</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.torqxcapital.com/about-us/" , "67" )}>torqxcapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://vepartners.com/team/" , "68" )}>vepartners</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.vendiscapital.com/team/" , "69" )}>vendiscapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://victusparticipations.com/team/" , "70" )}>victusparticipations</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://vortexcp.com/about/" , "71" )}>vortexcp</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://transequity.nl/team/" , "72" )}>transequity</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.wadinko.nl/medewerkers/" , "73" )}>wadinko</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.waterland.nu/nl/team/" , "74" )}>waterland</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://vpcapital.eu/over-ons/team/" , "75" )}>vpcapital</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.impulszeeland.nl/nl/over/team" , "76" )}>impulszeeland</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://www.wmp.nl/team_wmp.html" , "77" )}>wmp</MenuItem>

        <MenuItem onClick={( ) => this.handleMenuClose ( "http://www.keadyn.com/heroes" , "78" )}>keadyn</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "https://uniiq.nl/#hetteam" , "79" )}>uniiq</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "" , "80" )}>80</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "" , "81" )}>81</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "" , "82" )}>82</MenuItem>
        <MenuItem onClick={( ) => this.handleMenuClose ( "" , "83" )}>83</MenuItem>
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
