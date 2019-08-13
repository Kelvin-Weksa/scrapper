const express = require ( 'express' );
const favicon = require ( 'express-favicon' );
const path = require ( 'path' );
const puppeteer = require ( 'puppeteer' );
const http = require  ( "http" );
const socketIo = require  ( "socket.io" );
var geoip = require('geoip-lite');

const port = process.env.PORT || 8080;

const app = express ( );
const server = http .createServer ( app );
const io = socketIo ( server );

app.use ( express.static ( __dirname ) );
app.use ( express.static ( path.join ( __dirname , 'build' ) ) );

async function autoScroll ( page ){
    await page.evaluate ( async ( ) => {
        await new Promise ( ( resolve , reject  ) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval ( ( ) => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy ( 0 , distance  );
                totalHeight += distance;
                if (  totalHeight >= scrollHeight ){
                    clearInterval ( timer );
                    return resolve ( scrollHeight );
                }
            }, 50  );
        });
    });
}

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
            let items2 = Array.from ( items ) .map ( array => document .getElementById ( array .getAttribute ( "data-target" ) ) );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h4' )  .innerText ,
                  job     : items2 [ index ]  .querySelector ( "h2 + h2" ).innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src ,
                  from    : "Live from http://aaccapital.com/nl/team/"
              } );
            } );
            return results;
          } );
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

function run5sq ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( {
        args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] ,
      } );
      let urls = [ ];
      const page = await browser .newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      await page.goto ( "http://www.5square.nl/#page_458" , { timeout: 0 } );
      urls = await page.evaluate ( ( ) => {
        let links = [ ];
        let items = document .querySelectorAll ( 'div#page_458 > ul.da-thumbs > li > a' );
        Array.from ( items ).forEach ( ( item  , index ) => {
          links.push ( item  .href );
        } );
        return links;
      } )
      function crawlUrl ( url ) {
        return new Promise ( async ( resolve , reject ) => {
          try{
            // Open new tab.
            const page = await browser .newPage ( );
            await page.setRequestInterception ( true );
            page.on ( 'request' , ( request ) => {
              if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                  request .abort ( );
              } else {
                  request .continue  ( );
              }
            } );
            await page .goto ( url , { timeout: 0 } );
            const result = await page.evaluate  ( ( ) => {
              return {
                name  : document .querySelector ( 'span.underline' ) .innerText ,
                image : document .querySelector ( 'div.title-box + img' ) .src ,
                job   : document .querySelector ( 'div.col-6  p' ) .innerText.trim ( ) || "ADVISOR" ,
              };
            } )
            await page.close ( );
            //console.log ( result );
            return resolve ( result )
          }catch ( e ){
            return reject ( e )
          }
        } )
      };
      let datas = await Promise.all ( [ ...urls.map ( crawlUrl ) ] ).catch ( e => { console.log ( e ) } );
      browser.close ( );
      return resolve ( datas );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function runactivecapital ( ) {
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
        await page.goto ( "http://www.activecapitalcompany.com/over-ons/team" , { timeout: 0 } );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'a.sbr' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'span.field-title' )  .innerText ,
                  job     : item .querySelector ( 'span.field-extra_function' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'span.background' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "http://www.activecapitalcompany.com/over-ons/team"
              } );
            } );
            return results;
          } );
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

function runadventinternational ( ) {
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
        await page.goto ( "https://www.adventinternational.com/team/" , { timeout: 0 } );
        /*if (  await page.$  ( 'a.button.load-more'  ) !== null  ) {
          await Promise.all ( [
            page.waitForNavigation ( { timeout: 0 } ) ,
            page.click ( 'a.button.load-more' ),
          ] );
        }*/
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.more.item.col-xs-6.col-sm-3.hide.member-item.js-team-member-container' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h2 > a' )  .innerText ,
                  job     : item .querySelector ( 'h2 + p' )  .innerText ,
                  market  : item .querySelector ( 'p.location' )  .innerText ,
                  image   : item .querySelector ( 'div.img-wrapper > img' )  .src ,
                  from    : "https://www.adventinternational.com/team/"
              } );
            } );
            return results;
          } );
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

function runalpinvest ( ) {
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
        await page.goto ( "http://www.alpinvest.com/leadership" , { timeout: 0 } );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.contentArea_smallBioColumn.vCard' );
            //.reduce ( ( a , b) => a += ( b .nodeType === 3 ? b .textContent : '' ) , '' ) ,
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'a.contentLink_bioName.fn' )  .innerText ,
                  job     : item.childNodes [ 3 ] .textContent .trim ( ) .split ( '\n' ) [ 1 ] .trim ( ),
                  market  : item .querySelector ( 'i' )  .innerText .slice ( 1 , -2 ) ,
                  image   : item .querySelector ( 'img.photo' )  .src ,
                  from    : "http://www.alpinvest.com/leadership"
              } );
            } );
            return results;
          } );
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

function runantea ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://www.antea.nl/de-mensen/de-directie/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.page_content_wrapper.nopadding' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h2.ppb_title' )  .innerText ,
                  job     : item .querySelector ( 'div.ppb_subtitle' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'div.one_half_bg.animate.visible:not(.textright)' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.antea.nl/de-mensen/de-directie/" ,
              } );
            } );
            return results;
          } );
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

/*function runatlanticcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "http://www.atlanticcapital.nl/nl/wie-zijn-wij" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            results .push ( {
              name  : document .querySelector ( 'u' ) ,
              job   : document .querySelector ( 'p > strong' )
            } )

            return results;
          } );
        }
      }
      //
      browser.close ( );
      return resolve ( urls );
    } catch ( e ) {
      return reject ( e );
    }
  })
}*/

function runbaincapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://www.baincapital.com/people" , { timeout : 0 , } );
        console.log ( "begin scrolling ..." );
        let i = 0;
        while ( i ++ < 5 ){
          try {
            await page .hover  ( ".text-center"  );
          } catch ( e ){}
          try{
            await page.waitForSelector ( "button#press-loading-example-btn" );
          }catch ( e ){ break; }
          console.log ( "scrolling for more..." );
        }
            console.log ( "done..." );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.__team_bg' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h4 > span' )  .innerText ,
                  job     : item .querySelector ( 'h4 > small' )  .innerText ,
                  market  : item .querySelector ( '.__location > span' )  .innerText + ' ' + item .querySelector ( 'span.locationList' )  .innerText ,
                  image   : item .querySelector ( '.team_img > img' ) .src ,
                  from    : "https://www.baincapital.com/people" ,
              } );
            } );
            return results;
          } );
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

function runbbcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "http://bbcapital.nl/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.tmm_member' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'div.tmm_names' )  .innerText ,
                  job     : item .querySelector ( 'div.tmm_job' )  .innerText ,
                  //market  : "" ,
                  image   : getComputedStyle ( item .querySelector ( 'div.tmm_photo' ) ) .getPropertyValue ( 'background-image' ) .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "http://bbcapital.nl/team/" ,
              } );
            } );
            return results;
          } );
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

function runavedoncapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://avedoncapital.com/team/#main-content" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'article.team-preview.tile.mix.de' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h3.name' )  .innerText ,
                  job     : item .querySelector ( 'div.position' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'div.profile-image' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://avedoncapital.com/team/#main-content" ,
              } );
            } );
            return results;
          } );
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

function runbolsterinvestments ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://bolsterinvestments.nl/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.member.in-view.is-in-view' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h3.h2.title' )  .innerText ,
                  job     : item .querySelector ( 'span.jobtitle' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'div.member--image' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://bolsterinvestments.nl/team/" ,
              } );
            } );
            return results;
          } );
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

function runbridgepoint ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = document .querySelectorAll ( 'div.column_one_third.result_item_3col.first' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                    name    : item .querySelector ( 'div > p > a' )  .innerText ,
                    job     : item .querySelector ( 'div > ul > li' )  .innerText ,
                    market  : item .querySelector ( 'div > ul > li + li' )  .innerText ,
                    image   : item .querySelector ( 'img' ) .src ,
                    from    : `http://www.bridgepoint.eu/en/our-team/?&page=` ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ ];
      let i = -1;
      while ( i ++ < 8 ){
        urls .push ( `http://www.bridgepoint.eu/en/our-team/?&page=${i}`  )
      }
      let datas = //await crawlUrl ( `http://www.bridgepoint.eu/en/our-team/?&page=0` );
                  await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function runbrightlandsventurepartners ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://brightlandsventurepartners.com/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.column.cell.team-item' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'a' )  .innerText ,
                  job     : "Partner"  ,//item .querySelector ( 'span.jobtitle' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'div.inner' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://brightlandsventurepartners.com/team/" ,
              } );
            } );
            return results;
          } );
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

function runcapitalapartners ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://www.capitalapartners.nl/team" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'article.card.card--large' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h3.card__title' )  .innerText ,
                  job     : item .querySelector ( 'h4.card__subtitle' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'div.card__background.lazyloaded' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.capitalapartners.nl/team" ,
              } );
            } );
            return results;
          } );
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

function runcinven ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://www.cinven.com/who-we-are/the-team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'a.item.col-md-4' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'div.name' )  .innerText ,
                  job     : item .querySelector ( 'div.position' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src , //style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.cinven.com/who-we-are/the-team/" ,
              } );
            } );
            return results;
          } );
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

function committedcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://committedcapital.nl/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.item.cbp-item.boxed-item.col-xs-4.no-excerpt' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h4.member-name' )  .innerText ,
                  job     : item .querySelector ( 'p.team-member-description.normal' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src , //style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://committedcapital.nl/team/" ,
              } );
            } );
            return results;
          } );
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

function cottonwood ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://www.cottonwood.vc/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.progression-masonry-item.progression-masonry-col-4.opacity-progression' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h2.invested-team-title' )  .innerText ,
                  job     : item .querySelector ( 'div.invested-excerpt-team' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src , //style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.cottonwood.vc/" ,
              } );
            } );
            return results;
          } );
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

function cvc ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://www.cvc.com/people/working-at-cvc" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.person-wrapper' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'p.person-name' )  .innerText .replace ( '\n' ,'' ) .trim ( ) ,
                  job     : item .querySelector ( 'p.person-designation' )  .innerText .replace ( '\n' ,'' ) .trim ( ) ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src , //style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.cvc.com/people/working-at-cvc" ,
              } );
            } );
            return results;
          } );
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

function dehogedennencapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page .goto ( "https://www.dehogedennencapital.nl/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'a.js-modal__link.c-full-img-link-blocks__block.c-full-img-link-blocks__block--orange' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h3' )  .innerText  ,
                  job     : item .querySelector ( 'small' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'div.c-full-img-link-blocks__block__img.u-bg-cover-center' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.dehogedennencapital.nl/team/" ,
              } );
            } );
            return results;
          } );
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

function delftenterprises ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "http://www.delftenterprises.nl/wat-we-doen/onze-mensen/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        //await page.waitForSelector ( 'p[text-align=left]' );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "p:has(img)" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'strong' )  .innerText  ,
                  job     : item  .innerText .split ( '\n' ) [ 1 ] ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src ,
                  from    : "http://www.delftenterprises.nl/wat-we-doen/onze-mensen/" ,
              } );
            } );
            return results;
          } );
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

function ecart ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://www.ecart.nl/en/organisatie-missie/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.col-md-4" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.name' )  .text ( )  ,
                  //job     : item .querySelector ( 'div.name' )  .innerText  ,
                  //market  : "" ,
                  image   : $ ( item ) .find ( 'img' ) .attr ( 'src' ) ,
                  from    : "https://www.ecart.nl/en/organisatie-missie/" ,
              } );
            } );
            return results;
          } );
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

function egeria ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://egeria.nl/team-overzicht/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.item-inner" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.item-content' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'div.item-footer' )  .text ( )  .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( ) ,
                  //market  : "" ,
                  image   : $ ( item ) .find ( 'img.img-responsive' ) .attr ( 'src' ) ,
                  from    : "https://egeria.nl/team-overzicht/" ,
              } );
            } );
            return results;
          } );
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

function eqtpartners ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://www.eqtpartners.com/Organization/Executive-Committee/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.delegate" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h2.committee' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'p.block' )  .text ( )  .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( ) ,
                  //market  : "" ,
                  image   : $ ( item ) .find ( 'img.img-responsive' ) .attr ( 'src' ) ,
                  from    : "https://www.eqtpartners.com/Organization/Executive-Committee/" ,
              } );
            } );
            return results;
          } );
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

function forbion ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://forbion.com/en/team/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "article.team-thumb" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h3' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'div.role' )  .text ( )  .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( ) ,
                  //market  : "" ,
                  image   : $ ( item ) .find ( 'img' ) .attr ( 'src' ) ,
                  from    : "https://forbion.com/en/team/" ,
              } );
            } );
            return results;
          } );
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

function gembenelux ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://gembenelux.com/over-ons/235/mensen.html" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "li:has(div.image)" );;
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.text > h3 + h3' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'div.text > span' )  .text ( )  .replace ( '(' , '' ). replace ( ')', '' ) . trim ( ) ,
                  //market  : "" ,
                  image   : $ ( item ) .find ( 'div.image > span' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://gembenelux.com/over-ons/235/mensen.html" ,
              } );
            } );
            return results;
          } );
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

function gilde ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "http://gilde.com/team/investment-team" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.item-holder" );;
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.item-content > strong' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'div.item-content > span' )  .text ( )  .replace ( '(' , '' ). replace ( ')', '' ) . trim ( ) ,
                  //market  : "" ,
                  image   : "none!" ,
                  from    : "http://gilde.com/team/investment-team" ,
              } );
            } );
            return results;
          } );
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

function gildehealthcare ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://gildehealthcare.com/team/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "article.mix.mix_all.col-xs-6.col-sm-4" );;
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h2' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'p' )  .text ( )  .replace ( '(' , '' ). replace ( ')', '' ) . trim ( ) ,
                  //market  : "" ,
                  image   : $ ( item ) .find ( 'figure.team_image.lazy' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://gildehealthcare.com/team/" ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      return resolve ( urls );
    } catch ( e ) {
      return reject ( e );
    }
  })
}/*some images not loading*/

function gimv ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://www.gimv.com/en/team" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.gimv-team--item" );;
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'span.gimv-team-teaser--name > span' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'div.field__item' )  .text ( )  .replace ( '\n' , '' ) .trim ( ) .split ( '\n' ) [ 0 ] ,
                  market  : $ ( item ) .find ( 'div.field__item' )  .text ( )  .replace ( '\n' , '' ) .trim ( ) .split ( '\n' ) [ 1 ] .trim ( ) ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://www.gimv.com/en/team" ,
              } );
            } );
            return results;
          } );
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

function healthinnovations ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://www.healthinnovations.nl/nl/het-team" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.col.sqs-col-6.span-6" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h3 > a ' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( "div.sqs-block-content > h1" )  .text ( ) ,
                  //market  : $ ( item ) .find ( 'div.field__item' )  .text ( )  .replace ( '\n' , '' ) .trim ( ) .split ( '\n' ) [ 1 ] .trim ( ) ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://www.healthinnovations.nl/nl/het-team" ,
              } );
            } );
            return results;
          } );
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

function healthinvestmentpartners ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://www.healthinvestmentpartners.nl/over-ons" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.mc1:has(h4.font_8 > span.color_15 > span)" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h1.font_0,h3.font_0 > span.color_15' ) .text ( )  ,
                  job     : $ ( item ) .find ( "h4.font_8 > span.color_15 > span" )  .text ( ) ,
                  //market  : $ ( item ) .find ( 'div.field__item' )  .text ( )  .replace ( '\n' , '' ) .trim ( ) .split ( '\n' ) [ 1 ] .trim ( ) ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://www.healthinvestmentpartners.nl/over-ons" ,
              } );
            } );
            return results;
          } );
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

function hollandcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://hollandcapital.nl/ons-team/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.et_pb_column.et_pb_column_1_3" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h1' ) .text ( )  ,
                  job     : $ ( item ) .find ( 'div.et_pb_text_inner > h2' ) .text ( ) || 'Advisor' ,
                  //market  : $ ( item ) .find ( 'div.field__item' )  .text ( )  .replace ( '\n' , '' ) .trim ( ) .split ( '\n' ) [ 1 ] .trim ( ) ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://hollandcapital.nl/ons-team/" ,
              } );
            } );
            return results;
          } );
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

function horizonflevoland ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://www.horizonflevoland.nl/wij" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "li:has(.col12.m-b-lg > h3)" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( '.col12.m-b-lg > h3' ) .text ( )  ,
                  job     : $ ( item ) .find ( 'p.small:first' ) .text ( ) || 'Advisor' ,
                  //market  : $ ( item ) .find ( 'div.field__item' )  .text ( )  .replace ( '\n' , '' ) .trim ( ) .split ( '\n' ) [ 1 ] .trim ( ) ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://www.horizonflevoland.nl/wij" ,
              } );
            } );
            return results;
          } );
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

function hpegrowth ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser.newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      let urls = [ ];
      //specific to website
      {
        await page  .goto ( "https://hpegrowth.com/about-us/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "article.team-card" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.caption > div > h5' ) .text ( )  ,
                  job     : $ ( item ) .find ( 'div.caption > div > span' ) .text ( ) ,
                  //market  : $ ( item ) .find ( 'div.field__item' )  .text ( )  .replace ( '\n' , '' ) .trim ( ) .split ( '\n' ) [ 1 ] .trim ( ) ,
                  image   : $ ( item ) .find ( 'div.image' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://hpegrowth.com/about-us/" ,
              } );
            } );
            return results;
          } );
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

function ibsca ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( "div.teaser-person.hentry.vcard.hover" );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2.fn' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'div.function' ) .text ( ) ,
                      market  : $ ( item ) .find ( 'div.department-labels' )  .text ( ) .replace ( '\n' , '' ) .trim ( ) ,
                      image   : $ ( item ) .find ( 'img.photo' ) .prop ( 'src' ) ,
                      from    : "https://ibsca.nl/team/" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://ibsca.nl/team/` , `https://ibsca.nl/team/page/2` , `https://ibsca.nl/team/page/3` ];

      let datas = //await crawlUrl ( `http://www.bridgepoint.eu/en/our-team/?&page=0` );
                  await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function innovationquarter ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( "figure.av-inner-masonry.main_color" );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3.av-masonry-entry-title.entry-title' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'span.member-role' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'div.department-labels' )  .text ( ) .replace ( '\n' , '' ) .trim ( ) ,
                      image   : $ ( item ) .find ( 'div.av-masonry-image-container' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : "https://www.innovationquarter.nl/ons-team/" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.innovationquarter.nl/ons-team/` ];

      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function karmijnkapitaal ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( "div.personlist > div.person" );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.name' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'div.function' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'div.department-labels' )  .text ( ) .replace ( '\n' , '' ) .trim ( ) ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : "http://www.karmijnkapitaal.nl/25-over-ons.html" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.karmijnkapitaal.nl/25-over-ons.html` ];

      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function kkr ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div:has(p.name-employee)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 0 ] ,
                      job     : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 1 ] ,
                      market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : "https://www.kkr.com/our-firm/team" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.kkr.com/our-firm/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function llcp ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col.span_6_of_12.team-member' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2') .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) || "None",
                      from    : "https://www.llcp.com/about/our-team" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.llcp.com/about/our-team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function liof ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.medewerker' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'span.medewerker__naam') .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'span.medewerker__functie' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) || "None",
                      from    : "https://liof.nl/over-liof/contact" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://liof.nl/over-liof/contact` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function lspvc ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.container.site > div.content.team > div.item-info.overview > div.items' ) .children ( ) .filter( ":has(a)" );
                Array.from ( items ) .forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'a' ) .html ( ) .replace ( '<br>' , ' ' ) .trim ( ) ,
                      //index     : index  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) || "None",
                      from    : "https://www.lspvc.com/team.html" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.lspvc.com/team.html` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function main ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-person' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.team-name') .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'div.team-job' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'div.team-image' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : "https://main.nl/team/" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://main.nl/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function mgf ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_row:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2') .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p > em' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( "src" ) ,
                      from    : "https://www.mgf.nl/ons-team/" ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.mgf.nl/ons-team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function menthacapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , waitUntil: 'networkidle2' } );
              //await page .addScriptTag ( { path: 'jquery.js'  } );
              //await autoScroll ( page );
              let items = await page .$$ ( 'div.ratio_1-1 > div.w-portfolio-list > div.portfoliorow > div.w-portfolio-item > a.w-portfolio-item-anchor' );
              var index = 0;
              for ( item of Array.from ( items ) ) {
                await item .focus (  );
                await item .click (  );
                await page .waitFor ( 1000 );
                results.push ( await page.evaluate ( ( url , index ) => {
                  let item_ = document.querySelector ( 'div.w-portfolio-item.active' );
                  let data = {
                        name    : item_ .querySelector ( 'div.one-half51 > p') .innerText .split ( '–' ) [ 0 ] ,
                        job     : item_ .querySelector ( 'p > em' ) .innerText ,
                        image   : item_ .querySelector ( 'img' ) .src ,
                        from    : url ,
                        index   : index ,
                    };
                    return data;
                  } , url , index ++ )
                );
              }
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.menthacapital.com/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function nom ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.card.card--employee' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'span.is-label.is-label--green' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'div.image' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.nom.nl/over-ons/het-team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function navitascapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'section.row.normal:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'span.mediumtitel' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'p > strong' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.navitascapital.nl/het-team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function shiftinvest ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.memberbox-inner:has(div.membertitle)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.membername' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'div.membertitle' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://shiftinvest.com/nbi-investors/#contentbox` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function zlto ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.personContent' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'div.slideHidden' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.zlto.nl/wieiswie` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function newion ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.member.clearfix' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'strong' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) .split ( '\n' ) [ 1 ] ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.newion.com/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function nordian ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'li.team-overview-list-item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.nordian.nl/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function npm_capital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.all-33.large-33.medium-50.small-50.tiny-100.push-left' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.npm-capital.com/nl/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function oostnl ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.packery-item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.views-field.views-field-nothing' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'div.views-field.views-field-field-function' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://oostnl.nl/nl/medewerkers` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function o2capital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.slick-guy.left' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'h3' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://o2capital.nl/over-ons/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function parcomcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-md-3.col-sm-3' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h5' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p.title' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.parcomcapital.com/about/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function plainvanilla ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      let urls = [  ];
      const page = await browser .newPage ( );
      await page .goto ( `https://plainvanilla.nl/team/` , { timeout: 0 } );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      //await autoScroll ( page );
      urls = await page.evaluate ( ( ) => {
        let links = [ ];
        let items = document .querySelectorAll ( 'div.vc_gitem-zone-b > a.vc_gitem-link.vc-zone-link' );
        Array.from ( items ).forEach ( ( item  , index ) => {
          links.push ( item .href );
        } );
        return links;
      } );
      await page.close ( );

      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                //Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( 'div.wpb_wrapper > h1' ) .first ( ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( 'div.wpb_wrapper > h2' ) .first ( ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( 'div.vc_single_image-wrapper.vc_box_rounded.vc_box_border_grey > img' ) .first ( ) .prop ( 'src' ) ,
                      from    : url ,
                      //index   : index ,
                  } );
              //  }  );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }

      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function pridecapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'a.team-item' ) .filter ( ':has(p > strong)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p > strong' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( '\n' ) [ 2 ] .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://pridecapital.nl/over-ons/#team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function primeventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              //await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.row.fullheight' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.inner > h2' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'div.inner > h3' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'div.bg-image.left.parallax' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.primeventures.com/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function raboprivateequity ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              //await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-alt-item.active' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.title' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'div.subtitle' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img.team-alt-image' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://raboprivateequity.com/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function riversideeurope ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      let urls = [ ];
      const page = await browser .newPage ( );
      await page .goto ( 'http://www.riversideeurope.com/Team.aspx' , { timeout: 0 } );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      //await autoScroll ( page );
      urls = await page.evaluate ( ( ) => {
        let links = [ ];
        let items = document .querySelectorAll ( 'ul.alphabet.clearthis > li > a' );
        Array.from ( items ).forEach ( ( item  , index ) => {
          links.push ( item .href );
        } );
        return links;
      } );
      await page.close ( );

      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'ul.listMembers' ) .children (  );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'a + a' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( '\n' ) [ 7 ] .trim ( )  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                }  );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }

      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function setventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.gw-gopf-post:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'b' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'a:not(b)' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( ' - ' ) [ 1 ] .slice ( 0 , 45 ) .trim ( ) + "... "  ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.setventures.com/#Team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function smile_invest ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.vc_column-inner:has(h3 > a)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3 > a' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://smile-invest.com/team-3/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function startgreen ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'tbody > tr > td:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'strong' ) .text ( )  ,
                      job     : $ ( item ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( '\n' ) [ 3 ] .trim ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.startgreen.nl/nl/overons/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function seaminvestments ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.seam-team-column.vc_column_container.col-md-6.appear-animation.fadeIn.appear-animation-visible' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2' ) .html ( ) .split ( '<br>' ) [ 0 ]   ,
                      job     : $ ( item ) .find ( 'h2' ) .html ( ) .split ( '<br>' ) [ 1 ]   ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://seaminvestments.nl/#team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function strongrootcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.teamBlocks.content >  div.block.js-revealMe.js-revealed' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )   ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.strongrootcapital.nl/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function thujacapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.intrinsic' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .text ( )   ,
                      job     : $ ('li.active-link') .text ( )   ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.thujacapital.com/new-page-3` , `https://www.thujacapital.com/partners` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function tiincapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.wf-cell.shown' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.team-author-name' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )   ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://tiincapital.nl/over-ons/het-team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function synergia ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-lid' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'span.name' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'span.function' ) .text ( )   ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.synergia.nl/nl/over-synergia#richard-verkleij_3` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function torqxcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'div.hover-info.hidden-xs > h3' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'div.hover-info.hidden-xs > h4' ) .text ( )   ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.torqxcapital.com/about-us/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function vepartners ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team_item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h3.title' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'h2.subtitle' ) .text ( )   ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'div.image.equal_team' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://vepartners.com/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function vendiscapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-member' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .text ( ) .split ( '\n' ) [ 0 ] ,
                      job     : $ ( item ) .find ( 'em' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.vendiscapital.com/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function victusparticipations ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_column.et_pb_column_1_4.et_pb_css_mix_blend_mode_passthrough:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h4' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p.et_pb_member_position' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://victusparticipations.com/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function vortexcp ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team__item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h4.team-member__name' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p.team-member__function' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://vortexcp.com/about/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function transequity ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_column.et_pb_column_1_3.et_pb_css_mix_blend_mode_passthrough:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h4.et_pb_module_header' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p.et_pb_member_position' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://transequity.nl/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function wadinko ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'address.employee.employee--archive.flex.line-margin' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h3' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'span' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.wadinko.nl/medewerkers/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function waterland ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.fusion-column-wrapper:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h2.title-heading-center' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.waterland.nu/nl/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function vpcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.so-widget-intracto-image-text-widget' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h3' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'span' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://vpcapital.eu/over-ons/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function impulszeeland ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-lg-6' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h3.h4.card-title' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'h4.h6.card-subtitle' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.impulszeeland.nl/nl/over/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function wmp ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div#u68925 > div.popup_anchor > div.Thumb.popup_element.clearfix:has(div.museBGSize.colelem)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  let id = $ ( item ) .attr ( 'aria-controls' );
                  results.push ( {
                      name    : $ ( `#${id}` ) .find ( 'p' ) .eq ( 0 ) .text ( ) ,
                      job     : $ ( `#${id}` ) .find ( 'p' ) .eq ( 3 ) .text ( )  .trim ( ) || $ ( `#${id}` ) .find ( 'p' ) .eq ( 4 ) .text ( ) .slice ( 0 , 45  ) + "..." ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'div.museBGSize.colelem' ) .css ( 'background-image' ) .slice ( 4 , -1 ) .replace ( /"/g , ''  ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.wmp.nl/team_wmp.html` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function keadyn ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-md-3.masonry-brick' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'strong' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( ) .replace ( '\n' , '' ) .trim (  )  .slice ( 0 , 55 ) + "...",
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.keadyn.com/heroes` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function uniiq ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.member' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'li.bold' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'li.bold + li' ) .text ( ) .replace ( '\n' , '' ) .trim (  ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://uniiq.nl/#hetteam` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function nascentventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_module.et_pb_team_member' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h4' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( ) .trim (  ) .trim (  )  .slice ( 0 , 55 ) + "...",
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://nascentventures.nl/who-we-are/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function mkbfondsen_flevoland ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.member' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h3' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p.function' ) .text ( ) .trim (  ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.mkbfondsen-flevoland.nl/organisatie/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function vectrix ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-sm-6.col-md-4' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'div.name' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : $ ( item ) .find ( 'div.smallDescription' ) .text ( ) .trim (  ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'div.img' ) .css ( 'background-image' ) .slice ( 4 , -1 ) .replace ( /"/g , ''  ),
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.vectrix.nl/over-ons/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function aglaia_oncology ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.Grid.Grid--5col.Team.Clear > div.Grid__col:has(div.TeamItem__name)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'div.TeamItem__name' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : $ ( item ) .find ( 'div.TeamItem__function' ) .text ( ) .trim (  ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );

                let advicser_items = $ ( 'div.Grid__col > table.responsive > tbody > tr > td > p:has(strong)' );
                Array.from ( advicser_items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'strong' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : $ ( item ) .text ( ) .slice ( 0 , 45 ) .trim (  ) + "...",
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      //image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://aglaia-oncology.com/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

/*function sbicparticipations ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-sm-6.col-md-4' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'div.name' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : $ ( item ) .find ( 'div.smallDescription' ) .text ( ) .trim (  ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'div.img' ) .css ( 'background-image' ) .slice ( 4 , -1 ) .replace ( /"/g , ''  ),
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.sbicparticipations.com/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}*/

function hollandstartup ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-md-3.col-sm-6.col-xs-12.service-box' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h3' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : $ ( item ) .find ( 'div.service.animated.fadeInUp.visible > p + p' ) .text ( ) .trim (  ) .slice ( 0 , 45 ) + "..." ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.hollandstartup.com/index.php/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function thenextwomen ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.column.mcb-column.column_our_team ' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'h4' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : $ ( item ) .find ( 'p.subtitle' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.thenextwomen.com/about-us/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function liof ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.com_contact_wrap.clearfix' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'strong' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) || $ ( item ) .find ( 'b' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : "investment manager" , //$ ( item ) .find ( 'a' ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.liof.com/en/Contact` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function bfly ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'td.wsite-multicol-col:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'strong' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      job     : "co-founders of WoodWing Software and seasoned software entrepreneur" , //$ ( item ) .find ( 'a' ) .text ( ) , ""
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( 'div.wsite-section.wsite-body-section.wsite-section-bg-image.wsite-background-8.wsite-custom-background' ) .first (  ) . css ( 'background-image' ) .slice (  4 , -1 ) .replace ( /"/g , ''  ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.bfly.vc/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function voccp ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'ul.slides:has(div.content-box > h2)' ) .children ( );
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.content-box > h2' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.content-box > h4' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.voccp.com/english/#team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function blckprty ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'div.team-member.bounce-up' ) ;
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.role > p' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://blckprty.com/#team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function vcxc ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'div.member.hover' ) ;
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'em' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.vcxc.com/en/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function bom ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'article.employee.employee--overview' ) ;
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h1' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p.employee__role' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      market  : $ ( item ) .find ( 'p.employee__departments' ) .text ( ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.bom.nl/over-bom/medewerkers` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

//http://www.zeeuwsinvesteringsfonds.com/about-us.html    ---->>  116

function dsif ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div.e1305-11 > div.x-column.x-sm.x-1-3' ) ;
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.x-text' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.x-text + div.x-text + div.x-text' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );

                items = $ ( 'div.e1305-27 > div.e1305-38' ) .children ( );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p' ) .eq ( 1 ) .text ( ) .trim (  )  ,
                      image   : $ ( 'div.e1305-27 > div.e1305-31' )  .children ( ) .eq ( index ) .find ( 'span > img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );

                items = $ ( 'div.slick-track' ) .children ( );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : 'Investment committee'  ,
                      image   : $ ( item ) .find ( 'figure > img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.dsif.nl/our-team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function brooklyn_ventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font', 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'div.col.sqs-col-4.span-4' ) ;
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'strong' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.brooklyn-ventures.com/testimonials` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function biogenerationventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true , } );
      let urls = [  ];
      const page = await browser .newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      await page .goto ( `https://www.biogenerationventures.com/team/` , { timeout : 0 , } );
      await page .addScriptTag ( { path: 'jquery.js'  } );
      await autoScroll ( page );
      urls = await page.evaluate ( ( url ) => {
        let items = $ ( 'div.et_pb_portfolio_grid_items' ) .children ( ) ;
        let href = [ ];
        Array.from ( items ).forEach ( ( item  , index ) => {
          href.push ( $ ( item ) .find ( 'a' ) .attr ( 'href' ) );
        } );
        return href;
      } );
      await page.close ( );
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                results.push ( {
                  name    : $ ( 'div.et_pb_text_inner > h1' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                  job     : $ ( 'div.et_pb_text_inner > h4' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                  image   : $ ( 'span.et_pb_image_wrap > img' ) .first (  ) .prop ( 'src' ) ,
                  from    : url ,
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let datas = await Promise .all ( [ ...urls .map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}/*taking more than 30 secs*/

function socialimpactventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'section.teamsection' ) .children ( ) ;
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .eq ( 1 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p' ) .eq ( 2 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.socialimpactventures.nl/about-us` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function henq ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div.vc_column-inner:has(img)' ) .children ( ) ;
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'span' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://henq.vc/about/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function volta ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div.third.columns.no-float.s-repeatable-item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p' ) .eq ( 1 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.volta.ventures/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function slingshot ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div.vc_grid-item.vc_clearfix.vc_col-sm-3.vc_grid-item-zone-c-bottom.vc_visible-item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h5' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p' ) .eq ( 1 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.slingshot.ventures/#team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function shiftinvest ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div.fourcol.memberbox:has(p.membertitle)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p.membername' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p.membertitle' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://shiftinvest.com/about-us` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function peak ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div#Equal_heights' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'h4' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://peak.capital/info/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function capitalmills ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'figure.av-inner-masonry.main_color' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.av-masonry-entry-content.entry-content' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.capitalmills.nl/team-cmi/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function mainportinnovationfund ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div.lefty_fundmanagers' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.fundmanager' ) .eq ( 0 ) .text ( ) .split ( '.' ) [ 0 ] .replace ( '–' , '-'  ) .split ( '-' ) [ 0 ] .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.fundmanager' ) .eq ( 0 ) .text ( ) .split ( '.' ) [ 0 ] .replace ( '–' , '-'  ) .split ( '-' ) [ 1 ] .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );

                items = $ ( 'ul.da-thumbs' ) .children ( );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'span' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'span > p' ) .eq ( 1 ) .text ( ) .split ( '.' ) [ 0 ] .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.mainportinnovationfund.nl/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function investion ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];

                let items = $ ( 'div.about-teammember-env.w-col.w-col-4' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h5' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'h6' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.investion.net/about-us` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function inkefcapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.member-box' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'span.name' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'span.job-title' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'div.member-picture' ) .css ( 'background-image' ) .slice ( 4 , -1 )  .replace ( /"/g , '' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.inkefcapital.com/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function icoscapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      const page = await browser .newPage ( );
      await page.setRequestInterception ( true );
      page.on ( 'request' , ( request ) => {
        if (  [ 'font' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
            request .abort ( );
        } else {
            request .continue  ( );
        }
      } );
      await page .goto ( `http://www.icoscapital.com/team-2/` , { timeout : 0 , waitUntill : 'networkidle2' } );
      await page .addScriptTag ( { path: 'jquery.js'  } );
      await autoScroll ( page );
      let urls = await page.evaluate ( (  ) => {
        let href = [ ];
        let items = $ ( 'div.czr-wp-the-content > p > a' );
        Array.from ( items ).forEach ( ( item  , index ) => {
          href.push ( $ ( item ) .attr ( 'href' ) );
        } );
        return href;
      } );
      await page.close ( );
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let element = $ ( 'div.czr-wp-the-content' );

                let credentials = $ ( element ) .find ( 'h4' ) .eq ( 0 ) .text ( ) .replace ( /[\n]/g , ',' )  .trim (  ) .split ( ',' );
                if ( ! credentials .join ( ) )
                    credentials = $ ( element ) .find ( 'h4' ) .eq ( 2 ) .text ( ) .replace ( /[\n]/g , ',' )  .trim (  ) .split ( ',' );
                if ( ! credentials .join ( ) )
                    credentials  = $ ( element ) .find ( 'p' ) .eq ( 0 ) .text ( ) .replace ( /[\n]/g , ',' )  .trim (  ) .split ( ',' );

                results.push ( {
                    name    :  credentials .shift (  ),
                    job     : credentials .join ( ) ,
                    image   :  $ ( element ) .find ( 'a > img' ) .eq ( 0 ) .prop ( 'src' ) ,
                    from    : url ,
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let datas = await Promise.all ( [  ...urls . map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}/*taking too long to load*/

function ogc_partners ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                results.push ( {
                    name    : $ ( 'div#comp-jg6fvxqn > h2.font_2 > span.color_12' ) .eq ( 0 ) .text (  )  ,
                    job     : "co-founder and Partner" ,
                    image   : $ ( 'img#comp-jg6fvxqeimgimage' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                } );
                results.push ( {
                    name    : $ ( 'div#comp-jg6fvxqv > h2.font_2 > span.color_12' ) .eq ( 0 ) .text (  )  ,
                    job     : "co-founder and Partner" ,
                    image   : $ ( 'img#comp-jg6fvxr3imgimage' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.ogc-partners.com/about-1` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function investinfuture ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.wpb_column.vc_column_container.vc_col-sm-4' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3.caption.no_icon' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'h5' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://investinfuture.nl/en/about-iif/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function otterlooventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                results.push ( {
                    name    : "Sieuwert van Otterloo"  ,
                    job     : "Founder" ,
                    image   : $ ( 'img.alignleft' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.otterlooventures.nl/over-ov/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function solidventures ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.mc1container:has(h3.font_0 > span.color_15)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3.font_0 > span.color_15' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p.font_8' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.solidventures.nl/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function doen ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.card.card--person' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'strong' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.meta' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.doen.nl/about-doen/the-doen-team.htm` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function endeit ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-slide' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.bio-title' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.bio-function' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://endeit.com/#team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function keenventurepartners ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.employee' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.name' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.function' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : window.location.origin + $ ( item ) .find ( 'source' ) .prop ( 'srcset' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.keenventurepartners.com/#our-people` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

/*function filsa ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                results.push ( {
                    name    : $ ( 'div#comp-jg6fvxqn > h2.font_2 > span.color_12' ) .eq ( 0 ) .text (  )  ,
                    job     : "co-founder and Partner" ,
                    image   : $ ( 'img#comp-jg6fvxqeimgimage' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                } );
                results.push ( {
                    name    : $ ( 'div#comp-jg6fvxqv > h2.font_2 > span.color_12' ) .eq ( 0 ) .text (  )  ,
                    job     : "co-founder and Partner" ,
                    image   : $ ( 'img#comp-jg6fvxr3imgimage' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://filsa.nl/over-ons/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}*/

function catenainvestments ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_column.et_pb_column_1_2' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4.et_pb_module_header' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p.et_pb_member_position' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.catenainvestments.com/investment-team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function anterracapital ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col.sqs-col-4.span-4:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p' ) .eq ( 1 ) .text ( ) .trim (  )  ,
                      market  : $ ( item ) .find ( 'p' ) .eq ( 2 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.anterracapital.com/team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function walvis ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'span.tab__link.tab__col ' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4.team__name' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p.team__job' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.walvis.com/walvis-participaties/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function percivalparticipations ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'article.box-person' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p' ) .eq ( 1 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://percivalparticipations.com/team.php` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function o2investment ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-md-4' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4' ) .eq ( 1 ) .html ( ) .split ( '<br>' ) [ 0 ] .trim (  )  ,
                      job     : $ ( item ) .find ( 'h4' ) .eq ( 1 ) .html ( ) .split ( '<br>' ) [ 1 ] .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://o2investment.com/our-team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function cleverclover ( ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' ,'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.awsm-grid-list.awsm-grid-card' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .eq ( 0 ) .text ( )  .trim (  )  ,
                      job     : $ ( item ) .find ( 'span' ) .eq ( 0 ) .text ( )  .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://cleverclover.vc/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

//biogenerationventures ( ) .then ( console.log ) .catch ( console.error );

app.get ( '/*' , function ( req , res ) {
  res.sendFile ( path.join ( __dirname , 'build' , 'index.html' ) );
});

//app.listen ( port );

io .on ( "connection" , socket => {
  var address = socket.handshake.address;
  console.log ( 'New connection from ' + address + ':' + address.port );
  console.log ( socket.handshake.headers );
  console.log ( geoip .lookup ( '105.231.165.203' ) ); //


  socket .on ( "1" , function ( data ) {
    console.log ( data );
    run3i ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "2" , function ( data ) {
    console.log ( data );
    runaacc ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "3" , function ( data ) {
    console.log ( data );
    run5sq ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "4" , function ( data ) {
    console.log ( data );
    runactivecapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "5" , function ( data ) {
    console.log ( data );
    runadventinternational ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "6" , function ( data ) {
    console.log ( data );
    runalpinvest ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "7" , function ( data ) {
    console.log ( data );
    runantea ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "8" , function ( data ) {
    console.log ( data );
    runbaincapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "9" , function ( data ) {
    console.log ( data );
    runbbcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "10" , function ( data ) {
    console.log ( data );
    runavedoncapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "11" , function ( data ) {
    console.log ( data );
    runbolsterinvestments ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "12" , function ( data ) {
    console.log ( data );
    runbridgepoint ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "13" , function ( data ) {
    console.log ( data );
    runbrightlandsventurepartners ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "14" , function ( data ) {
    console.log ( data );
    runcapitalapartners ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "15" , function ( data ) {
    console.log ( data );
    runcinven ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "16" , function ( data ) {
    console.log ( data );
    committedcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "17" , function ( data ) {
    console.log ( data );
    cottonwood ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "18" , function ( data ) {
    console.log ( data );
    cvc ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "19" , function ( data ) {
    console.log ( data );
    dehogedennencapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "20" , function ( data ) {
    console.log ( data );
    delftenterprises ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "21" , function ( data ) {
    console.log ( data );
    ecart ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "22" , function ( data ) {
    console.log ( data );
    egeria ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "23" , function ( data ) {
    console.log ( data );
    eqtpartners ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "24" , function ( data ) {
    console.log ( data );
    forbion ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "25" , function ( data ) {
    console.log ( data );
    gembenelux ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "26" , function ( data ) {
    console.log ( data );
    gilde ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "27" , function ( data ) {
    console.log ( data );
    gildehealthcare ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "28" , function ( data ) {
    console.log ( data );
    gimv ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "29" , function ( data ) {
    console.log ( data );
    healthinnovations ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "30" , function ( data ) {
    console.log ( data );
    healthinvestmentpartners ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "31" , function ( data ) {
    console.log ( data );
    hollandcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "32" , function ( data ) {
    console.log ( data );
    horizonflevoland ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "33" , function ( data ) {
    console.log ( data );
    hpegrowth ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "34" , function ( data ) {
    console.log ( data );
    ibsca ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "35" , function ( data ) {
    console.log ( data );
    innovationquarter ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "36" , function ( data ) {
    console.log ( data );
    karmijnkapitaal ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "37" , function ( data ) {
    console.log ( data );
    kkr ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "38" , function ( data ) {
    console.log ( data );
    llcp ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "39" , function ( data ) {
    console.log ( data );
    liof ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "40" , function ( data ) {
    console.log ( data );
    lspvc ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "41" , function ( data ) {
    console.log ( data );
    main ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "42" , function ( data ) {
    console.log ( data );
    mgf ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "43" , function ( data ) {
    console.log ( data );
    menthacapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "44" , function ( data ) {
    console.log ( data );
    nom ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "45" , function ( data ) {
    console.log ( data );
    navitascapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "46" , function ( data ) {
    console.log ( data );
    shiftinvest ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "47" , function ( data ) {
    console.log ( data );
    zlto ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "48" , function ( data ) {
    console.log ( data );
    newion ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "49" , function ( data ) {
    console.log ( data );
    nordian ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "50" , function ( data ) {
    console.log ( data );
    npm_capital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "51" , function ( data ) {
    console.log ( data );
    oostnl ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "52" , function ( data ) {
    console.log ( data );
    o2capital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "53" , function ( data ) {
    console.log ( data );
    parcomcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "54" , function ( data ) {
    console.log ( data );
    plainvanilla ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "55" , function ( data ) {
    console.log ( data );
    pridecapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "56" , function ( data ) {
    console.log ( data );
    primeventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "57" , function ( data ) {
    console.log ( data );
    raboprivateequity ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "58" , function ( data ) {
    console.log ( data );
    riversideeurope ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "59" , function ( data ) {
    console.log ( data );
    setventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "60" , function ( data ) {
    console.log ( data );
    smile_invest ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "61" , function ( data ) {
    console.log ( data );
    startgreen ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "62" , function ( data ) {
    console.log ( data );
    seaminvestments ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "63" , function ( data ) {
    console.log ( data );
    strongrootcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "64" , function ( data ) {
    console.log ( data );
    thujacapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "65" , function ( data ) {
    console.log ( data );
    tiincapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "66" , function ( data ) {
    console.log ( data );
    synergia ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "67" , function ( data ) {
    console.log ( data );
    torqxcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "68" , function ( data ) {
    console.log ( data );
    vepartners ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "69" , function ( data ) {
    console.log ( data );
    vendiscapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "70" , function ( data ) {
    console.log ( data );
    victusparticipations ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "71" , function ( data ) {
    console.log ( data );
    vortexcp ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "72" , function ( data ) {
    console.log ( data );
    transequity ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "73" , function ( data ) {
    console.log ( data );
    wadinko ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "74" , function ( data ) {
    console.log ( data );
    waterland ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "75" , function ( data ) {
    console.log ( data );
    vpcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "76" , function ( data ) {
    console.log ( data );
    impulszeeland ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "77" , function ( data ) {
    console.log ( data );
    wmp ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "78" , function ( data ) {
    console.log ( data );
    keadyn ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "79" , function ( data ) {
    console.log ( data );
    uniiq ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "80" , function ( data ) {
    console.log ( data );
    nascentventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "81" , function ( data ) {
    console.log ( data );
    mkbfondsen_flevoland ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "82" , function ( data ) {
    console.log ( data );
    vectrix ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "83" , function ( data ) {
    console.log ( data );

    aglaia_oncology ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  /*socket .on ( "84" , function ( data ) {
    sbicparticipations ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );*/

  socket .on ( "85" , function ( data ) {
    console.log ( data );
    hollandstartup ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "86" , function ( data ) {
    console.log ( data );
    thenextwomen ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "87" , function ( data ) {
    console.log ( data );
    liof ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  /*socket .on ( "88" , function ( data ) {
    bfly ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );*/

  socket .on ( "89" , function ( data ) {
    console.log ( data );

    voccp ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "90" , function ( data ) {
    console.log ( data );
    blckprty ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "91" , function ( data ) {
    console.log ( data );
    vcxc ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "92" , function ( data ) {
    console.log ( data );
    bom ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "93" , function ( data ) {
    console.log ( data );
    dsif ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "94" , function ( data ) {
    console.log ( data );
    brooklyn_ventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  /*socket .on ( "95" , function ( data ) {
    console.log ( data );
    biogenerationventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );*/

  socket .on ( "96" , function ( data ) {
    console.log ( data );
    socialimpactventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "97" , function ( data ) {
    console.log ( data );
    henq ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "98" , function ( data ) {
    console.log ( data );
    volta ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "99" , function ( data ) {
    console.log ( data );
    slingshot ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "100" , function ( data ) {
    console.log ( data );
    shiftinvest ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "101" , function ( data ) {
    console.log ( data );
    peak ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "102" , function ( data ) {
    console.log ( data );
    capitalmills ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "103" , function ( data ) {
    console.log ( data );
    mainportinnovationfund ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "104" , function ( data ) {
    console.log ( data );
    investion ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "105" , function ( data ) {
    console.log ( data );
    inkefcapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "106" , function ( data ) {
    console.log ( data );
    icoscapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "107" , function ( data ) {
    console.log ( data );
    ogc_partners ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "108" , function ( data ) {
    console.log ( data );
    investinfuture ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "109" , function ( data ) {
    console.log ( data );
    otterlooventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "110" , function ( data ) {
    console.log ( data );
    solidventures ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "111" , function ( data ) {
    console.log ( data );
    doen ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "112" , function ( data ) {
    console.log ( data );
    endeit ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "113" , function ( data ) {
    console.log ( data );
    keenventurepartners ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "114" , function ( data ) {
    console.log ( data );
    filsa ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "115" , function ( data ) {
    console.log ( data );
    catenainvestments ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "116" , function ( data ) {
    console.log ( data );
    anterracapital ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "117" , function ( data ) {
    console.log ( data );
    walvis ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "118" , function ( data ) {
    console.log ( data );
    percivalparticipations ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "119" , function ( data ) {
    console.log ( data );
    o2investment ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "120" , function ( data ) {
    console.log ( data );
    cleverclover ( )
      .then ( results => socket .emit ( "outgoing data" , results ) )
        .catch ( console.error );
  } );

  socket .on ( "disconnect" , () => console.log ( "Client disconnected" ) );
});

server .listen ( port , () => console.log ( `Listening on port ${port}` ) );
