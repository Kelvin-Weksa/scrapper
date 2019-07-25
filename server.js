const express = require ( 'express' );
const favicon = require ( 'express-favicon' );
const path = require ( 'path' );
const puppeteer = require ( 'puppeteer' );
const port = process.env.PORT || 8080;
const app = express ( );

app.use ( express.static ( __dirname ) );
app.use ( express.static ( path.join ( __dirname , 'build' ) ) );

function run3i ( ) {
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
      let urls = [ ];
      let currentPage = 1;
      //specific to website
      {
        let lastPage = 7;
        await page.goto ( "https://www.3i.com/our-people/?page=1" , { timeout: 0 } );
        while ( currentPage <= lastPage ){
          let rollingUrls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items2 = document .querySelectorAll ( 'div.item-container' );
            items2.forEach ( ( item ) => {
              results.push ( {
                  name    : item .querySelector ( 'h5' )      .innerText ,
                  job     : item .querySelector ( '.area' )   .innerText ,
                  market  : item .querySelector ( 'p' )   .innerText ,
                  image   : item .querySelector ( 'img' )   .src ,
                  from    : "Live from https://www.3i.com/our-people/"
              } );
            } );
            return results;
          } )
          urls = urls.concat ( rollingUrls );
          {
            //go to next page
            if ( currentPage ++ == lastPage ) break;
            await Promise.all ( [
                page.waitForNavigation ( { timeout: 0 } ) ,
                page .click ( 'li.next > a' ) ,
                page .waitForSelector ( '.portfolio-item-list' )
            ] )
          }
        }
      }
      //
      browser.close ( );
      return resolve ( urls );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function runaacc ( ) {
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
      let urls = [ ];
      //specific to website
      {
        await page.goto ( "http://aaccapital.com/nl/team/" , { timeout: 0 } );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.col-md-4.js-collapse.cardblock.team.multiple' );
            items.forEach ( ( item ) => {
              results.push ( {
                  name    : item .querySelector ( 'h4' )  .innerText ,
                  //job     : item.innerHTML ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src ,
                  from    : "Live from http://aaccapital.com/nl/team/"
              } );
            } );
            return results;
          } )
        }
      }
      //
      browser.close ( );
      return resolve ( urls );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

//runaacc ( ) .then ( console.log ) .catch ( console.error );

app.get ( '/1' , function ( req , res ) {
  console.log ( "hi 1" );
  run3i ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/2' , function ( req , res ) {
  console.log ( "hi 2" );
  runaacc ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/*' , function ( req , res ) {
  res.sendFile ( path.join ( __dirname , 'build' , 'index.html' ) );
});

app.listen ( port );
