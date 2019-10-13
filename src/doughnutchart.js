import React from 'react';
import { makeStyles , useTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';

import Chart from 'chart.js';

const useStyles = makeStyles(theme => ({
  root: {
    //backgroundColor: theme.palette.background.paper,
    //width:"60vw",
  },
}));

export default function SimpleTabs(props) {
  const classes = useStyles();
  const theme = useTheme ()
  let ctx = React.createRef();

  React.useEffect ( () => {
    new Chart(ctx.current, {
        type: 'doughnut',
        data: {
            labels: ['tablet', 'mobile', 'desktop', ],
            datasets: [{
                label: '# of Votes',
                data: [...props.data.devices],
                backgroundColor: [
                  theme.palette.primary.main,
                  theme.palette.secondary.main,
                  purple[500],
                ],
                borderColor: [
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
