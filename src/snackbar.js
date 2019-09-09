import React from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import RestorePageIcon from '@material-ui/icons/RestorePage';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1),
  },
}));

export default function MyApp ( props ) {
  const { enqueueSnackbar , closeSnackbar } = useSnackbar();
  const classes = useStyles();

  const handleClickVariant = variant => () => {
    // variant could be success, error, warning, info, or default

    const action = ( key ) => (
        <Button onClick={() => { closeSnackbar(key) }}>
            {'Dismiss'}
        </Button>
    );

    enqueueSnackbar ( "show them" , {
      variant  ,
      action ,
      autoHideDuration: 2500,
    });
  };

  return (
    <React.Fragment>
      <IconButton variant="contained" color="secondary" className={classes.margin} onClick={handleClickVariant('info')}>
        <RestorePageIcon className={classes.rightIcon} />
      </IconButton>
    </React.Fragment>
  );
}
