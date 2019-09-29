import React from 'react';
import { makeStyles , useTheme } from '@material-ui/core/styles';

import Chart from 'chart.js';

const useStyles = makeStyles(theme => ({
  root: {
    //backgroundColor: theme.palette.background.paper,
    //width:"60vw",
  },
}));

export default function SimpleTabs() {
  const classes = useStyles();
  const theme = useTheme ()
  let ctx = React.createRef();

  React.useEffect ( () => {
    new Chart(ctx.current, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat' , 'Sun'],
            datasets: [{
                label: '# Usage last seven days',
                data: [12, 19, 3, 5, 2, 3, 10],
                backgroundColor: [
                  theme.palette.primary.main,
                  theme.palette.primary.main,
                  theme.palette.primary.main,
                  theme.palette.primary.main,
                  theme.palette.primary.main,
                  theme.palette.primary.main,
                  theme.palette.primary.main,
                ],
                borderColor: [
                    theme.palette.secondary.light,
                    theme.palette.secondary.light,
                    theme.palette.secondary.light,
                    theme.palette.secondary.light,
                    theme.palette.secondary.light,
                    theme.palette.secondary.light,
                    theme.palette.secondary.light,
                ],
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
