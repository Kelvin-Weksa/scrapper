const express = require ( 'express' );
const favicon = require ( 'express-favicon' );
const path = require ( 'path' );
const puppeteer = require ( 'puppeteer' );

const port = process.env.PORT || 8080;
const app = express ( );

app.use ( express.static ( __dirname ) );
app.use ( express.static ( path.join ( __dirname , 'build' ) ) );
app.get ( '/ping' , function ( req , res ) {
 return res.send ( 'pong' );
});

function run ( ) {
    return new Promise ( async ( resolve , reject ) => {
        try {
          const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] } );
          const page = await browser.newPage ( );
          await page.setRequestInterception ( true );
          page.on ( 'request' , ( request ) => {
            if ( request .resourceType ( ) === 'document' ) {
              request .continue ( );
            } else {
              request.abort ( );
            }
          } );
          await page.goto ( "https://www.steinigers.com/our-team/" , { timeout: 0 } );
          let urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items2 = document .querySelectorAll ( 'div.k2UsersBlock.peoplemod' );
            let items3 = Array.from ( items2 ) .map ( array => array .querySelectorAll ( 'td.pmt2' ) );
            items3.forEach ( ( item ) => {
              item.forEach ( ( element ) => {
                results.push ( {
                    name : element .querySelector ( 'a.UserName' ) .innerText ,
                    job  : element .querySelector ( 'div.UserURL' ) .innerText ,
                    image: "static/live-from-space.jpg" ,
                } );
              } )
            } );
            return results;
          } )
          browser.close ( );
          return resolve ( urls );
        } catch ( e ) {
          return reject ( e );
        }
    })
}
//run ( ).then ( console.log ) .catch ( console.error );
app.get ( '/datum' , function ( req , res ) {
  console.log ( "you may be here a while" );
  run ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/*' , function ( req , res ) {
  res.sendFile ( path.join ( __dirname , 'build' , 'index.html' ) );
});

app.listen ( port );
//const browser = await puppeteer.launch ( /*{ args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] }*/ );
