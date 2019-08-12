import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Linkedin from 'mdi-material-ui/Linkedin';
import UnfoldMoreVertical from 'mdi-material-ui/UnfoldMoreVertical';
import Skeleton from '@material-ui/lab/Skeleton';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const useStyles = makeStyles ( {
  card: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
} );

export default function MediaCard ( props ) {
  const classes = useStyles();
  const { characterName , characterPost , characterImage , characterMarket , from } = props;
  const [ open , setOpen ] = React.useState ( false );

  function handleClickOpen ( ) {
    setOpen ( true );
  }

  function handleClose ( ) {
    setOpen ( false );
  }
  return (
    <div>
      <Card className={classes.card}  title={from}>
        <CardActionArea>
          {characterName ? (
            <CardMedia
              className={classes.media}
              image={characterImage}
            />
          ):(
            <Skeleton variant="rect" className={classes.media} />
          )}
        <CardContent>
          {characterName ? (
              <Typography gutterBottom variant="h5" component="h2">
                {characterName}
              </Typography>
            ):(
              <Skeleton height={6} width="80%" />
          )}
          {characterName ? (
            <Typography variant="body2" color="textSecondary" component="p">
              {characterPost}
              <hr />
              {characterMarket}
            </Typography>
          ):(
            <React.Fragment>
              <Skeleton height={6} width="60%" />
              <Skeleton height={6} width="40%" />
            </React.Fragment>
          )}
        </CardContent>
      </CardActionArea>
      {characterName ? (
        <CardActions>
          <Button size="small" color="primary">
            <Linkedin/>
          </Button>
          <Button size="small" color="primary" onClick={handleClickOpen}>
            <UnfoldMoreVertical/>
          </Button>
        </CardActions>
        ):(
          null
        )}
      </Card>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} TransitionComponent={Transition}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {characterName}
        </DialogTitle>
        <DialogContent dividers>
        <CardMedia
          className={classes.media}
          image={characterImage}
        />
        <Typography gutterBottom>
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis
          lacus vel augue laoreet rutrum faucibus dolor auctor.
        </Typography>
        <Typography gutterBottom>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
          scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
          auctor fringilla.
        </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
