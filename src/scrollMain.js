import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  margin: {
    display: 'flex' ,
    justifyContent: 'center' ,
  } ,
  info: {
    display: 'flex' ,
    justifyContent: 'center' ,
    width : theme.mixins.toolbar.minHeight,
    height: theme.mixins.toolbar.minHeight,
    "&:hover": {
      boxShadow: `0 0 11px ${theme.palette.primary.main}`
    }
  },
}));

function debounce( func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);
    if (callNow) func.apply(context, args);
  }
}

function DetectBottom() {
  const [bottomYet, setBottom] = React.useState ( false );
  let lastScrollTop = React.useRef ( window.pageYOffset );

  React.useEffect(() => {
    const handleScroll = () => {
      var st = window.pageYOffset
      if (  ( window.innerHeight + window.scrollY ) >= document.body.offsetHeight ) {
         if ( st > lastScrollTop.current ) {
           setBottom ( true )
         }else{
           setBottom ( false )
         }
      } else {
         setBottom ( false )
      }
      lastScrollTop.current = st <= 0 ? 0 : st;
    };
    let debounceScroll = debounce ( handleScroll , 500 )
    window.addEventListener( 'scroll' , debounceScroll );
    return () => {
      window.removeEventListener( 'scroll' , debounceScroll );
    };
  });

  return bottomYet;
}

export default function MyResponsiveComponent ( props ) {
  const classes = useStyles();
  const scroll = DetectBottom ( ); // Our custom Hook

  React.useEffect ( ( ) => {
    if (  ( window.innerHeight + window.scrollY + 100 ) >= document.body.offsetHeight ){
      if ( scroll && props.page ){
        props.paginate ( );
      }
    }
    return () => {
    };
  });

  let spinner = ( scroll && props.page ) ? <CircularProgress className={classes.progress} color="secondary" /> : 'More...'
  if ( ! props.page )
    spinner = `Thats all of it!`;
  return (
    <React.Fragment>
      <Toolbar/>
      <Typography className={classes.margin}>
        <div className={classes.info}>
          {spinner}
        </div>
      </Typography>
    </React.Fragment>
  );
}
