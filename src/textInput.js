import React from 'react';
import { makeStyles , } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import clsx from 'clsx';

const useStyles = makeStyles( theme => ({
  input: {
    '& label.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderLeftWidth: 6,
        padding: '4px !important', // override inline-style
      },
    },
  },
  inputValid: {
    '& label.Mui-focused': {
      color: 'green',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
          borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: 'green',
        borderLeftWidth: 6,
        padding: '4px !important', // override inline-style
      },
    },
  },
  inputError: {
    '& label.Mui-focused': {
      color: 'red',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: 'red',
        borderLeftWidth: 6,
        padding: '4px !important', // override inline-style
      },
    },
  },
}));

export default function Input( props ){
  const classes = useStyles ( );
  const [input, setinput] = React.useState({
    val:'',
    error:false,
    valid:false
  });

  React.useEffect(() => {
    change_log ( props.value )
    return () => {
    };
  });

  function change_log (event) {
    if ( event ){
      let error = ! props.validate( event );
      setinput ( {...input , val:event , error:error , valid:!error} );
    }else {
      setinput ( {...input , val:event, error:false , valid:false} );
    }
  }

  return(
    <TextField
      required
      className={clsx({
        [classes.inputError]: input.error,
        [classes.input]: !input.error,
        [classes.inputValid]: input.valid,
      })}
      error={input.error}
      variant="outlined"
      type="email"
      id="mui-theme-provider-outlined-input"
      fullWidth={true}
      style={{width:'90%',paddingTop:'12px',paddingBottom:'12px'}}
      {...props}
    />
  )
}
