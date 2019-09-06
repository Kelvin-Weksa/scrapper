import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ImageContainer from './image'
import ViewListIcon from '@material-ui/icons/ViewList';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import MapOutlinedIcon from '@material-ui/icons/MapOutlined';
//import Red from '@material-ui/core/colors/red';
//import CardActionArea from '@material-ui/core/CardActionArea';
//import CardActions from '@material-ui/core/CardActions';
//import Linkedin from 'mdi-material-ui/Linkedin';
//import UnfoldMoreVertical from 'mdi-material-ui/UnfoldMoreVertical';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles ( theme =>  ({
  root: {
    flexGrow: 1,
    padding: '1%',
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  card: {
    //position : "relative" ,
    maxWidth: 345,
    overflow:  'visible',
  },
  media: {
    height: 150,
  },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    textAlign: "left",
    flex: 1,
    color: theme.palette.secondary.light ,
  },
  title2: {
    marginLeft: theme.spacing(2),
    textAlign: "left",
    flex: 1,
    color: theme.palette.primary.main ,
  },
  Subtitle: {
    marginLeft: theme.spacing(2),
    textAlign: "left",
    flex: 1,
    color: theme.palette.primary.light ,
  },
  image_card: {
    display: 'block'
  },
  inner_card: {
    position : "relative" ,
    display : "inline-block" ,
    borderRadius: "3px",
    marginLeft: "5%",
    marginRight: "5%",
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    top: "-10px",
    width : "90%",
    zIndex:`${theme.zIndex.mobileStepper + 1}` ,
  },
  outer_card: {
    position : "relative" ,
    overflow:  "visible" ,
    width: "100%",
    textAlign:"center",
    "&:hover $inner_card": {
      top: "-40px",
    }
  },
  hidden_icon: {
    position:"absolute",
    color: theme.palette.secondary.light ,
    padding:'0px',
    top:"50%" ,
    left:"35%",
    zIndex:theme.zIndex.mobileStepper ,
  },
  text:{
    //position: 'absolute',
    textAlign:"left" ,
    color: theme.palette.primary.light,
  }
}) );

export default function MediaCard ( props ) {
  const classes = useStyles();
  const { characterName , characterPost , characterImage , characterPhone , characterFax ,
    characterMail , characterMap , characterLinkedIn ,
    characterMarket , characterAbout , from } = props;
  const characterImage_ = characterImage;//? characterImage.split( '?' )[ 0 ]: null;
  const [ open , setOpen ] = React.useState ( false );
  const [ shown , setShown ] = React.useState ( "" );

  let image = React.createRef ( );
  let outer_card = React.createRef ( );
  let hidden_icon = React.createRef ( );

  //console.log ( characterImage );

  React.useEffect ( () => {
    if ( 'ResizeObserver' in window ) {
      const myObserver = new ResizeObserver ( loaded );
      myObserver.observe ( outer_card.current );
    }else{
      window.addEventListener ( 'resize' , loaded );
      // Create an observer instance linked to the callback function
      const observer = new MutationObserver ( loaded );
      // Options for the observer (which mutations to observe)
      const config = { attributes: true, childList: true, subtree: true };
      // Start observing the target node for configured mutations
      observer.observe ( outer_card.current , config );
    }
    //component unmounts
    return () => {
      //observer.disconnect();
    };
  });

  function handleClickOpen ( ) {
    setOpen ( true );
  }

  function handleClose ( ) {
    setOpen ( false );
  }

  function loaded ( ){
    let img = image.current;
    let cont = outer_card.current;
    let icon = hidden_icon.current
    //console.log ( "image " + img.offsetHeight );
    //console.log ( "outer_card " + cont.offsetHeight );
    //console.log ( "img / outer_card " +  percent );
    if ( img ){
      let percent = (( img.offsetHeight * 90 ) - ( icon.offsetHeight * 100 )) / cont.offsetHeight;
      icon.style.top = percent.toString (  ) + '%';
    }
  }

  function show ( node ) {
    setShown( node );
  }

  return (
    <div>

    <div className={classes.card}>
      <Card className={classes.outer_card} title={from} ref={outer_card}>
        {characterName ? (
        <CardMedia
          component='img'
          alt="KW"
          height="150"
          image={characterImage_}
          className={classes.inner_card}
          onLoad={loaded}
          ref={image}
        />
        ):(
          <Skeleton variant="rect" height={150} className={classes.media} />
        )}
        {characterName ? (
        <Tooltip title="View" placement="right">
          <Button className={classes.hidden_icon} onClick={handleClickOpen} ref={hidden_icon}>
            <ViewListIcon/>
          </Button>
        </Tooltip>
        ):(
          null
        )}
        {characterName ? (
        <CardContent style={{position:'relative',padding:'0px'}}>
          <Typography gutterBottom variant="h6" component="h2">
            {characterName}
          </Typography>
          <Typography variant="subtitle2" color="textPrimary" component="p">
            {characterPost}
          </Typography>
        </CardContent>
        ):(
        <React.Fragment>
          <Skeleton height={6} width="80%" />
          <Skeleton height={6} width="60%" />
          <Skeleton height={6} width="40%" />
        </React.Fragment>
        )}
      </Card>
    </div>

      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="secondary" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <ImageContainer src={characterImage_}
              phone={characterPhone}
              mail={characterMail}
              fax={characterFax}
              linkedIn={characterLinkedIn}
            />
          </Grid>
          <Grid item xs={8}>
            <Paper className={classes.paper} >
              <Typography variant="h4" className={classes.title}>
                {characterName}
              </Typography>
              <Typography variant="h5" className={classes.title2}>
                {characterPost}
              </Typography>
              <Typography variant="subtitle2" className={classes.Subtitle}>
                {characterMarket}
              </Typography>
              <Typography variant="body1" color="textSecondary" style={{textAlign:"left"}}>
                {characterAbout}
              </Typography>
              <Divider variant="middle" />
              <Typography className={classes.text}>
                {shown}
              </Typography>
            </Paper>
            <div>
              <Button size="small" color="primary" style={{textAlign:'left'}}onClick={()=>show(
                <div>
                  <MapOutlinedIcon/>
                  {characterMap}
                </div>)}>
                <MapOutlinedIcon/>
              </Button>
            </div>
            <Divider variant="middle" />
          </Grid>
        </Grid>
        </div>
      </Dialog>
    </div>
  );
}
