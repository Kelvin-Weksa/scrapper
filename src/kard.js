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


const useStyles = makeStyles({
  card: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});

export default function MediaCard ( props ) {
  const classes = useStyles();
  const { characterName , characterPost , characterImage , characterMarket , from } = props;

  return (
    <Card className={classes.card}  title={from}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={characterImage}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
          {characterName}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
          {characterPost}
          <hr />
          {characterMarket}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          <Linkedin/>
        </Button>
        <Button size="small" color="primary">
          <UnfoldMoreVertical/>
        </Button>
      </CardActions>
    </Card>
  );
}
