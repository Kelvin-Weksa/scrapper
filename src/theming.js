import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';
import ViewListIcon from '@material-ui/icons/ViewList';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from '@material-ui/lab/Skeleton';


const useStyles = makeStyles ( theme =>({
  card: {
    positiion : "relative" ,
    maxWidth: 275,
    margin: "10%",
    overflow:  'visible',
  },
  inner_card: {
    position : "relative" ,
    display : "inline-block" ,
    borderRadius: "3px",
    marginLeft: "5%",
    marginRight: "5%",
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    top: "-10px",
    //border: "1px solid",
    width : "90%",
    zIndex:theme.zIndex.appBar ,
  },
  outer_card: {
    padding: "1px",
    overflow:  "visible" ,
    maxWidth: 375,
    textAlign:"center",
    "&:hover $inner_card": {
      top: "-40px",
    }
  },
  hidden_icon: {
    color: theme.palette.primary.main ,
    top:"-41px" ,
    zIndex:theme.zIndex.mobileStepper ,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}) );

export default function SimpleCard ( props ) {
  const classes = useStyles ( );
  const { characterName , characterPost , characterImage , characterMarket , from } = props;

  return (
    <div className={classes.card}>
      <Card className={classes.outer_card} title={from} height={200} >
        {characterName ? ( <CardMedia
          component='img'
          alt="Contemplative Reptile"
          height="150"
          image={characterImage}
          title="Contemplative Reptile"
          className={classes.inner_card}
        />
        ):(
          <Skeleton variant="rect" height={150} className={classes.media} />
        )}
        {characterName ? (
        <Tooltip title="View" >
          <Button className={classes.hidden_icon} onClick={handleClickOpen}>
            <ViewListIcon/>
          </Button>
        </Tooltip>
        ):(
          null
        )}
        {characterName ? (
        <CardContent style={{position:'relative',top:"-50px" }}>
          <Typography gutterBottom variant="h6" component="h2">
            {characterName}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" component="p">
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
  );
}


/*
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
  */
