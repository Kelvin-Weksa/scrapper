import React from 'react';
import { makeStyles , /*useTheme*/ } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Linkedin from 'mdi-material-ui/GooglePlusBox';
import FacebookBox from 'mdi-material-ui/FacebookBox';
import TwitterBox from 'mdi-material-ui/Twitter';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

const useStyles = makeStyles( theme => ({
  HeaderCard: {
    width: '90%',
    margin: 'auto',
    backgroundColor: theme.palette.primary.main ,
    height :  '25vh',
    position: 'relative',
    top:'-5vh',
    boxShadow: `0 0 5px ${theme.palette.primary.main}` ,
    textAlign: 'center'
  },
  Card: {
    position: 'relative',
    width: '30%',
    margin: 'auto',
    height: '90vh',
    top: '0vh' ,
    overflow: "visible" ,
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  Kard:{
    background : `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url(static/bg7.jpg)` ,
    height: '130vh' ,
  }
}));

export default function SimpleCard ( ) {
  const classes = useStyles ( );
  let card = React.createRef ( );
  //const theme = useTheme();

  React.useEffect ( ( ) => {
    setTimeout( card.current.style.top = '15vh' , 0 );
    return () => {
    };
  });

  return (
      <div className={classes.Kard}>
        <Toolbar/>
        <Card ref={card} className={classes.Card}>
          <Card className={classes.HeaderCard}>
            <Typography style={{padding:'12px' , color: 'white'}}>
              Log in
            </Typography>
            <CardActions style={{ display:'flex' , justifyContent:"center" , padding:'12px' }}>
              <IconButton style={{color:'white'}}>
                <FacebookBox/>
              </IconButton>
              <IconButton style={{color:'white'}}>
                <TwitterBox/>
              </IconButton>
              <IconButton style={{color:'white'}}>
                <Linkedin/>
              </IconButton>
            </CardActions>
          </Card>
          <CardContent >
            <TextField
              label="Name"
              variant="outlined"
              id="mui-theme-provider-outlined-input"
              fullWidth={true}
              style={{paddingTop:'12px',paddingBottom:'12px'}}
            />
            <TextField
              label="Email"
              variant="outlined"
              id="mui-theme-provider-outlined-input"
              fullWidth={true}
              style={{paddingTop:'12px',paddingBottom:'12px'}}
            />
            <TextField
              label="password"
              variant="outlined"
              id="mui-theme-provider-outlined-input"
              fullWidth={true}
              type="password"
              style={{paddingTop:'12px'}}
            />
          </CardContent>
          <CardActions >
            <Link to='/dashboard' style={{margin:'0 auto'}}>
              <Button color='secondary' size="small" >
                Let's Go
              </Button>
            </Link>
          </CardActions>
        </Card>
      </div>
  );
}
