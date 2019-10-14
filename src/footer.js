import React from 'react';
import {useTheme } from '@material-ui/core/styles';
import Linkedin from 'mdi-material-ui/GooglePlusBox';
import FacebookBox from 'mdi-material-ui/FacebookBox';
import TwitterBox from 'mdi-material-ui/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import GitHubIcon from '@material-ui/icons/GitHub';
import YouTubeIcon from '@material-ui/icons/YouTube';
import CopyrightIcon from '@material-ui/icons/Copyright';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';



export default function Footer (props) {
  const theme = useTheme();
  return(
    <div
      style={{
        display:'flex',
        flexFlow:'column nowrap',
        width:'100%',
        boxShadow: `0 0 11px ${theme.palette.secondary.dark}` ,
      }}

    >
      <div style={{flex:`1 0 auto`}}/>
      <footer
        style={{
          flex:`0 0 30vh`,
          backgroundColor:theme.palette.primary.light,
          color:'white',
          padding:'0',
          display:'flex',
          flexFlow:'column nowrap'
        }}>

        <div style={{height:theme.mixins.toolbar.minHeight/2}}/>
        <hr style={{width:"90%"}}/>
        <div style={{display:'flex',justifyContent:"center",width:'100%'}}>
          <IconButton style={{color:'white'}}>
            <FacebookBox fontSize="large"/>
          </IconButton>
          <IconButton style={{color:'white'}}>
            <TwitterBox fontSize="large"/>
          </IconButton>
          <IconButton style={{color:'white'}}>
            <Linkedin fontSize="large"/>
          </IconButton>
          <IconButton style={{color:'white'}}>
            <InstagramIcon fontSize="large"/>
          </IconButton>
          <IconButton style={{color:'white'}}>
            <GitHubIcon fontSize="large"/>
          </IconButton>
          <IconButton style={{color:'white'}}>
            <YouTubeIcon fontSize="large"/>
          </IconButton>
        </div>
        <div style={{flex:`1 0 auto`}}/>
        <div style={{display:'flex',alignItems:'flex-end',backgroundColor:theme.palette.primary.dark,justifyContent:'space-evenly'}}>
          <Button color="inherit" variant="caption">
            Terms & Conditions
          </Button>
          <Button color="inherit" variant="caption">
            Privacy Policy
          </Button>
        <div style={{flex:'1 0 auto'}}/>
          <Typography variant="caption">
            <CopyrightIcon/>2019
            Copyright Bernard Lom.
          </Typography>
        </div>
      </footer>
    </div>
  )
}
