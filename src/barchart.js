import React from 'react';
import { makeStyles , useTheme } from '@material-ui/core/styles';

import Chart from 'chart.js';

const useStyles = makeStyles(theme => ({
  root: {
    //backgroundColor: theme.palette.background.paper,
    //width:"60vw",
  },
}));

export default function SimpleTabs (props) {
  const classes = useStyles();
  const theme = useTheme ()
  let ctx = React.createRef();
  let backgroundColor = [
    theme.palette.primary.main,
    theme.palette.primary.main,
    theme.palette.primary.main,
    theme.palette.primary.main,
    theme.palette.primary.main,
    theme.palette.primary.main,
    theme.palette.primary.main,
  ]
  backgroundColor[new Date().getDay()] = theme.palette.secondary.light;
  backgroundColor.push(backgroundColor.shift())
  let borderColor=[
    theme.palette.secondary.light,
    theme.palette.secondary.light,
    theme.palette.secondary.light,
    theme.palette.secondary.light,
    theme.palette.secondary.light,
    theme.palette.secondary.light,
    theme.palette.secondary.light,
  ]
  borderColor[new Date().getDay()] = theme.palette.primary.light;
  borderColor.push(borderColor.shift())
  React.useEffect ( () => {
    let ary = props.data.wk_days.reverse()
    ary.push(ary.shift())
    new Chart(ctx.current, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat' , 'Sun'],
            datasets: [{
                label: ['#This weeks Usage'],
                data: [...ary.reverse()],
                backgroundColor: [...backgroundColor ],
                borderColor: [...borderColor],
                borderWidth: 0.3
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
  } )

  return (
    <div className={classes.root}>
      <canvas id="myChart" ref={ctx}></canvas>
    </div>
  );
}
