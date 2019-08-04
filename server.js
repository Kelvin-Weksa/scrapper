const express = require ( 'express' );
const favicon = require ( 'express-favicon' );
const path = require ( 'path' );
const puppeteer = require ( 'puppeteer' );
const port = process.env.PORT || 8080;
const app = express ( );

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
      //specific to website
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
        await page  .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              //await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              //await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              //await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
              await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
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
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: false } );
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
              //await page .addScriptTag ( { url: 'https://code.jquery.com/jquery-3.2.1.min.js'  } );
              await autoScroll ( page );
              let items = await page .$$ ( 'a.teammember' );
              var index = 0;
              for ( item of Array.from ( items ) ) {
                await item .focus (  );
                await item .click (  );
                await page .waitFor ( 1000 );
                results.push ( await page.evaluate ( ( url , index ) => {
                  let item_ = document.querySelector ( 'div.w-portfolio-item.active' );
                  let data = {
                        name    : item_ .querySelector ( 'span.name') .innerText ,
                        job     : item_ .querySelector ( 'span.function' ) .innerText ,
                        image   : item_ .querySelector ( 'div.image > img' ) .src ,
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
      let urls = [ `https://www.synergia.nl/nl/over-synergia#leo-schenk` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

synergia ( ) .then ( console.log ) .catch ( console.error );

app.get ( '/1' , function ( req , res ) {
  console.log ( "hi 1" );
  run3i ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/2' , function ( req , res ) {
  console.log ( "hi 2" );
  runaacc ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/3' , function ( req , res ) {
  console.log ( "hi 3" );
  run5sq ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/4' , function ( req , res ) {
  console.log ( "hi 4" );
  runactivecapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/5' , function ( req , res ) {
  console.log ( "hi 5" );
  runadventinternational ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/6' , function ( req , res ) {
  console.log ( "hi 6" );
  runalpinvest ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/7' , function ( req , res ) {
  console.log ( "hi 7" );
  runantea ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/8' , function ( req , res ) {
  console.log ( "hi 8" );
  runbaincapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/9' , function ( req , res ) {
  console.log ( "hi 9" );
  runbbcapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/10' , function ( req , res ) {
  console.log ( "hi 10" );
  runavedoncapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/11' , function ( req , res ) {
  console.log ( "hi 11" );
  runbolsterinvestments ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/12' , function ( req , res ) {
  console.log ( "hi 12" );
  runbridgepoint ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/13' , function ( req , res ) {
  console.log ( "hi 13" );
  runbrightlandsventurepartners ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/14' , function ( req , res ) {
  console.log ( "hi 14" );
  runcapitalapartners ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/15' , function ( req , res ) {
  console.log ( "hi 15" );
  runcinven ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/16' , function ( req , res ) {
  console.log ( "hi 16" );
  committedcapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/17' , function ( req , res ) {
  console.log ( "hi 17" );
  cottonwood ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/18' , function ( req , res ) {
  console.log ( "hi 18" );
  cvc ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/19' , function ( req , res ) {
  console.log ( "hi 19" );
  dehogedennencapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/20' , function ( req , res ) {
  console.log ( "hi 20" );
  delftenterprises ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/21' , function ( req , res ) {
  console.log ( "hi 21" );
  ecart ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/22' , function ( req , res ) {
  console.log ( "hi 22" );
  egeria ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/23' , function ( req , res ) {
  console.log ( "hi 23" );
  eqtpartners ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/24' , function ( req , res ) {
  console.log ( "hi 24" );
  forbion ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/25' , function ( req , res ) {
  console.log ( "hi 25" );
  gembenelux ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/26' , function ( req , res ) {
  console.log ( "hi 26" );
  gilde ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/27' , function ( req , res ) {
  console.log ( "hi 27" );
  gildehealthcare ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/28' , function ( req , res ) {
  console.log ( "hi 28" );
  gimv ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/29' , function ( req , res ) {
  console.log ( "hi 29" );
  healthinnovations ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/30' , function ( req , res ) {
  console.log ( "hi 30" );
  healthinvestmentpartners ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/31' , function ( req , res ) {
  console.log ( "hi 31" );
  hollandcapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/32' , function ( req , res ) {
  console.log ( "hi 32" );
  horizonflevoland ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/33' , function ( req , res ) {
  console.log ( "hi 33" );
  hpegrowth ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/34' , function ( req , res ) {
  console.log ( "hi 34" );
  ibsca ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/35' , function ( req , res ) {
  console.log ( "hi 35" );
  innovationquarter ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/36' , function ( req , res ) {
  console.log ( "hi 36" );
  karmijnkapitaal ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/37' , function ( req , res ) {
  console.log ( "hi 37" );
  kkr ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/38' , function ( req , res ) {
  console.log ( "hi 38" );
  llcp ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/39' , function ( req , res ) {
  console.log ( "hi 39" );
  liof ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/40' , function ( req , res ) {
  console.log ( "hi 40" );
  lspvc ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/41' , function ( req , res ) {
  console.log ( "hi 41" );
  main ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/42' , function ( req , res ) {
  console.log ( "hi 42" );
  mgf ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/43' , function ( req , res ) {
  console.log ( "hi 43" );
  menthacapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/44' , function ( req , res ) {
  console.log ( "hi 44" );
  nom ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/45' , function ( req , res ) {
  console.log ( "hi 45" );
  navitascapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/46' , function ( req , res ) {
  console.log ( "hi 46" );
  shiftinvest ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/47' , function ( req , res ) {
  console.log ( "hi 47" );
  zlto ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/48' , function ( req , res ) {
  console.log ( "hi 48" );
  newion ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/49' , function ( req , res ) {
  console.log ( "hi 49" );
  nordian ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/50' , function ( req , res ) {
  console.log ( "hi 50" );
  npm_capital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/51' , function ( req , res ) {
  console.log ( "hi 51" );
  oostnl ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/52' , function ( req , res ) {
  console.log ( "hi 52" );
  o2capital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/53' , function ( req , res ) {
  console.log ( "hi 53" );
  parcomcapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/54' , function ( req , res ) {
  console.log ( "hi 54" );
  plainvanilla ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/55' , function ( req , res ) {
  console.log ( "hi 55" );
  pridecapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/56' , function ( req , res ) {
  console.log ( "hi 56" );
  primeventures ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/57' , function ( req , res ) {
  console.log ( "hi 57" );
  raboprivateequity ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/58' , function ( req , res ) {
  console.log ( "hi 58" );
  riversideeurope ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/59' , function ( req , res ) {
  console.log ( "hi 59" );
  setventures ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/60' , function ( req , res ) {
  console.log ( "hi 60" );
  smile_invest ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/61' , function ( req , res ) {
  console.log ( "hi 61" );
  startgreen ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/62' , function ( req , res ) {
  console.log ( "hi 62" );
  seaminvestments ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/63' , function ( req , res ) {
  console.log ( "hi 63" );
  strongrootcapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/64' , function ( req , res ) {
  console.log ( "hi 64" );
  thujacapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/65' , function ( req , res ) {
  console.log ( "hi 65" );
  tiincapital ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/66' , function ( req , res ) {
  console.log ( "hi 66" );
  synergia ( ) .then ( results => res.json ( results ) ) .catch ( console.error );
});

app.get ( '/*' , function ( req , res ) {
  res.sendFile ( path.join ( __dirname , 'build' , 'index.html' ) );
});

app.listen ( port );
