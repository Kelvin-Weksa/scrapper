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
  // 'private' variable for instance
  // The returned function will be able to reference this due to closure.
  // Each call to the returned function will share this common timer.
  var timeout;

  // Calling debounce returns a new anonymous function
  return function() {
    // reference the context and args for the setTimeout function
    var context = this,
      args = arguments;

    // Should the function be called now? If immediate is true
    //   and not already in a timeout then the answer is: Yes
    var callNow = immediate && !timeout;

    // This is the basic debounce behaviour where you can call this
    //   function several times, but it will only execute once
    //   [before or after imposing a delay].
    //   Each time the returned function is called, the timer starts over.
    clearTimeout(timeout);

    // Set the new timeout
    timeout = setTimeout(function() {

      // Inside the timeout function, clear the timeout variable
      // which will let the next execution run when in 'immediate' mode
      timeout = null;

      // Check if the function already ran with the immediate flag
      if (!immediate) {
        // Call the original function with apply
        // apply lets you define the 'this' object as well as the arguments
        //    (both captured before setTimeout)
        func.apply(context, args);
      }
    }, wait);

    // Immediate mode and no wait timer? Execute the function..
    if (callNow) func.apply(context, args);
  }
}

function DetectBottom() {
  const [bottomYet, setBottom] = React.useState ( false );
  let lastScrollTop = React.useRef ( window.pageYOffset );

  React.useEffect(() => {
    const handleScroll = () => {
      var st = window.pageYOffset //|| document.documentElement.scrollTop;
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
