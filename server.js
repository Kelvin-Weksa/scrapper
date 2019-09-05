const express = require ( 'express' );
const favicon = require ( 'express-favicon' );
const path = require ( 'path' );
const puppeteer = require ( 'puppeteer' );
const http = require  ( "http" );
const socketIo = require  ( "socket.io" );
var geoip = require('geoip-lite');

const port = process.env.PORT || 8080;

const app = express ( );
const server = http .createServer ( app );[   ]
const io = socketIo ( server );

app.use ( express.static ( __dirname ) );
app.use ( express.static ( path.join ( __dirname , 'build' ) ) );

async function autoScroll ( page , interval = 50 ){
    await page.evaluate ( async ( interval ) => {
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
            }, interval  );
        });
    } , interval);
}

let sleep = ms => new Promise ( resolve => setTimeout ( resolve , ms ) );

async function check_if_canceled( browser , monitor , socket  ){
  if ( monitor .cancel ){
    socket .emit ( "logs" , "operation has been canceled!" );
    console.log ( "operation has been canceled!" )
    await browser.close ( );
    monitor .confirm = true;
  }
};

function  paragraphs  ( array ) {
  let paragraph = '';
  array.forEach ( ( para ) =>{
    paragraph += para.innerText += '\n';
  } );
  return paragraph;
};

class AsyncArray /*extends Array*/ {
  constructor ( arr ) {
    this.data = arr; // In place of Array subclassing
  }

  filterAsync ( predicate ) {
     // Take a copy of the array, it might mutate by the time we've finished
    const data = Array.from ( this.data );
    // Transform all the elements into an array of promises using the predicate
    // as the promise
    return Promise.all ( data.map ( ( element , index) => predicate ( element , index , data ) ) )
    // Use the result of the promises to call the underlying sync filter function
      .then ( result => data.filter ( ( element , index ) => result [ index ] )  );
  }
}

function run3i ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      let urls = [ ];
      for ( i = 1; i < 9; i ++  )
        urls .push ( `https://www.3i.com/our-people/?page=${i}` );
      function crawlUrl ( url ) {
        return new Promise ( async ( resolve , reject ) => {
          try{
            await check_if_canceled ( browser , monitor , socket );
            const page = await browser.newPage ( );
            await page .setRequestInterception ( true );
            page .on ( 'request' , ( request ) => {
              if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                  request .abort ( );
              } else {
                  request .continue  ( );
              }
            } );
            await check_if_canceled ( browser , monitor , socket );
            await page.goto ( url , { timeout: 0 } );
            await autoScroll ( page );
            await check_if_canceled ( browser , monitor , socket );
            let items = await page.$$ ( 'div.item-container' );
            let rollingUrls = [];
            let index = 0
            for ( item of Array.from ( items ) ) {
              try {
                await check_if_canceled ( browser , monitor , socket );
                await item .click (  );
                rollingUrls.push ( await page.evaluate ( ( url , index ) => {
                  let item_ = document.querySelector ( 'li.portfolio-item.active' );
                  let fax = item_ .querySelector ( '.fax' );
                  let map = item_ .querySelector ( '.map > a' );
                  let data = {
                      name    : item_ .querySelector ( 'h5') .innerText .split ( '–' ) [ 0 ] ,
                      job     : item_ .querySelector ( '.area' ) .innerText ,
                      image   : item_ .querySelector ( 'img' ) .src ,
                      from    : url ,
                      index   : index ,
                      about   : item_ .querySelectorAll ( 'div.pure-u-1.pure-u-md-12-24' ) [ 0 ] .innerText ,
                      phone   : item_ .querySelector ( '.phone' ) .innerText ,
                      fax     : fax ? fax.innerText : "no fax",
                      map     : map ? map.href  : "no map",
                    };
                    return data;
                  } , url )
                );
              } catch ( e ) {
                console.log ( e )
                //return ( e )
              }
            }
            await page .close ( );
            await check_if_canceled ( browser , monitor , socket );
            socket .emit ( "outgoing data" , rollingUrls )
            socket .emit ( "logs" , url )
            return resolve ( rollingUrls );
          }catch ( e ){
            return reject ( e );
          }
        } )
      }
      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [  ...urls . map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      browser.close ( );
      monitor .confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
      //return resolve ( datas );
    } catch ( e ) {
      monitor .confirm = true;
      return reject ( e );
    }
  })
}

function runaacc ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page.goto ( "http://aaccapital.com/nl/team/" , { timeout: 0 } );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( (  ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.col-md-4.js-collapse.cardblock.team.multiple' );
            let items2 = Array.from ( items ) .map ( array => document .getElementById ( array .getAttribute ( "data-target" ) ) );
            function  paragraphs  ( array ) {
              let paragraph = '';
              array.forEach ( ( para ) =>{
                paragraph += para.innerText += '\n';
              } );
              return paragraph;
            }
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name      : item .querySelector ( 'h4' )  .innerText ,
                  job       : items2 [ index ]  .querySelector ( "h2 + h2" ).innerText ,
                  mail      : items2 [ index ]  .querySelector ( "span.mail-c" ).innerText ,
                  phone     : items2 [ index ]  .querySelector ( "span.phone-c" ).innerText ,
                  linkedIn  : items2 [ index ]  .querySelector ( "span.linkedin-c > a" ).href ,
                  about     : paragraphs ( items2 [ index ]  .querySelectorAll ( "div.col-lg-8 > p" ) ) ,
                  image     : item .querySelector ( 'img' ) .src ,
                  from      : "Live from http://aaccapital.com/nl/team/"
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      await check_if_canceled ( browser , monitor , socket );
      socket .emit ( "outgoing data" , urls )
      monitor .confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor .confirm = true;
      return reject ( e );
    }
  })
}

function run5sq ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( {
        args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] ,
      } );
      await check_if_canceled ( browser , monitor , socket );
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
      await check_if_canceled ( browser , monitor , socket );
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
            await check_if_canceled ( browser , monitor , socket );
            const page = await browser .newPage ( );
            await page.setRequestInterception ( true );
            page.on ( 'request' , ( request ) => {
              if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                  request .abort ( );
              } else {
                  request .continue  ( );
              }
            } );
            await check_if_canceled ( browser , monitor , socket );
            await page .goto ( url , { timeout: 0 } );
            await check_if_canceled ( browser , monitor , socket );
            const result = await page.evaluate  ( ( ) => {
              function  paragraphs  ( array ) {
                let paragraph = '';
                array.forEach ( ( para ) =>{
                  paragraph += para.innerText += '\n';
                } );
                return paragraph;
              }
              return {
                name      : document .querySelector ( 'span.underline' ) .innerText ,
                image     : document .querySelector ( 'div.title-box + img' ) .src ,
                job       : document .querySelector ( 'div.col-6 p' ) .innerText.trim ( ) || "ADVISOR" ,
                linkedIn  : document .querySelector ( 'ul.social > li > a' ) .href ,
                about     : paragraphs ( document .querySelectorAll ( 'div.col-6 > p' ) ) ,
              };
            } )
            await page.close ( );
            await check_if_canceled ( browser , monitor , socket );
            socket .emit ( "outgoing data" , [ result ] )
            return resolve ( result )
          }catch ( e ){
            return reject ( e )
          }
        } )
      };
      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [ ...urls.map ( crawlUrl ) ] ).catch ( e => { console.log ( e ) } );
      browser.close ( );
      monitor .confirm = true;
      return resolve ( datas );
    } catch ( e ) {
      monitor .confirm = true;
      return reject ( e );
    }
  })
}

function runactivecapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page.goto ( "http://www.activecapitalcompany.com/over-ons/team" , { timeout: 0 } );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document.querySelectorAll ( 'a.sbr' );
            Array.from ( items ).forEach ( async ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'span.field-title' )  .innerText ,
                  job     : item .querySelector ( 'span.field-extra_function' )  .innerText ,
                  image   : item .querySelector ( 'span.background' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "http://www.activecapitalcompany.com/over-ons/team" ,
                  about   : item.href
              } );
            } );
            return results;
          } );

          await page.close ()

          await Promise.all ( [ ...urls.map ( async ( item ) => {
            return new Promise ( async ( resolve , reject ) => {
              try{
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await page.goto ( item.about , { timeout: 0 } );
                await check_if_canceled ( browser , monitor , socket );
                item.about = await page.evaluate( (  )=>{
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.block1 > p' ) );
                } )
                await check_if_canceled ( browser , monitor , socket );
                socket .emit ( "outgoing data" , [ item ] )
                //await browser.close ( );
                return resolve ( item );
              }catch ( e ){
                return reject ( e );
              }
            } );
          } ) ] )
        }
      }
      //
      await browser.close ( );
      monitor .confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor .confirm = true;
      return reject ( e );
    }
  })
}

function runadventinternational ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless:true } );
      await check_if_canceled ( browser , monitor , socket );
      const page = await browser.newPage ( );
      //await page.setRequestInterception ( true );
      let urls = [ ];
      let resultz = [ ];
      //specific to website
      {
        let url = "https://www.adventinternational.com/team/";
        await check_if_canceled ( browser , monitor , socket );
        await page.goto ( "https://www.adventinternational.com/team/" , { timeout: 0 } );

        {
          await check_if_canceled ( browser , monitor , socket );
          let itemz = await page.$$ ( 'div.more.item.col-xs-6.col-sm-3.hide.member-item.js-team-member-container' );
          let load = await page.$ ( 'a.button.load-more' );
          await check_if_canceled ( browser , monitor , socket );
          while ( load ){
            try{
              load.focus ( );
              await page .waitFor ( 3000 );
              await load.click ( );
              load = await page.$ ( 'a.button.load-more' );
            }catch (e){
              console.log ( "we chat!" )
              break;
            }
          }
          var index = 0;
          for ( item of Array.from ( itemz ) ) {
            await check_if_canceled ( browser , monitor , socket );
            await item .focus (  );
            await item .click (  )
              .catch (  async ( e ) => {
                console.log ( e + "  ...retrying operation!!!!" )
                await sleep ( 500 );
                await item. click ( )
                .catch (  async ( e ) => {
                  console.log ( e + "  ...retrying operation!!!!" )
                  await sleep ( 500 );
                  await item. click ( );
                } );

              } );
            while ( ! await page .$ ( 'div.row.show-item > div.js-extra-info.extra-info > div.inner > h1' ) ){
              await sleep ( 500 );
              console.log ( itemz.length + 'polling...!' );
              check_if_canceled ( browser , monitor , socket );
            }
            await check_if_canceled ( browser , monitor , socket );
            let data = await page.evaluate ( ( url , index ) => {
              let it = document.querySelectorAll ( 'div.row.show-item > div.js-extra-info.extra-info > div.inner' );
              let item_ = it[it.length-1];
              //console.log ( item_ )
              let data = {
                    name    : item_ .querySelector ( 'h1') .innerText ,
                    job     : item_ .querySelector ( 'p' ) .innerText ,
                    image   : document.querySelector ( 'div.row.show-item > div.member-item.selected > div.img-wrapper > img' ) .src ,
                    from    : url ,
                    index   : index ,
                    about   : item_ .querySelector ( 'div.row' ) .innerText ,
                };
                return data;
              } , url , index ++ )
            resultz.push ( data )
            //page.waitFor ( 500 );
            await check_if_canceled ( browser , monitor , socket );
            socket.emit ( "outgoing data" , [data] )
          }
        }
      }
      //
      browser.close ( );
      await check_if_canceled ( browser , monitor , socket );
      //socket.emit ( "outgoing data" , resultz );
      monitor .confirm = true;
      return resolve ( resultz );
    } catch ( e ) {
      monitor .confirm = true;
      return reject ( e );
    }
  })
}

function runalpinvest ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page.goto ( "http://www.alpinvest.com/leadership" , { timeout: 0 } );
        await check_if_canceled ( browser , monitor , socket );
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
                from    : "http://www.alpinvest.com/leadership" ,
                about   : item .querySelector ( 'a.contentLink_bioName.fn' )  .href ,
                phone   : item .querySelector ( 'p.telephone' )  .innerText ,
                mail    : item .querySelector ( 'a.contentLink.email' )  .href ,
            } );
          } );
          return results;
        } );

        await page.close ( );
        await check_if_canceled ( browser , monitor , socket );
        await Promise.all ( [ ...urls .map ( async ( item ) => {
          return new Promise ( async ( resolve , reject )=> {
            try {
              check_if_canceled ( browser , monitor , socket );
              const page = await browser.newPage ( );
              await page.setRequestInterception ( true );
              page.on ( 'request' , ( request ) => {
                if ( request .resourceType ( ) === 'document' ) {
                  request .continue ( );
                } else {
                  request.abort ( );
                }
              } );
              await page.goto ( item.about , { timeout: 0 } );
              check_if_canceled ( browser , monitor , socket );
              item.about = await page.evaluate( (  )=>{
                function  paragraphs  ( array ) {
                  let paragraph = '';
                  array.forEach ( ( para ) =>{
                    paragraph += para.innerText += '\n';
                  } );
                  return paragraph;
                };
                return paragraphs ( document.querySelectorAll ( 'div.contentBox_largeBioText > p' ) );
              } )
              await page.close ( );
              check_if_canceled ( browser , monitor , socket );
              socket .emit ( "outgoing data" , [ item ] )
              return resolve ( item );
            }catch ( e ) {
              return reject ( e );
            }
           } )
         } )
        ] )
      }
      //
      await browser.close ( );
      monitor.confirm = true
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runantea ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
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
                  about   : item .querySelector ( 'div.nicepadding' ) .innerText ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      socket .emit ( 'outgoing data' , urls )
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runbaincapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://www.baincapital.com/people" , { timeout : 0 , } );
        console.log ( "begin scrolling ..." );
        let i = 0;
        while ( i ++ < 4 ){
          await check_if_canceled ( browser , monitor , socket );
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
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.col-xs-6.col-sm-4.col-md-6.col-lg-3.grid.staff > a' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h4 > span' )  .innerText ,
                  job     : item .querySelector ( 'h4 > small' )  .innerText ,
                  market  : item .querySelector ( '.__location > span' )  .innerText + ' ' + item .querySelector ( 'span.locationList' )  .innerText ,
                  image   : item .querySelector ( '.team_img > img' ) .src ,
                  from    : "https://www.baincapital.com/people" ,
                  about   : item .href ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          urls = await Promise.all ([ ...urls .map ( ( item ) => {
            return new Promise ( async ( resolve , reject)=> {
              try {
                await page.goto( item.about , {timeout:0} )
                item.about = await page.evaluate ( ( ) => {
                  return document.querySelector ( 'div.col-xs-12.col-sm-8.col-md-8.pos-r' ) .innerText ;
                } )
                await autoScroll ( page );
                item.sector = await page.evaluate ( ( ) => {
                  let sector = document.querySelector ( 'ul.focus_link' );
                  return sector ? sector.innerText : '' ;
                } )
                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( "outgoing data" , [item] );
                return resolve ( item );
              } catch ( e ) {
                reject ( e )
              }
            });
          } )
          ])
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runbbcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "http://bbcapital.nl/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.tmm_member' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              let about = item .querySelector ( 'div.tmm_desc' );
              let icons = item .querySelectorAll ( 'a.tmm_sociallink' ) [ 1 ];
              results.push ( {
                  name    : item .querySelector ( 'div.tmm_names' )  .innerText ,
                  job     : item .querySelector ( 'div.tmm_job' )  .innerText ,
                  //market  : "" ,
                  image   : getComputedStyle ( item .querySelector ( 'div.tmm_photo' ) ) .getPropertyValue ( 'background-image' ) .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "http://bbcapital.nl/team/" ,
                  about   : about ? about.innerText : '' ,
                  mail    : item .querySelector ( 'a.tmm_sociallink' ) . href .replace ( "mailto:" ,'' ) ,
                  linkedIn:  icons ? icons.href : '' ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      await browser.close ( );
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , urls );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runavedoncapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      const page = await browser.newPage ( );
      let urls = [ ];
      //specific to website
      {
        let url = "https://avedoncapital.com/team/#main-content";
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( url , { timeout : 0 , } );
        await autoScroll ( page );
        await check_if_canceled ( browser , monitor , socket );
        let itemz = await page .$$ ( 'article.team-preview.tile.mix' );
        let index = 0
        for ( item of Array.from ( itemz ) ){
          await check_if_canceled ( browser , monitor , socket );
          await check_if_canceled ( browser , monitor , socket );
          await item .focus (  );
          await item .click (  )
            .catch (  async ( e ) => {
              console.log ( e + "  ...retrying operation!!!!" )
              await sleep ( 500 );
              await item. click ( )
              .catch (  async ( e ) => {
                console.log ( e + "  ...retrying operation!!!!" )
                await sleep ( 500 );
                await item. click ( );
              } );

            } );
          while ( ! await page .$ ( 'article#modal-ready' ) ){
            await sleep ( 500 );
            //console.log ( 'polling...!' );
            check_if_canceled ( browser , monitor , socket );
          }
          await check_if_canceled ( browser , monitor , socket );
          let data = await page.evaluate ( async ( url , index ) => {
            return {
              name : document .querySelector ( 'h1.name' ) .innerText ,
              job : document .querySelector ( 'h2.position' ) .innerText ,
              map : document .querySelector ( 'div.infos > div.office' ) ? document .querySelector ( 'div.infos > div.office' ).innerText : '' ,
              linkedIn : document .querySelector ( 'div.infos > a.linkedin' ) ? document .querySelector ( 'div.infos > a.linkedin' ).innerText : '' ,
              mail : document .querySelector ( 'div.infos > a.mail' ) ? document .querySelector ( 'div.infos > a.mail' ).innerText : '' ,
              about : document .querySelector ( 'section.description' ) .innerText ,
              sector : document .querySelector ( 'section.sectors' ) ? document .querySelector ( 'section.sectors' ).innerText : '',
              from : url ,
              index : index ,
              image : document .querySelector ( 'header.header > div.profile-image-wrapper > img.profile-image' ) .src ,
            };
          } , url , index++ );
          urls .push ( data );
          await check_if_canceled ( browser , monitor , socket );
          socket.emit ( 'outgoing data' , [data] );
          let close = await page .$ ( 'div.close-modal' );
          await close .click ( )
            .catch (  async ( e ) => {
              console.log ( e + "  ...retrying operation!!!!" )
              await sleep ( 500 );
              await close. click ( )
                .catch (  async ( e ) => {
                  console.log ( e + "  ...retrying operation!!!!" )
                  await sleep ( 500 );
                  await close. click ( );
                } );
            } );
        }
      }
      //
      await browser.close ( );
      return resolve ( urls );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function runbolsterinvestments ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://bolsterinvestments.nl/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.member.in-view.is-in-view > a' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h3.h2.title' )  .innerText ,
                  job     : item .querySelector ( 'span.jobtitle' )  .innerText ,
                  image   : item .querySelector ( 'div.member--image' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://bolsterinvestments.nl/team/" ,
                  about   : item.href ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ( [ ...urls .map ( ( item ) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( { path: 'jquery.js'  } );
                item.about = await page.evaluate ( ( ) => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document .querySelectorAll ( 'p' ) ) ;
                } );
                item.sector = await page.evaluate ( ( ) => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document .querySelectorAll ( 'a.participation' ) ) ;
                } )
                item.phone = await page.evaluate ( ( ) => {
                  return $ ( 'div.footer__inner' ) . find ( 'a' ) .eq ( 0 ) . text (  ).replace ( '\t' , '' );
                } )
                item.mail = await page.evaluate ( ( ) => {
                  return $ ( 'div.footer__inner' ) . find ( 'a' ) .eq ( 1 ) . text (  ).replace ( '\t' , '' );
                } )
                item.linkedIn = await page.evaluate ( ( ) => {
                  return $ ( 'div.footer__inner' ) . find ( 'a' ) .eq ( 2 ) . prop ( 'href' ) ;
                } )
                await page.close (  );
                socket.emit  ( 'outgoing data' , [item] )
                return resolve ( item )
              } catch ( e ) {
                return reject ( e )
              }
            } ) ;
          } ) ] )
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runbridgepoint ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      const page = await browser.newPage ( );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = document .querySelectorAll ( 'div.column_one_third.result_item_3col.first' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                    name    : item .querySelector ( 'div > p > a' )  .innerText ,
                    job     : item .querySelector ( 'div > ul > li' )  .innerText ,
                    market  : item .querySelector ( 'div > ul > li + li' )  .innerText ,
                    image   : item .querySelector ( 'img' ) .src ,
                    from    : url ,
                    about   : item .querySelector ( 'a.arrow_link' ) .href
                  } );
                } );
                return results;
              }  , url );
              await check_if_canceled ( browser , monitor , socket );
              await Promise.all ([ ...results.map ( ( item) => {
                return new Promise ( async ( resolve , reject ) => {
                  try {
                    await check_if_canceled ( browser , monitor , socket );
                    const page = await browser.newPage ( );
                    await check_if_canceled ( browser , monitor , socket );
                    await page .goto ( item.about , {timeout:0} );
                    await page .addScriptTag ( {path : "jquery.js"}  );
                    await check_if_canceled ( browser , monitor , socket );
                    item .about = await page.evaluate ( () => {
                      function  paragraphs  ( array ) {
                        let paragraph = '';
                        array.forEach ( ( para ) =>{
                          paragraph += para.innerText += '\n';
                        } );
                        return paragraph;
                      }
                      return paragraphs ( document.querySelectorAll ( 'div.richTextFormat > p' ) );
                    } )
                    await check_if_canceled ( browser , monitor , socket );
                    item .phone = await page.evaluate ( () => {
                      return $ ( 'table.bottom_padded' ) .find ( 'td.info' ) .eq ( 1 ) .text ( );
                    } )
                    item .mail = await page.evaluate ( () => {
                      return $ ( 'table.bottom_padded' ) .find ( 'td.info > a' ) .eq ( 0 ) .prop ( 'href' ) .replace ( 'mailto:' , '' );
                    } )
                    await check_if_canceled ( browser , monitor , socket );
                    socket.emit ( 'outgoing data' , [item] )
                    return resolve ( item );
                  } catch ( e ) {
                    return reject ( e );
                  }
                });
              }  ) ])

              await page.close ( );
              monitor.confirm = true ;
              return resolve ( results )
            }catch ( e ){
              monitor.confirm = true;
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
                  await Promise.all ( [  ...urls .slice ( 0 , 10 ). map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function runbrightlandsventurepartners ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://brightlandsventurepartners.com/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
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
                  about   : item .querySelector ( 'a' ) .href
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ( [ ...urls.map ( ( item ) => {
            return new Promise ( async ( resolve , reject ) => {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );
                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.inner.defaulttext > p' ) );
                } );
                await check_if_canceled ( browser , monitor , socket );
                item.phone = await page.evaluate ( () => {
                  return document.querySelectorAll ( 'div.contactinfo > a' ) [ 0 ] .innerText;
                } );
                await check_if_canceled ( browser , monitor , socket );
                item.mail = await page.evaluate ( () => {
                  return document.querySelectorAll ( 'div.contactinfo > a' ) [ 1 ] .innerText;
                } );
                await check_if_canceled ( browser , monitor , socket );
                item.linkedIn = await page.evaluate ( () => {
                  return document.querySelectorAll ( 'div.contactinfo > a' ) [ 2 ] .href;
                } );
                await check_if_canceled ( browser , monitor , socket );
                socket .emit ( 'outgoing data' , [item] )
                return resolve ( item )
              } catch ( e ) {
                return reject ( e );
              }
            });
          } ) ])
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runcapitalapartners ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://www.capitalapartners.nl/team" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
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
                  about   : item .querySelector ( 'a' ).href
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ([ ...urls .map ( ( item ) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );
                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.content-text__text > p' ) );
                } );
                await check_if_canceled ( browser , monitor , socket );
                item.phone = await page.evaluate ( () => {
                  return document.querySelectorAll ( 'ul.contact__list > li' ) [ 0 ].innerText;
                } );
                await check_if_canceled ( browser , monitor , socket );
                item.mail = await page.evaluate ( () => {
                  return document.querySelectorAll ( 'ul.contact__list > li' ) [ 1 ].innerText;
                } );
                await check_if_canceled ( browser , monitor , socket );
                item.linkedIn = await page.evaluate ( () => {
                  let linkedIn = document.querySelectorAll ( 'ul.contact__list > li > a' ) [ 2 ];
                  return linkedIn ? linkedIn.href : '';
                } );
                await check_if_canceled ( browser , monitor , socket );
                socket.emit( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                return reject ( e );
              }
            });
          } ) ])
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runcinven ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://www.cinven.com/who-we-are/the-team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
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
                  about   : item.href ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          let i , j , chunk = 10;
          for ( i = 0 , j = urls.length; i < j; i += chunk ) {
            //.slice ( i , i+chunk )
            await Promise.all ( [ ...urls .slice ( i , i+chunk ) .map ( ( item ) => {
              return new Promise ( async ( resolve , reject ) => {
                try {
                  await check_if_canceled ( browser , monitor , socket );
                  const page = await browser.newPage ( );
                  await check_if_canceled ( browser , monitor , socket );
                  await page .goto ( item.about , {timeout:0} );
                  await page .addScriptTag ( {path : "jquery.js"}  );
                  await check_if_canceled ( browser , monitor , socket );
                  item.about = await page.evaluate ( () => {
                    function  paragraphs  ( array ) {
                      let paragraph = '';
                      array.forEach ( ( para ) =>{
                        paragraph += para.innerText += '\n';
                      } );
                      return paragraph;
                    };
                    return paragraphs ( document.querySelectorAll ( 'div.bio > p' ) );
                  } );
                  await check_if_canceled ( browser , monitor , socket );
                  socket.emit ( 'outgoing data' , [item] )
                  return resolve ( item );
                } catch ( e ) {
                  return reject ( e );
                }
              });
            } ) ] )
          }
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function committedcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://committedcapital.nl/team/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.item.cbp-item.boxed-item.col-xs-4.no-excerpt' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'h4.member-name' )  .innerText ,
                  job     : item .querySelector ( 'p.team-member-description.normal' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src ,
                  from    : "https://committedcapital.nl/team/" ,
                  linkedIn : item .querySelector ( 'a.member-social.linkedin' ) .href ,
                  mail : item .querySelector ( 'a.member-social.email' ) .href .replace ( 'mailto:' , '' ) ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , urls )
      monitor.emit = true ;
      return resolve ( urls );
    } catch ( e ) {
      monitor.emit = true;
      return reject ( e );
    }
  })
}

function cottonwood ( socket , monitor) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://www.cottonwood.vc/" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            function  paragraphs  ( array ) {
              let paragraph = '';
              array.forEach ( ( para ) =>{
                paragraph += para.innerText += '\n';
              } );
              return paragraph;
            };
            let results = [ ];
            let items = document .querySelectorAll ( 'div.progression-masonry-item.progression-masonry-col-4.opacity-progression' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              let linkedIn = item . querySelector ( 'a.linkedin-pro' );
              let mail = item . querySelector ( 'a.mail-pro' );
              results.push ( {
                  name    : item .querySelector ( 'h2.invested-team-title' )  .innerText ,
                  job     : item .querySelector ( 'div.invested-excerpt-team' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src , //style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.cottonwood.vc/" ,
                  about   : paragraphs ( item . querySelectorAll ( 'div.invested-content-team > p' ) ) ,
                  linkedIn : linkedIn ? linkedIn.href : '',
                  mail :  mail ? mail.href .replace ( 'mailto:' , '' ) : '' ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      socket.emit ( 'outgoing data' , urls )
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function cvc ( socket , monitor) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://www.cvc.com/people/working-at-cvc" , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'div.person-wrapper' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'p.person-name' )  .innerText .replace ( '\n' ,'' ) .trim ( ) ,
                  job     : item .querySelector ( 'p.person-designation' )  .innerText .replace ( '\n' ,'' ) .trim ( ) ,
                  //market  : "" ,
                  image   : item .querySelector ( 'img' ) .src ,
                  from    : "https://www.cvc.com/people/working-at-cvc" ,
                  about   : item .querySelector ( 'p.person-desc' ) .innerText ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      socket.emit ( 'outgoing data' , urls )
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function dehogedennencapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      const page = await browser.newPage ( );
      let urls = [ ];
      //specific to website
      {
        let url = "https://www.dehogedennencapital.nl/team/";
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( url , { timeout : 0 , } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = document .querySelectorAll ( 'a.js-modal__link.c-full-img-link-blocks__block.c-full-img-link-blocks__block--orange' );
            let itemz = document .querySelectorAll ( 'div.c-modal__content' );
            Array.from ( items ).forEach ( ( item  , index ) => {
              let phone = itemz [ index ] .querySelectorAll ( 'div.c-modal__links > a' ) [ 0 ];
              let mail = itemz [ index ] .querySelectorAll ( 'div.c-modal__links > a' ) [ 1 ];
              function  paragraphs  ( array ) {
                let paragraph = '';
                array.forEach ( ( para ) =>{
                  paragraph += para.innerText += '\n';
                } );
                return paragraph;
              }
              results.push ( {
                  name    : item .querySelector ( 'h3' )  .innerText  ,
                  job     : item .querySelector ( 'small' )  .innerText ,
                  //market  : "" ,
                  image   : item .querySelector ( 'div.c-full-img-link-blocks__block__img.u-bg-cover-center' ) .style [ 'background-image' ] .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://www.dehogedennencapital.nl/team/" ,
                  about   : paragraphs ( itemz [ index ] .querySelectorAll ( 'div.c-modal__text > p' ) ) ,
                  phone   :  phone ? phone .innerText .replace ( '\n' , '' ) .trim ( ) : '' ,
                  mail    :  mail ? mail .innerText .replace ( '\n' , '' ) .trim ( ) : '' ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , urls );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function delftenterprises ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "p:has(img)" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : item .querySelector ( 'strong' )  .innerText  ,
                  job     : item  .innerText .split ( '\n' ) [ 1 ] ,
                  mail    : item  .innerText .split ( '\n' ) [ 2 ] ,
                  phone   : item  .innerText .split ( '\n' ) [ 3 ] ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , urls );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function ecart ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://www.ecart.nl/en/organisatie-missie/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.col-md-4:has(div.image)" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.name' )  .text ( )  ,
                  image   : $ ( item ) .find ( 'img' ) .attr ( 'src' ) ,
                  from    : "https://www.ecart.nl/en/organisatie-missie/" ,
                  about   : $ ( item ) .find ( 'div.image > a' ) .attr ( 'href' ) ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ( [ ...urls.map ( (item) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );
                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.team_details > p' ) );
                } );
                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                return reject ( e );
              }
            });
          } ) ] )
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function egeria ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://egeria.nl/team-overzicht/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.item-inner" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.item-content' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'div.item-footer' )  .text ( )  .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( ) ,
                  image   : $ ( item ) .find ( 'img.img-responsive' ) .attr ( 'src' ) ,
                  from    : "https://egeria.nl/team-overzicht/" ,
                  about   : $ ( item ) .find ( 'div.item-titel > a' ) .attr ( 'href' ) ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ( [ ...urls .map ( (item) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );
                item.about = await page.evaluate ( () => {
                  return document.querySelector ( 'div.col-md-9' ) .innerText;
                } );
                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                return reject ( e );
              }
            });
          } ) ] )
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function eqtpartners ( socket, monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://www.eqtpartners.com/Organization/Executive-Committee/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.delegate" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h2.committee' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'p.block' )  .text ( )  .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( ) ,
                  image   : $ ( item ) .find ( 'img.img-responsive' ) .prop ( 'src' ) ,
                  from    : "https://www.eqtpartners.com/Organization/Executive-Committee/" ,
                  about   : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ( [ ...urls.map ( (item) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );
                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'article > p' ) );
                } );
                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                console.log ( e );
                return reject ( e );
              }
            });
          } ) ] )
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function forbion ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://forbion.com/en/team/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
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
                  about   : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ( [ ...urls.map ( (item) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );
                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.text > p' ) );
                } );
                item.phone = await page.evaluate ( () => {
                  let node = document.querySelectorAll ( 'ul.action > li.slide-in.left > a' ) [ 0 ];
                  return  node ? node .href .replace ( 'tel:' , '' ) : '';
                } );
                item.mail = await page.evaluate ( () => {
                  let node = document.querySelectorAll ( 'ul.action > li.slide-in.left > a' ) [ 1 ];
                  return  node ? node .href .replace ( 'mailto:' , '' ) : '';
                } );
                item.linkedIn = await page.evaluate ( () => {
                  let node = document.querySelectorAll ( 'ul.action > li.slide-in.left > a' ) [ 3 ];
                  return  node ? node.href : '';
                } );
                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                return reject ( e );
              }
            });
          } ) ] )
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function gembenelux ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://gembenelux.com/over-ons/235/mensen.html" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
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
                  about   : $ ( item ) .find ( 'a' )  .prop ( 'href' )
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ([ ...urls .map ( (item) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );

                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.content > p' ) );
                } );
                item.phone = await page.evaluate ( () => {
                  let node = document.querySelector ( 'a.phone' );
                  return  node ? node .href .replace ( 'tel:' , '' ) : '';
                } );
                item.mail = await page.evaluate ( () => {
                  let node = document.querySelector ( 'a.email' );
                  return  node ? node .href .replace ( 'mailto:' , '' ) : '';
                } );
                socket.emit ( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                return reject ( e )
              }
            });
          } ) ])
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function gilde ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        let url = "http://gilde.com/team/investment-team";
        await page  .goto ( url , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div#people-container" ) .children ( );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.item-content > strong' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'div.item-content > span' )  .text ( )  .replace ( '(' , '' ). replace ( ')', '' ) . trim ( ) ,
                  image   : "none!" ,
                  from    : "http://gilde.com/team/investment-team" ,

              } );
            } );
            return results;
          } )

          await check_if_canceled ( browser , monitor , socket );
          let itemz = await page .$$ ( 'div#people-container > div' );
          let index = 0;
          for ( item of Array.from ( itemz ) ){
            await check_if_canceled ( browser , monitor , socket );
            await check_if_canceled ( browser , monitor , socket );
            await item .focus (  );
            await item .click (  )
              .catch (  async ( e ) => {
                console.log ( e + "  ...retrying operation!!!!" )
                await sleep ( 500 );
                await item. click ( )
                  .catch (  async ( e ) => {
                    console.log ( e + "  ...retrying operation!!!!" )
                    await sleep ( 500 );
                    await item. click ( );
                } );

              } );
            while ( ! await page .$ ( 'div#people-ajax-content' ) ){
              await sleep ( 500 );
              check_if_canceled ( browser , monitor , socket );
              console.log ( "Jammed !" )
            }
            await check_if_canceled ( browser , monitor , socket );

            urls [ index ] .about = await page.evaluate ( async () => {
              function  paragraphs  ( array ) {
                let paragraph = '';
                array.forEach ( ( para ) =>{
                  paragraph += para.innerText += '\n';
                } );
                return paragraph;
              };
              return paragraphs ( document.querySelectorAll ( 'div#people-ajax-content > p' ) );
            } ).catch ( console.log );

            urls [ index ] .phone = await page.evaluate ( async () => {
              let phone = document.querySelector ( 'address > span' );
              return phone ? phone .innerText .replace ( 'T:' , '' ) : '';
            } ).catch ( console.log );

            urls [ index ] .mail = await page.evaluate ( async () => {
              let mail = document.querySelector ( 'address > a' );
              return mail ? mail.innerText : '';
            } ).catch ( console.log );

            await check_if_canceled ( browser , monitor , socket );
            //socket.emit ( 'outgoing data' , [data] );
            while ( ! await page .$ ( 'a.btn.btn-close' ) ){
              check_if_canceled ( browser , monitor , socket );
              await sleep ( 100 );
              console.log ( 'jammed2 !' )
            }

            let close = await page .$ ( 'a.btn.btn-close' );

            await close .click ( )
              .catch (  async ( e ) => {
                console.log ( e + "  ...retrying operation!!!!" )
                await sleep ( 500 );
                await close. click ( )
                  .catch (  async ( e ) => {
                    console.log ( e + "  ...retrying operation!!!!" )
                    await sleep ( 500 );
                    await close. click ( );
                  } );
              } );

            socket.emit ( 'outgoing data' , [ urls [ index ] ] )
            index++;
          }
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function gildehealthcare ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://gildehealthcare.com/team/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page , 300 );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "article.mix.mix_all.col-xs-6.col-sm-4" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h2' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( item ) .find ( 'p' )  .text ( )  .replace ( '(' , '' ). replace ( ')', '' ) . trim ( ) ,
                  //market  : "" ,
                  image   : $ ( item ) .find ( 'figure.team_image.lazy' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://gildehealthcare.com/team/" ,
                  about   : $ ( item ) .find ( 'a' )  .prop ( 'href' ) ,
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ([ ...urls .map ( (item) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );

                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.col-md-6.col-md-push-3.border-right > p' ) );
                } );
                item.phone = await page.evaluate ( () => {
                  let node = document.querySelector ( 'div.col-md-3.col-md-pull-6 > p' );
                  return  node ? node .innerText : '';
                } );
                item.mail = await page.evaluate ( () => {
                  let node = document.querySelector ( 'a.social_button.email' );
                  return  node ? node .href .replace ( 'mailto:' , '' ) : '';
                } );
                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                return reject ( e )
              }
            });
          } ) ])
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function gimv ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://www.gimv.com/en/team" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
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
                  about   : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  url   : $ ( item ) .find ( 'a' ) .prop ( 'href' )
              } );
            } );
            return results;
          } );

          await check_if_canceled ( browser , monitor , socket );
          await Promise.all ([ ...urls .map ( (item) => {
            return new Promise ( async ( resolve , reject )=> {
              try {
                await check_if_canceled ( browser , monitor , socket );
                const page = await browser.newPage ( );
                await check_if_canceled ( browser , monitor , socket );
                await page .goto ( item.about , {timeout:0} );
                await page .addScriptTag ( {path : "jquery.js"}  );
                await check_if_canceled ( browser , monitor , socket );

                item.about = await page.evaluate ( () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.field__item > p' ) );
                } );

                item.phone = await page.evaluate ( () => {
                  let node = document.querySelector ( 'div.field.field--name-field-telephone.field--type-telephone > div.field__items > div.field__item' );
                  return  node ? node .innerText : '';
                } );

                item.mail = await page.evaluate ( () => {
                  let node = document.querySelector ( 'div.field__item > a' );
                  return  node ? node .href .replace ( 'mailto:' , '' ) : '';
                } );

                item.map = await page.evaluate ( () => {
                  let node = document.querySelector ( 'div.address' );
                  return  node ? node .innerText : '';
                } );

                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( 'outgoing data' , [item] )
                return resolve ( item );
              } catch ( e ) {
                return reject ( e )
              }
            });
          } ) ])
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function healthinnovations ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://www.healthinnovations.nl/nl/het-team" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.col.sqs-col-6.span-6" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h3 > a ' ) .text ( ) .replace ( '\n' , '' ). replace ( '\t', '' ) . trim ( )  ,
                  job     : $ ( "div.sqs-block-content > h1" )  .text ( ) ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://www.healthinnovations.nl/nl/het-team" ,
                  about   : $ ( item ) .find ( 'div.sqs-block-content > p ' ) .eq ( 0 ) .text ( ) ,
                  linkedIn : $ ( item ) .find ( 'h3 > a ' ) .prop ( 'href' ) ,
                  mail   : $ ( item ) .find ( 'div.sqs-block-content > p > a' ) .eq ( 0 ) .text ( ) ,
                  phone   : $ ( item ) .find ( 'div.sqs-block-content > p' ) .eq ( 1 ) .text ( )
                            .replace ( $ ( item ) .find ( 'div.sqs-block-content > p > a' ) .eq ( 0 ) .text ( ) , ''  )
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      socket.emit ( "outgoing data" , urls )
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function healthinvestmentpartners ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://www.healthinvestmentpartners.nl/over-ons" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.mc1:has(h4.font_8 > span.color_15 > span)" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h1.font_0,h3.font_0 > span.color_15' ) .text ( )  ,
                  job     : $ ( item ) .find ( "h4.font_8 > span.color_15 > span" )  .text ( ) ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://www.healthinvestmentpartners.nl/over-ons" ,
                  linkedIn : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  about : $ ( item ) .find ( 'ul.font_9' ) .text ( ) ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      socket.emit ( 'outgoing data' , urls );
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function hollandcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://hollandcapital.nl/ons-team/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "div.et_pb_column.et_pb_column_1_3" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'h1' ) .text ( )  ,
                  job     : $ ( item ) .find ( 'div.et_pb_text_inner > h2' ) .text ( ) || 'Advisor' ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://hollandcapital.nl/ons-team/" ,
                  about   : $ ( item ) .find ( 'div.et_pb_toggle_content.clearfix > p' ) .text ( )  ,
                  linkedIn   : $ ( item ) .find ( 'a.icon.et_pb_with_border' ) .prop ( 'href' )  ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      socket.emit ( 'outgoing data' , urls );
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function horizonflevoland ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://www.horizonflevoland.nl/wij" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let items = $ ( "li:has(.col12.m-b-lg > h3)" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( '.col12.m-b-lg > h3' ) .text ( )  ,
                  job     : $ ( item ) .find ( 'p.small:first' ) .text ( ) || 'Advisor' ,
                  image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                  from    : "https://www.horizonflevoland.nl/wij" ,
                  mail    : $ ( item ) .find ( 'p.small' ) .text (  ) ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      monitor.resolve = true;
      socket.emit ( 'outgoing data' , urls );
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function hpegrowth ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page  .goto ( "https://hpegrowth.com/about-us/" , { timeout : 0 , } );
        await page  .addScriptTag ( { path: 'jquery.js'  } );
        await autoScroll ( page );
        {
          await check_if_canceled ( browser , monitor , socket );
          urls = await page.evaluate ( ( ) => {
            function  paragraphs  ( array ) {
              let paragraph = '';
              array.forEach ( ( para ) =>{
                paragraph += para.innerText += '\n';
              } );
              return paragraph;
            }
            let results = [ ];
            let items = $ ( "article.team-card" );
            Array.from ( items ).forEach ( ( item  , index ) => {
              results.push ( {
                  name    : $ ( item ) .find ( 'div.caption > div > h5' ) .text ( )  ,
                  job     : $ ( item ) .find ( 'div.caption > div > span' ) .text ( ) ,
                  image   : $ ( item ) .find ( 'div.image' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                  from    : "https://hpegrowth.com/about-us/" ,
                  about   : paragraphs ( item.querySelectorAll ( 'div.description > p' ) ) ,
                  linkedIn : $ ( item ) .find ( 'a.no-async' ) .prop ( 'href' ) ,
              } );
            } );
            return results;
          } );
        }
      }
      //
      browser.close ( );
      monitor.confirm = true;
      socket.emit ( 'outgoing data' , urls )
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function ibsca ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn   : $ ( item ) .find ( 'a.person-linkedin' ) .prop ( 'href' ) ,
                      mail    : $ ( item ) .find ( 'div.email' ) .text ( )  ,
                      phone    : $ ( item ) .find ( 'div.telephone' ) .text ( )  ,
                      about    : $ ( item ) .find ( 'div.person-date' ) .text ( )  ,
                  } );
                } );
                return results;
              } );
              await page.close ( );
              socket.emit ( 'outgoing data' , [results]  )
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://ibsca.nl/team/` , `https://ibsca.nl/team/page/2` , `https://ibsca.nl/team/page/3` ];
      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function innovationquarter ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              await check_if_canceled ( browser , monitor , socket );
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

              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( "a.av-masonry-entry.isotope-item" );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3.av-masonry-entry-title.entry-title' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'span.member-role' ) .text ( ) ,
                      image   : $ ( item ) .find ( 'div.av-masonry-image-container' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : "https://www.innovationquarter.nl/ons-team/" ,
                      about   : $ ( item ) .prop ( 'href' )  ,
                  } );
                } );
                return results;
              } );

              await check_if_canceled ( browser , monitor , socket );
              await Promise.all ([ ...results .map ( (item) => {
                return new Promise ( async ( resolve , reject )=> {
                  try {
                    await check_if_canceled ( browser , monitor , socket );
                    const page = await browser.newPage ( );
                    await check_if_canceled ( browser , monitor , socket );
                    await page .goto ( item.about , {timeout:0} );
                    await page .addScriptTag ( {path : "jquery.js"}  );
                    await check_if_canceled ( browser , monitor , socket );

                    item.about = await page.evaluate ( () => {
                      function  paragraphs  ( array ) {
                        let paragraph = '';
                        if ( array ) {
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                        }
                        return paragraph;
                      };
                      return paragraphs ( document.querySelectorAll ( 'div.entry-content > p' ) );
                    } );
                    item.phone = await page.evaluate ( () => {
                      let node = document.querySelector ( 'li.phone' );
                      return  node ? node .innerText : '';
                    } );
                    item.mail = await page.evaluate ( () => {
                      let node = document.querySelector ( 'li.mail > a' );
                      return  node ? node .href .replace ( 'mailto:' , '' ) : '';
                    } );
                    item.linkedIn = await page.evaluate ( () => {
                      let node = document.querySelectorAll ( 'a.avia-team-icon' ) [ 0 ];
                      return  node ? node .href  : '';
                    } );
                    item.twitter = await page.evaluate ( () => {
                      let node = document.querySelector ( 'a.avia-team-icon' ) [ 2 ];
                      return  node ? node .href  : '';
                    } );

                    item.whatsapp = await page.evaluate ( () => {
                      let node = document.querySelector ( 'a.avia-team-icon' ) [ 1 ];
                      return  node ? node .href  : '';
                    } );
                    await check_if_canceled ( browser , monitor , socket );
                    socket.emit ( 'outgoing data' , [item] )
                    return resolve ( item );
                  } catch ( e ) {
                    return reject ( e )
                  }
                });
              } ) ])

              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }

      let urls = [ `https://www.innovationquarter.nl/ons-team/` ];

      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function karmijnkapitaal ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( "div.personlist > div.person" );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.name' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'div.function' ) .text ( ) ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : "http://www.karmijnkapitaal.nl/25-over-ons.html" ,
                      mail    : $ ( item ) .find ( 'div.email > a' ) .prop ( 'href' ) .replace ( 'mailto:' , '' ) ,
                  } );
                } );
                return results;
              } );

              await check_if_canceled ( browser , monitor , socket );
              let itemz = await page .$$ ( 'div.personlist > div.person > div.photo > a' );
              let index = 0;
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );
                await item .focus (  );
                await item .click (  )
                  .catch (  async ( e ) => {
                    console.log ( e + "  ...retrying operation!!!!" )
                    await sleep ( 500 );
                    await item. click ( )
                      .catch (  async ( e ) => {
                        console.log ( e + "  ...retrying operation!!!!" )
                        await sleep ( 500 );
                        await item. click ( );
                    } );

                  } );
                while ( ! await page .$ ( 'div.content > div.bio > article > p' ) ){
                  await sleep ( 500 );
                  check_if_canceled ( browser , monitor , socket );
                  console.log ( "Jammed !" )
                }
                await check_if_canceled ( browser , monitor , socket );

                results [ index ] .about = await page.evaluate ( async () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div.content > div.bio > article > p' ) );
                } ).catch ( console.log );

                await check_if_canceled ( browser , monitor , socket );
                //socket.emit ( 'outgoing data' , [data] );
                while ( ! await page .$ ( 'button#scov-close' ) ){
                  check_if_canceled ( browser , monitor , socket );
                  await sleep ( 100 );
                  console.log ( 'jammed2 !' )
                }

                let close = await page .$ ( 'button#scov-close' );

                await close .click ( )
                  .catch (  async ( e ) => {
                    console.log ( e + "  ...retrying operation!!!!" )
                    await sleep ( 500 );
                    await close. click ( )
                      .catch (  async ( e ) => {
                        console.log ( e + "  ...retrying operation!!!!" )
                        await sleep ( 500 );
                        await close. click ( );
                      } );
                  } );

                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                while ( await page .$ ( 'div.content > div.bio > article > p' ) );
                index++;
              }

              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.karmijnkapitaal.nl/25-over-ons.html` ];

      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
} /*modals injected to dom*/

function kkr ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              await check_if_canceled ( browser , monitor , socket );
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
                let items = $ ( 'a:has(p.name-employee)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 0 ] ,
                      job     : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 1 ] ,
                      market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      image   : $ ( item ) .find ( 'div.ftm-img > img' ) .prop ( 'src' ) ,
                      from    : "https://www.kkr.com/our-firm/team" ,
                      about   : $ ( item ) .prop ( 'href' ) ,
                      url   : $ ( item ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } );
              await page.close ( );

              await check_if_canceled ( browser , monitor , socket );
              await Promise.all ([ ...results .map ( (item) => {
                return new Promise ( async ( resolve , reject )=> {
                  try {
                    await check_if_canceled ( browser , monitor , socket );
                    const page = await browser.newPage ( );
                    await check_if_canceled ( browser , monitor , socket );
                    await page .goto ( item.about , {timeout:0} );
                    await page .addScriptTag ( {path : "jquery.js"}  );
                    await check_if_canceled ( browser , monitor , socket );

                    item.about = await page.evaluate ( () => {
                      function  paragraphs  ( array ) {
                        let paragraph = '';
                        if ( array ) {
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                        }
                        return paragraph;
                      };
                      return paragraphs ( document.querySelectorAll ( 'div.col-xs-12 > p' ) );
                    } );
                    item.mail = await page.evaluate ( () => {
                      let node = document.querySelector ( 'li.link-em > a' );
                      return  node ? node .innerText .replace ( 'mailto:' , '' ) : '';
                    } );
                    item.linkedIn = await page.evaluate ( () => {
                      let node = document.querySelectorAll ( 'li.link-ln' );
                      return  node ? node .href  : '';
                    } );
                    item.twitter = await page.evaluate ( () => {
                      let node = document.querySelector ( 'li.link-tw' );
                      return  node ? node .innerText  : '';
                    } );

                    item.facebook = await page.evaluate ( () => {
                      let node = document.querySelector ( 'li.link-fb' );
                      return  node ? node .innerText  : '';
                    } );

                    item.image = await page.evaluate ( () => {
                      let node = document.querySelector ( 'div.bio-img > img' );
                      return  node ? node .src  : '';
                    } );
                    await check_if_canceled ( browser , monitor , socket );
                    socket.emit ( 'outgoing data' , [item] );
                    return resolve ( item );
                  } catch ( e ) {
                    return reject ( e )
                  }
                });
              } ) ])
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function llcp ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              await check_if_canceled ( browser , monitor , socket );
              let results = [ ];
              const page = await browser .newPage ( );
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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

              await check_if_canceled ( browser , monitor , socket );
              let itemz = await page .$$ ( 'a.popup-bio' );
              let index = 0;
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );
                await item .focus (  );
                await item .click (  )
                  .catch (  async ( e ) => {
                    console.log ( e + "  ...retrying operation!!!!" )
                    await sleep ( 500 );
                    await item. click ( )
                      .catch (  async ( e ) => {
                        console.log ( e + "  ...retrying operation!!!!" )
                        await sleep ( 500 );
                        await item. click ( );
                    } );

                  } );

                while ( ! await page .$ ( 'div#bio.col.span_9_of_12 > p' ) ){
                  await sleep ( 500 );
                  check_if_canceled ( browser , monitor , socket );
                  console.log ( "Jammed !" )
                }
                await check_if_canceled ( browser , monitor , socket );

                results [ index ] .about = await page.evaluate ( async () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div#bio.col.span_9_of_12 > p' ) );
                } ).catch ( console.log );

                await check_if_canceled ( browser , monitor , socket );
                //socket.emit ( 'outgoing data' , [data] );
                while ( ! await page .$ ( 'button.mfp-close' ) ){
                  check_if_canceled ( browser , monitor , socket );
                  await sleep ( 100 );
                  console.log ( 'jammed2 !' )
                }

                let close = await page .$ ( 'button.mfp-close' );

                await close .click ( )
                  .catch (  async ( e ) => {
                    console.log ( e + "  ...retrying operation!!!!" )
                    await sleep ( 500 );
                    await close. click ( )
                      .catch (  async ( e ) => {
                        console.log ( e + "  ...retrying operation!!!!" )
                        await sleep ( 500 );
                        await close. click ( );
                      } );
                  } );

                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                while ( await page .$ ( 'div#bio.col.span_9_of_12 > p' ) );
                index++;
              }
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.llcp.com/about/our-team` ];
      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      monitor.confirm = true
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function liof ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              await check_if_canceled ( browser , monitor , socket );
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

              await check_if_canceled ( browser , monitor , socket );
              let itemz = await page .$$ ( 'div.medewerker > div.medewerker__naw > div.medewerker__tab > a.button.groen.medewerker_meerinfo' );
              let index = 0;
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );
                await item .focus (  )

                let maxOpen = 7;
                for ( var i = 0; i < maxOpen ; i++ ) {
                  await item.click (  ) .then ( () => {
                    i = 8;
                  } ) .catch ( async ( e ) => {
                    console.log ( e + "  ...retrying open operation!!!! " + index )
                    await sleep ( 500 );
                  } )
                }

                await check_if_canceled ( browser , monitor , socket );

                results [ index ] .about = await page.evaluate ( async () => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( document.querySelectorAll ( 'div#medewerkers__uitklapper > div.medewerker-meerinfo > div.medewerker-meerinfo__tekst > h4' ) );
                } ).catch ( console.log );

                results [ index ] .mail = await page.evaluate ( async () => {
                  return document.querySelector ( 'div#medewerkers__uitklapper > div.medewerker-meerinfo > div.medewerker-meerinfo__tekst > a' ) .innerText;
                } ).catch ( console.log );

                results [ index ] .phone = await page.evaluate ( async () => {
                  return document.querySelector ( 'div#medewerkers__uitklapper > div.medewerker-meerinfo > div.medewerker-meerinfo__tekst > h4' ) .innerText
                      .replace ( document.querySelector ( 'div#medewerkers__uitklapper > div.medewerker-meerinfo > div.medewerker-meerinfo__tekst > h4' ) .innerText , '' );
                } ).catch ( console.log );

                await check_if_canceled ( browser , monitor , socket );

                while ( ! await page .$ ( 'div#medewerkers__uitklapper > div#medewerker__skuitkruis > img' ) ){
                  console.log ( 'wait for close button' );
                }

                let close = await page .$ ( 'div#medewerkers__uitklapper > div#medewerker__skuitkruis > img' );

                  let maxClose = 7;
                  for ( var i = 0; i < maxClose ; i++ ) {
                    await close.click (  ) .then ( () => {
                      i = 8;
                    } ) .catch ( async ( e ) => {
                      console.log ( e + "  ...retrying close operation!!!! " + index )
                      await sleep ( 500 );
                    } )
                  }

                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                index++;
              }

              await page.close ( );
              monitor.confirm = true
              return resolve ( results )
            }catch ( e ){
              monitor.confirm = true;
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
      monitor.confirm = true;
      return reject ( e );
    }
  })
}/*hiden modals*/

function lspvc ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: false } );
      await check_if_canceled ( browser , monitor , socket );
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
              page.on('dialog', async dialog => {
                console.log(dialog.message());
                await dialog.dismiss();
              });
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.container.site > div.content.team > div.item-info.overview > div.items' ) .children ( ) .filter( ":has(a)" );
                Array.from ( items ) .forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'a' ) .html ( ) .replace ( '<br>' , ' ' ) .trim ( ) ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) || "None",
                      from    : "https://www.lspvc.com/team.html" ,
                      about   : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      url   : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } );

              await Promise.all ([ ...results .map ( (item) => {
                return new Promise ( async ( resolve , reject )=> {
                  try {
                    await check_if_canceled ( browser , monitor , socket );
                    const page = await browser.newPage ( );
                    await page.setRequestInterception ( true );
                    page.on ( 'request' , ( request ) => {
                      if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                          request .abort ( );
                      } else {
                          request .continue  ( );
                      }
                    } );
                    page.on('dialog', async dialog => {
                      console.log(dialog.message());
                      await dialog.dismiss();
                    });
                    await check_if_canceled ( browser , monitor , socket );
                    await page .goto ( item.about , {timeout:0} );
                    await autoScroll ( page );
                    await check_if_canceled ( browser , monitor , socket );

                    item.about = await page.evaluate ( () => {
                      let about = document.querySelectorAll ( 'div.item-info > div.text > div' ) [ 0 ] ;
                      return  about ? about.innerText : '';
                    } );

                    item.mail = await page.evaluate ( () => {
                      let mail = document.querySelector ( 'div.item-info > div.text > div > a' ) ;
                      return  mail ? mail .href .replace ( 'mailto:' , '' ) : '';
                    } );

                    item.phone = await page.evaluate ( () => {
                      let node = document.querySelectorAll ( 'div.item-info > div.text > div' ) [ 1 ] ;
                      return  node ? node.innerText.split ( 'call' ) [ 1 ] ? node.innerText .split ( 'call' ) [ 1 ] .trim ( ) : ""  : '';
                    } );

                    if ( ! item.about ) {
                      item.about = await page.evaluate ( () => {
                        let about = document.querySelectorAll ( 'div.item-info > div.text > p' ) [ 0 ] ;
                        return  about ? about.innerText : '';
                      } );

                      item.mail = await page.evaluate ( () => {
                        let mail = document.querySelector ( 'div.item-info > div.text > p > a' ) ;
                        return  mail ? mail .href .replace ( 'mailto:' , '' ) : '';
                      } );

                      item.phone = await page.evaluate ( () => {
                        let node = document.querySelectorAll ( 'div.item-info > div.text > p' ) [ 1 ] ;
                        return  node ? node.innerText.split ( 'call' ) [ 1 ] ? node.innerText .split ( 'call' ) [ 1 ] .trim ( ) : ""  : '';
                      } );

                    }
                    await page.close (  );
                    await check_if_canceled ( browser , monitor , socket );
                    socket.emit ( 'outgoing data' , [item] );
                    return resolve ( item )
                  } catch ( e ) {
                    return reject( e )
                  }
                });
              }) ])

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function main ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              page.on ( 'error' , err => {
                console.log ( 'error happen at the page: ' , err );
              });
              page.on ( 'pageerror' , pageerr => {
                console.log ( 'pageerror occurred: ' , pageerr );
              })
              await check_if_canceled ( browser , monitor , socket );
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

              await check_if_canceled ( browser , monitor , socket );
              let itemz = await page .$$ ( 'div.team-person' );
              let index = 0;
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );
                let parent$ = 'div.remodal.team-remodal.remodal-is-initialized.remodal-is-opened > ';

                while ( ! await page .$ ( parent$ + 'div.team-content > p' ) ){
                  await item.focus (  );
                  await item.click ( ) .catch ( console.log );
                }

                results [ index ] .about = await page.evaluate ( async ( parent$ ) => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  let about = document.querySelectorAll ( parent$ + 'div.team-content > p' );
                  return paragraphs ( about );
                } , parent$);

                results [ index ] .mail = await page.evaluate ( async ( parent$ ) => {
                  return document.querySelector ( parent$ + 'div.team-details > div.team-intro > div.team-social > a.email' ) .href .replace ( "mailto:" , '' );
                } ,parent$ );

                results [ index ] .linkedIn = await page.evaluate ( async ( parent$ ) => {
                  let linkedIn = document.querySelector ( parent$ + 'div.team-details > div.team-intro > div.team-social > a.linkedin' );
                  return  linkedIn ? linkedIn.href : '';
                } , parent$);

                await check_if_canceled ( browser , monitor , socket );

                let close = await page .$ ( parent$ + 'button.remodal-close' );

                let maxClose = 7;
                for ( var i = 0; i < maxClose ; i++ ) {
                  await close.click (  ) .then ( () => {
                    i = 8;
                  } ) .catch ( async ( e ) => {
                    console.log ( e + "  ...retrying close operation!!!! " + index )
                    await sleep ( 1500 );
                  } )
                }
                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                index++;
              }

              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://main.nl/team/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] );
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function mgf ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_row:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2') .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p > em' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( "src" ) ,
                      from    : "https://www.mgf.nl/ons-team/" ,
                      about   : $ ( item ) .find ( 'div.et_pb_toggle_content.clearfix') .text ( ) ,
                  } );
                } );
                return results;
              } );
              await check_if_canceled ( browser , monitor , socket );
              socket.emit ( 'outgoing data' , results );
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function menthacapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      async function crawlUrl ( url ) {
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 } );
              let items = await page .$$ ( 'div.ratio_1-1 > div.w-portfolio-list > div.portfoliorow > div.w-portfolio-item > a.w-portfolio-item-anchor' );
              var index = 0;
              await check_if_canceled ( browser , monitor , socket );
              for ( item of Array.from ( items ) ) {
                await item .focus (  );
                await item .click (  );
                await page .waitFor ( 1000 );
                await check_if_canceled ( browser , monitor , socket );
                results.push ( await page.evaluate ( ( url , index ) => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  }
                  let item_ = document.querySelector ( 'div.w-portfolio-item.active' );
                  let data = {
                        name    : item_ .querySelector ( 'div.one-half51 > p') .innerText .split ( '–' ) [ 0 ] ,
                        job     : item_ .querySelector ( 'p > em' ) .innerText ,
                        image   : item_ .querySelector ( 'img' ) .src ,
                        from    : url ,
                        index   : index ,
                        about   : paragraphs ( item_ .querySelectorAll ( 'div.one-half51 > p' ) ) ,
                    };
                    return data;
                  } , url , index ++ )
                );
              }
              await page.close ( );
              monitor.confirm = true;
              socket.emit ( "outgoing data" , results )
              return resolve ( results )
            }catch ( e ){
              monitor.confirm = true;
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.menthacapital.com/` ];
      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] );
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function nom ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );

              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.card.card--employee' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'span.is-label.is-label--green' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'div.image' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                      url     : $ ( item ) .find ( "a" ) .prop ( 'href' ) ,
                      about   : $ ( item ) .find ( "a" ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 10;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i+chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      await page.setRequestInterception ( true );
                      page.on ( 'request' , ( request ) => {
                        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                            request .abort ( );
                        } else {
                            request .continue  ( );
                        }
                      } );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.mb-40.mb-xxl-50 > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } )
                      let more = await page.$$eval ( 'ul.list.list--default > li > a' , ( query ) => {
                        let mail =  query [ 0 ] ? query [ 0 ] .innerText : "";
                        let phone = query [ 1 ] ? query [ 1 ] .innerText : "";
                        let fax = query [ 2 ] ? query [ 2 ] .innerText : "";
                        let linkedIn = query [ 3 ] ? query [ 3 ] .innerText : "";
                        return {
                          mail : mail ,
                          phone : phone ,
                          fax : fax,
                          linkedIn : linkedIn ,
                        };
                      } )
                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ { ...item , ...more } ] );
                      let res = { ...item , ...more };
                      return resolve ( res );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

              await page.close ( );
              //socket.emit ( 'outgoing data' , results );
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function navitascapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'section.row.normal:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'span.mediumtitel' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'p > strong' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'article.part.right.twothird.text' ) .text ( ) ,
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              socket .emit ( 'outgoing data' , results )
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function shiftinvest ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.memberbox-inner:has(div.membertitle)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.membername' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'div.membertitle' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about    : $ ( item ) .find ( 'div.membertekst' ) .text ( ) ,
                      linkedIn    : $ ( item ) .find ( 'a.linkedinclass' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      browser.close ( );
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function zlto ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.personContent' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'div.slideHidden' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about    : $ ( item ) .find ( 'div.overlay > a' ) .prop ( 'href' ) ,
                      url    : $ ( item ) .find ( 'div.overlay > a' ) .prop ( 'href' )

                  } );
                } );
                return results;
              } , url );

              await Promise.all ( [ ...results .map ( ( item ) => {
                return new Promise ( async ( resolve , reject ) => {
                  try {
                    await check_if_canceled ( browser , monitor , socket );
                    const page = await browser.newPage ( );
                    await page.setRequestInterception ( true );
                    page.on ( 'request' , ( request ) => {
                      if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                          request .abort ( );
                      } else {
                          request .continue  ( );
                      }
                    } );
                    page.on ( 'error' , err => {
                      console.log ( 'error happen at the page: ' , err );
                    });
                    page.on ( 'pageerror' , pageerr => {
                      console.log ( 'pageerror occurred: ' , pageerr );
                    })
                    page.on('dialog', async dialog => {
                      console.log(dialog.message());
                      await dialog.dismiss();
                    });
                    await check_if_canceled ( browser , monitor , socket );
                    await page .goto ( item.about , {timeout:0} );
                    await check_if_canceled ( browser , monitor , socket );
                    item.about = await page.$$eval ( 'div.text > p' , ( query ) => {
                      function  paragraphs  ( array ) {
                        let paragraph = '';
                        array.forEach ( ( para ) =>{
                          paragraph += para.innerText += '\n';
                        } );
                        return paragraph;
                      }
                      return paragraphs ( query );
                    } )
                    item.phone = await page.$eval ( 'div.telephone' , ( query ) => {
                      return query.innerText;
                    } )
                    item.mail = await page.$eval ( 'div.emailtext' , ( query ) => {
                      return query.innerText ? query.innerText .replace ( 'E-mail:' , '' ) : '';
                    } )
                    await page.close (  );
                    socket.emit ( "outgoing data" , [ item ] );
                    return resolve ( item );
                  } catch ( e ) {
                    return reject ( e )
                  }
                });
              } ) ] )
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function newion ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.memberDetail.clearfix' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h1' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'span' ) .text ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      twitter : $ ( item ) .find ( 'li.twitter > a' ) .prop ( 'href' ),
                      linkedIn  : $ ( item ) .find ( 'li.linkedin > a' ) .prop ( 'href' ) ,
                      about  : $ ( item ) .find ( 'p' ) .text (  ) ,

                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              socket.emit ( 'outgoing data' , results )
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://www.newion.com/team/jingyi-wang/4` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] );
      //
      browser.close ( );
      monitor.confirm = true;
      //return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function nordian ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function npm_capital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.all-33.large-33.medium-50.small-50.tiny-100.push-left' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      url    : $ ( item ) .find ( 'a.npm-article.npm-article--team.align-center' ) .prop ( 'href' ) ,
                      about    : $ ( item ) .find ( 'a.npm-article.npm-article--team.align-center' ) .prop ( 'href' )
                  } );
                } );
                return results;
              } , url );
              await page.close ( );

              let i , j , chunk = 10;
              for ( i = 0 , j = 1; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      await page.setRequestInterception ( true );
                      page.on ( 'request' , ( request ) => {
                        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                            request .abort ( );
                        } else {
                            request .continue  ( );
                        }
                      } );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.all-100 > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } );
                      let more = await page.$$eval ( 'tr.row.clearfix > td > p > a' , ( query ) => {
                        console.log ( query )
                        let mail =  query [ 0 ] ? query [ 0 ] .href : "";
                        let linkedIn = query [ 1 ] ? query [ 1 ] .href : "";
                        return {
                          mail : mail.replace ( "mailto:" , '' ) ,
                          linkedIn : linkedIn ,
                        };
                      } );
                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ { ...item , ...more } ] );
                      return resolve ( { ...item , ...more } );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function oostnl ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.packery-item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.views-field.views-field-nothing' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'div.views-field.views-field-field-function' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      phone   : $ ( item ) .find ( 'div.field-content.contactpersoon-telefoon' ) .text ( ) ,
                      mail    : $ ( item ) .find ( 'div.field-content.contactpersoon-email' ) .text ( )
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              await check_if_canceled ( browser , monitor , socket );
              socket.emit ( 'outgoing data' , results );
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

      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function o2capital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.slick-guy.left' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'h3' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      url     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      about     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } , url );

              await Promise.all ( [ ...results .map ( ( item ) => {
                return new Promise ( async ( resolve , reject )=> {
                  try {
                    await check_if_canceled ( browser , monitor , socket );
                    const page = await browser.newPage ( );
                    await page.setRequestInterception ( true );
                    page.on ( 'request' , ( request ) => {
                      if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                          request .abort ( );
                      } else {
                          request .continue  ( );
                      }
                    } );
                    page.on ( 'error' , err => {
                      console.log ( 'error happen at the page: ' , err );
                    });
                    page.on ( 'pageerror' , pageerr => {
                      console.log ( 'pageerror occurred: ' , pageerr );
                    })
                    page.on('dialog', async dialog => {
                      console.log(dialog.message());
                      await dialog.dismiss();
                    });
                    await check_if_canceled ( browser , monitor , socket );
                    await check_if_canceled ( browser , monitor , socket );
                    await page .goto ( item.about , {timeout:0} );
                    await check_if_canceled ( browser , monitor , socket );
                    item.about = await page.$$eval ( 'div.column.half.left > p' , ( query ) => {
                      function  paragraphs  ( array ) {
                        let paragraph = '';
                        array.forEach ( ( para ) =>{
                          paragraph += para.innerText += '\n';
                        } );
                        return paragraph;
                      }
                      return paragraphs ( query );
                    } );
                    let more = await page.$$eval ( 'div.info.left' , ( query ) => {
                      console.log ( query )
                      let mail =  query [ 0 ] ? query [ 0 ] .innerText : "";
                      let linkedIn = query [ 1 ] ? query [ 1 ] .innerText : "";
                      return {
                        mail : mail ,
                        linkedIn : linkedIn ,
                      };
                    } );
                    await page.close (  );
                    item.mail = more.mail;
                    item.linkedIn = more.linkedIn;
                    socket.emit ( 'outgoing data' , [item] );
                    return resolve ( item )
                  } catch ( e ) {
                    return reject ( e );
                  }
                });
              } ) ] )

              await page.close ( );
              //socket.emit ( "outgoing data" , results )
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function parcomcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-md-3.col-sm-3' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h5' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .find ( 'p.title' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about  : $ ( item ) .find  ( 'div.content' ) .text ( )
                  } );
                } );
                return results;
              } , url );
              await page.close ( );
              await check_if_canceled ( browser , monitor , socket );
              socket.emit ( 'outgoing data' , results );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `https://www.parcomcapital.com/about/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] );
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function plainvanilla ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      let urls = [  ];
      const page = await browser .newPage ( );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                function  paragraphs  ( array ) {
                  let paragraph = '';
                  array.forEach ( ( para ) =>{
                    paragraph += para.innerText += '\n';
                  } );
                  return paragraph;
                }
                let results = [ ];
                //Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( 'div.wpb_wrapper > h1' ) .first ( ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( 'div.wpb_wrapper > h2' ) .first ( ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( 'div.vc_single_image-wrapper.vc_box_rounded.vc_box_border_grey > img' ) .first ( ) .prop ( 'src' ) ,
                      from    : url ,
                      about   : paragraphs ( document.querySelectorAll ( 'div.wpb_wrapper > p' ) ) ,
                      phone   : $ ( 'div.pv-contact-icons > a' ) .eq ( 1 ) .prop ( 'href' ) .replace ( 'tel:' , '' ) ,
                      mail   : $ ( 'div.pv-contact-icons > a' ) .eq ( 2 ) .prop ( 'href' ) .replace ( 'mailto:' , '' ) ,
                      linkedIn   : $ ( 'div.pv-contact-icons > a' ) .eq ( 3 ) .prop ( 'href' ) ,
                      //index   : index ,
                  } );
              //  }  );
                return results;
              } , url );
              await page.close ( );
              socket.emit ( 'outgoing data' , results )
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }

      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function pridecapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'a.team-item' ) .filter ( ':has(p > strong)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p > strong' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( '\n' ) [ 2 ] .trim ( )  ,
                      image   : $ ( item ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );

              await check_if_canceled ( browser , monitor , socket );
              let itemz = await page .$$ ( 'a.team-item' );

              let arr = new AsyncArray ( itemz );

              let filtered = await arr .filterAsync ( async ( item ) => {
                let test = await item .$$ ( "p > strong" );
                return test.length ;
              } )

              let index = 0;
              for ( item of filtered ){
                await check_if_canceled ( browser , monitor , socket );
                let parent$ = 'div.remodal.remodal-team.remodal-is-initialized.remodal-is-opened  ';

                while ( ! await page .$ ( parent$ + 'div.remodal-team-content' ) ){
                  await item.focus (  );
                  await item.click ( ) .catch ( console.log );
                  //console.log ( 'open jammed' );
                }

                results [ index ] .about = await page.$eval ( parent$ + 'div.remodal-team-content-inner'  ,
                async ( query ) => {
                  function  paragraphs  ( array ) {
                    let paragraph = '';
                    array.forEach ( ( para ) =>{
                      paragraph += para.innerText += '\n';
                    } );
                    return paragraph;
                  };
                  return paragraphs ( query .querySelectorAll ( 'p' ) );
                } );

                results [ index ] .mail = await page.$eval ( parent$ + 'a.email' ,
                async ( query ) => {
                  return query .href .replace ( "mailto:" , '' );
                } );


                await check_if_canceled ( browser , monitor , socket );

                let close = await page .$ ( parent$ + 'div.remodal-close' );

                let maxClose = 7;
                for ( var i = 0; i < maxClose ; i++ ) {
                  await close.click (  ) .then ( () => {
                    i = 8;
                  } ) .catch ( async ( e ) => {
                    console.log ( e + "  ...retrying close operation!!!! " + index )
                    await sleep ( 1500 );
                  } )
                }
                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                index++;
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function primeventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );;
              await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.row.fullheight' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.inner > h2' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'div.inner > h3' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item )  .find ( 'div.bg-image.left.parallax' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                      url     : $ ( item ) .find ( 'p.readmore > a' ) .prop ( 'href' ) ,
                      about     : $ ( item ) .find ( 'p.readmore > a' ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } , url );

              await Promise.all ( [ ...results .map ( ( item ) => {
                return new Promise ( async ( resolve , reject )=> {
                  try {
                    await check_if_canceled ( browser , monitor , socket );
                    const page = await browser.newPage ( );
                    await page.setRequestInterception ( true );
                    page.on ( 'request' , ( request ) => {
                      if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                          request .abort ( );
                      } else {
                          request .continue  ( );
                      }
                    } );
                    page.on ( 'error' , err => {
                      console.log ( 'error happen at the page: ' , err );
                    });
                    page.on ( 'pageerror' , pageerr => {
                      console.log ( 'pageerror occurred: ' , pageerr );
                    })
                    page.on('dialog', async dialog => {
                      console.log(dialog.message());
                      await dialog.dismiss();
                    });
                    await check_if_canceled ( browser , monitor , socket );
                    await check_if_canceled ( browser , monitor , socket );
                    await page .goto ( item.about , {timeout:0} );
                    await check_if_canceled ( browser , monitor , socket );
                    item.about = await page.$$eval ( 'div.inner.member > p' , ( query ) => {
                      function  paragraphs  ( array ) {
                        let paragraph = '';
                        array.forEach ( ( para ) =>{
                          paragraph += para.innerText += '\n';
                        } );
                        return paragraph;
                      }
                      return paragraphs ( query );
                    } );
                    let more = await page.$eval ( 'div.col.txt-right.width-25.contact-details > div.inner > p' , ( query ) => {
                      console.log ( query )
                      let datum = query.innerText .split  ('\n');
                      let mail =  datum [ 1 ];
                      let phone = datum [ 2 ];
                      return{
                        mail:mail,
                        phone:phone
                      } ;
                    } );
                    await page.close (  );
                    item.mail = more.mail;
                    item.phone = more.phone.replace ( "T " , '' );
                    socket.emit ( 'outgoing data' , [item] );
                    return resolve ( item )
                  } catch ( e ) {
                    return reject ( e );
                  }
                });
              } ) ] )
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function raboprivateequity ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: false } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              //await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );

              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-alt-item.active' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.title' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'div.subtitle' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( )  ,
                      image   : $ ( item )  .find ( 'img.team-alt-image' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );
              //await page.close ( );

              let itemz = await page .$$ ( 'div.team-alt-item.active' );
              let index = 0;
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );
                let parent$ = 'div.team-alt-popup-in-content  ';

                while ( ! await page .$ ( parent$ + 'div.team-alt-popup-content-right' ) ){
                  await item.focus (  );
                  await item.click ( ) .catch ( console.log );
                  //console.log ( 'open jammed' );
                }

                results [ index ] .about = await page.$eval ( parent$ + 'div.team-alt-popup-content-right'  ,
                  async ( query ) => {
                    function  paragraphs  ( array ) {
                      let paragraph = '';
                      array.forEach ( ( para ) =>{
                        paragraph += para.innerText += '\n';
                      } );
                      return paragraph;
                    };
                    return paragraphs ( query .querySelectorAll ( 'p' ) );
                } );

                let more = await page.$eval ( parent$ + 'div.team-alt-popup-content-left' ,
                  async ( query ) => {
                    let icons = query.querySelectorAll ( 'a' );
                    let mail = icons [ 1 ] .href .replace ( 'mailto:' , '' );
                    let linkedIn = icons [ 0 ] .href;
                    return {
                      mail:mail ,
                      linkedIn:linkedIn
                    };
                } );

                results [ index ].mail = more.mail;
                results [ index ].linkedIn = more.linkedIn;

                await check_if_canceled ( browser , monitor , socket );

                let close = await page .$ ( parent$ + 'i.icon.icon-close' );

                let maxClose = 7;
                for ( var i = 0; i < maxClose ; i++ ) {
                  await close.click (  ) .then ( () => {
                    i = 8;
                  } ) .catch ( async ( e ) => {
                    console.log ( e + "  ...retrying close operation!!!! " + index )
                    await sleep ( 1500 );
                  } )
                }
                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                index++;
              }

              await check_if_canceled ( browser , monitor , socket );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let urls = [ `http://raboprivateequity.com/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] );
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function riversideeurope ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      let urls = [ ];
      const page = await browser .newPage ( );
      await check_if_canceled ( browser , monitor , socket );
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
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'ul.listMembers' ) .children (  );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'a + a' ) .text ( )  .replace ( /[\t\n]+/g , ' ' ) .trim ( ) ,
                      job     : $ ( item ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( '\n' ) [ 7 ] .trim ( )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      url     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      about     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  } );
                }  );
                return results;
              } , url );

              let i , j , chunk = 10;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      await page.setRequestInterception ( true );
                      page.on ( 'request' , ( request ) => {
                        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                            request .abort ( );
                        } else {
                            request .continue  ( );
                        }
                      } );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'dd > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } )
                      await check_if_canceled ( browser , monitor , socket );
                      let more = await page.$eval ( '.officeDetail' , ( query ) => {
                        let query1 = query.querySelectorAll ( 'dd' ) ? query.querySelectorAll ( 'dd' ) : '';
                        let phone = query1 [ 1 ] ? query1 [ 1 ] .innerText : "";
                        let fax = query1 [ 2 ] ? query1 [ 2 ] .innerText : "";
                        return {
                          phone : phone ,
                          fax : fax,
                        };
                      } ).then ( ()=>{
                        item.fax = more.fax;
                        item.phone = more.phone;
                      } ).catch (console.log)

                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }

      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function setventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.gw-gopf-post:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'b' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'a:not(b)' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( ' - ' ) [ 1 ] .slice ( 0 , 45 ) .trim ( ) + "... "  ,
                      //
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'div.gw-gopf-post-excerpt > a' ) .prop ( "href" )  ,
                      url     : $ ( item ) .find ( 'div.gw-gopf-post-excerpt > a' ) .prop ( "href" )  ,
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 10;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      await page.setRequestInterception ( true );
                      page.on ( 'request' , ( request ) => {
                        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                            request .abort ( );
                        } else {
                            request .continue  ( );
                        }
                      } );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.et_pb_text_inner > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } )

                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function smile_invest (socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.vc_column-inner:has(h3 > a)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3 > a' ) .text ( )  ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) ,
                      //
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'div.wpb_wrapper > a' ) .prop  ( 'href' ) ,
                      url   : $ ( item ) .find ( 'div.wpb_wrapper > a' ) .prop  ( 'href' ) ,
                  } );
                } );
                return results;
              } , url );

              await check_if_canceled ( browser , monitor , socket );

              let i , j , chunk = 10;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      await page.setRequestInterception ( true );
                      page.on ( 'request' , ( request ) => {
                        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                            request .abort ( );
                        } else {
                            request .continue  ( );
                        }
                      } );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.wpb_text_column.wpb_content_element > div.wpb_wrapper' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } );

                      await page.$eval ( 'span.qode_icon_shortcode.q_font_awsome_icon.fa-lg > a' , ( query ) => {
                        return query ? query.href : "";
                      } ) .then ( (linkedIn) => {item.linkedIn = linkedIn } ).catch ( console.log )

                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function startgreen ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'tbody > tr > td:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  let mail = $ ( item ) .find ( 'a' ) .prop ( 'href' );
                  results.push ( {
                      name    : $ ( item ) .find ( 'strong' ) .text ( )  ,
                      job     : $ ( item ) .text ( )  .replace ( /[\t]+/g , ' ' ) .split ( '\n' ) [ 3 ] .trim ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                      mail   : mail ? mail.replace( 'mailto:' , '' ) : false  ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function seaminvestments ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      about  : $ ( item ) .find ( "div.wpb_wrapper" ) .text (  ) ,
                      phone  : $ ( item ) .find ( "div.aio-icon-description.ult-responsive" ) .eq ( 0 ) .text ( ) ,
                      linkedIn:  $ ( item ) .find ( "div.aio-icon-description.ult-responsive" ) .eq ( 1 ) .text ( ) ,
                      mail:  $ ( item ) .find ( "div.aio-icon-description.ult-responsive" ) .eq ( 2 ) .text ( ) ,

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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function strongrootcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.teamBlocks.content >  div.block.js-revealMe.js-revealed' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )   ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                      phone   : $ ( item ) .find ( 'ul.actions.fixHeight > li > a' ) .eq ( 0 ) .prop ( 'href' ) .replace ( "mailto:" , '' ) ,
                      mail   : $ ( item ) .find ( 'ul.actions.fixHeight > li > a' ) .eq ( 1 ) .prop ( 'href' ) .replace ( "tel:" , '' ) ,
                      linkedIn   : $ ( item ) .find ( 'ul.actions.fixHeight > li > a' ) .eq ( 2 ) .prop ( 'href' ) ,
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function thujacapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.intrinsic' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .text ( )   ,
                      job     : $ ('li.active-link') .text ( )   ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                      url    : $ ( item ) .find ( 'a' ) .prop ( 'href' )   ,
                      about    : $ ( item ) .find ( 'a' ) .prop ( 'href' )   ,
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 10;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );

                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.sqs-block-content > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } );

                      await page.$$eval ( 'div.sqs-block-content' , ( selector ) => {
                        let query = selector [ 1 ] .querySelectorAll ( 'a' );
                        console.log (query)
                        return {
                          phone : query [ 0 ] ? query [ 0 ].href : "" ,
                          mail  : query [ 1 ] ? query [ 1 ].href : ""
                        };
                      } ) .then ( ( obj ) => {
                        console.log(obj);
                        item.phone = obj.phone ,
                        item.mail = obj.mail
                      } ).catch ( console.log )

                      //await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      //browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function tiincapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.wf-cell.shown' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.team-author-name' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'p' ) .text ( )   ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                      mail  : $ ( item )  .find ( 'div.soc-ico > a' ) .prop ( 'href' ) .replace ( "mailto:" , '' )
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

      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function synergia ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-lid' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'span.name' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'span.function' ) .text ( )   ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'div.main > p' ) .text (  ) ,
                      mail   : $ ( item ) .find ( 'a#mail' ) .prop ( 'href' ) .replace ( 'mailto:' , '' ) ,
                      linkedin   : $ ( item ) .find ( 'a#linkedin' ) .prop ( 'href' )
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
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      await check_if_canceled ( browser , monitor , socket );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function torqxcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              page.on ( 'error' , err => {
                console.log ( 'error happen at the page: ' , err );
              });
              page.on ( 'pageerror' , pageerr => {
                console.log ( 'pageerror occurred: ' , pageerr );
              })
              page.on('dialog', async dialog => {
                console.log(dialog.message());
                await dialog.dismiss();
              });
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'div.hover-info.hidden-xs > h3' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'div.hover-info.hidden-xs > h4' ) .text ( )   ,
                      image   : $ ( item )  .find ( 'img' ) .prop ('src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );

              let itemz = await page .$$ ( 'div.item' );
              let index = 0;
              let parent$ = 'div.fuse-modal.activemodal#modal-item  ';
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );

                await item.focus ( );
                await item.click ( ) .catch ( console.log )

                while ( ! await page .$ ( parent$ + 'div.fuse-modal-closebtn.closemodal' ) ){
                  console.log ( 'open jammed ' + index );
                  await item.click ( ) .catch ( console.log );
                }
                results [ index ] .about = await page.$eval ( parent$ + 'div.item-content.animated.slow.fadeInUpSlow'  ,
                  async ( query ) => {
                    function  paragraphs  ( array ) {
                      let paragraph = '';
                      array.forEach ( ( para ) =>{
                        paragraph += para.innerText += '\n';
                      } );
                      return paragraph;
                    };
                    return paragraphs ( query .querySelectorAll ( 'p' ) );
                } );

                let more = await page.$eval ( parent$ + 'ul.contact-options' ,
                  async ( query ) => {
                    let icons = query.querySelectorAll ( 'li > a' );
                    let mail = icons [ 0 ] .href .replace ( 'mailto:' , '' );
                    let linkedIn = icons [ 1 ] .href;
                    return {
                      mail:mail ,
                      linkedIn:linkedIn
                    };
                } ).then ( ( obj ) => {
                  results [ index ] .mail = obj.mail ;
                  results [ index ] .linkedIn = obj.linkedIn ;
                })

                await check_if_canceled ( browser , monitor , socket );

                let close = await page .$ ( parent$ + 'div.fuse-modal-closebtn.closemodal' );

                let maxClose = 7;
                for ( var i = 0; i < maxClose ; i++ ) {
                  await close.click (  ) .then ( () => {
                    i = 8;
                  } ) .catch ( async ( e ) => {
                    console.log ( e + "  ...retrying close operation!!!! " + index )
                    await sleep ( 1500 );
                  } )
                }
                while ( await page .$ ( parent$ + 'div.fuse-modal-closebtn.closemodal' ) );
                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                index++;
              }

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
      await check_if_canceled ( browser , monitor , socket );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function vepartners ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team_item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3.title' ) .text ( )   ,
                      job     : $ ( item ) .find ( 'h2.subtitle' ) .text ( )   ,
                      image   : $ ( item )  .find ( 'div.image.equal_team' ) .css('background-image') .slice ( 4 , -1 ) .replace ( /"/g , "" ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'div.inner_text > p' ) .text ( )   ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function vendiscapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              page.on ( 'error' , err => {
                console.log ( 'error happen at the page: ' , err );
              });
              page.on ( 'pageerror' , pageerr => {
                console.log ( 'pageerror occurred: ' , pageerr );
              })
              page.on('dialog', async dialog => {
                console .log ( dialog .message ( ) );
                await dialog .dismiss ( );
              });
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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

              let itemz = await page .$$ ( 'div.team-member' );
              let index = 0;
              let parent$ = 'div.team-member.popup ';
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );

                await item.focus ( );
                await item.click ( ) .catch ( console.log );

                results [ index ] .about = await page.$eval ( parent$ + ' p.description'  ,
                  async ( query ) => {
                    return query .innerText;
                } );

                results [ index ] .phone = await page.$eval ( parent$ + 'span.team-tel'  ,
                  async ( query ) => {
                    return query .innerText;
                } );

                results [ index ] .mail = await page.$eval ( parent$ + 'span.team-email'  ,
                  async ( query ) => {
                    return query .innerText;
                } );

                results [ index ] .linkedIn = await page.$eval ( parent$ + 'ul.social.accent-color'  ,
                  async ( query ) => {
                    return query .querySelector ( 'li > a' ) .href;
                } ).catch ( console.log );

                await check_if_canceled ( browser , monitor , socket );

                let close = await page.$ ( parent$ + 'div.kruis' )
                await close.click (  ).catch ( console.log );

                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                index++;
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function victusparticipations ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_column.et_pb_column_1_4.et_pb_css_mix_blend_mode_passthrough:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p.et_pb_member_position' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about    : $ ( item ) .find ( 'div.et_pb_team_member_description > div' ) .text ( ) ,
                      linkedIn    : $ ( item ) .find ( 'ul.et_pb_member_social_links > li > a' ) .prop ( 'href' ) ,

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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function vortexcp ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team__item' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4.team-member__name' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p.team-member__function' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about    : $ ( item ) .find ( 'div.team-member > p' ) .text ( ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function transequity ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.et_pb_column.et_pb_column_1_3.et_pb_css_mix_blend_mode_passthrough:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4.et_pb_module_header' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p.et_pb_member_position' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'div.et_pb_team_member_description > p' ) .eq ( 1 ) .text ( ) ,
                      mail    : $ ( item ) .find ( 'div.et_pb_team_member_description > p' ) .eq ( 2 ) .text ( ) ,
                      linkedIn    : $ ( 'a.icon.et_pb_with_border' ) .eq ( index ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function wadinko ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'address.employee.employee--archive.flex.line-margin' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'span' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      phone    : $ ( item ) .find ( 'div.employee__phone' ) .text ( ) ,
                      mail    : $ ( item ) .find ( 'div.employee__mail' ) .text ( ) ,
                      linkedIn    : $ ( item ) .find ( 'div.employee__linkedin > a' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function waterland ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.member.fusion-layout-column.fusion_builder_column:has(img)' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2.title-heading-center' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      url     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 5;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      await page.setRequestInterception ( true );
                      page.on ( 'request' , ( request ) => {
                        if (  [ 'image' , 'font'  ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                            request .abort ( );
                        } else {
                            request .continue  ( );
                        }
                      } );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );

                      item.about = await page.$$eval ( 'div.post-content > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } );

                      item.about += await page.$$eval ( 'div.fusion-text > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                            let paragraph = '';
                            array.forEach ( ( para ) =>{
                              paragraph += para.innerText += '\n';
                          } );
                            return paragraph;
                          }
                        return paragraphs ( query );
                      } );
                      //await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function vpcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.so-widget-intracto-image-text-widget' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'span' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( item ) .find ( 'div.col-md-6.offset-lg-1' ) .text ( ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function impulszeeland ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-lg-6' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3.h4.card-title' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'h4.h6.card-subtitle' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      mail    : $ ( item ) .find ( 'ul.list-unstyled > li' ) .eq ( 0 ) .text (  ) ,
                      phone   : $ ( item ) .find ( 'ul.list-unstyled > li' ) .eq ( 1 ) .text (  ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function wmp ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
                      image   : $ ( item )  .find ( 'div.museBGSize.colelem' ) .css ( 'background-image' ) .slice ( 4 , -1 ) .replace ( /"/g , ''  ) ,
                      from    : url ,
                      index   : index ,
                      about    : $ ( `#${id}` ) .text ( ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function keadyn ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              page.on ( 'error' , err => {
                console.log ( 'error happen at the page: ' , err );
              });
              page.on ( 'pageerror' , pageerr => {
                console.log ( 'pageerror occurred: ' , pageerr );
              })
              page.on('dialog', async dialog => {
                console .log ( dialog .message ( ) );
                await dialog .dismiss ( );
              });
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              //await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.col-md-3.masonry-brick' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'strong' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'p' ) .text ( ) .replace ( '\n' , '' ) .trim (  )  .slice ( 0 , 55 ) + "...",
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );

              let itemz = await page .$$ ( 'div.col-md-3.masonry-brick  a.ajax-overlay' );
              console.log ( itemz.length );
              let index = 0;
              let parent$ = 'div.overlay-wrapper ';
              for ( item of Array.from ( itemz ) ){
                await check_if_canceled ( browser , monitor , socket );

                await item.focus ( );
                await item.click ( ) .catch ( console.log );

                while ( ! await page.$ ( parent$ + ' div.profile' ) ){
                  await check_if_canceled ( browser , monitor , socket );
                }

                results [ index ] .about = await page.$eval ( parent$ + ' div.profile'  ,
                  async ( query ) => {
                    return query .innerText;
                } );

                results [ index ] .linkedIn = await page.$eval ( parent$ + 'a.fa.fa-linkedin-square'  ,
                  async ( query ) => {
                    return query .href ? query .href : '';
                } ).catch ( console.log );

                await check_if_canceled ( browser , monitor , socket );

                let close = await page.$ ( parent$ + 'div.close-button' )
                await close.click (  ).catch ( console.log );

                while ( await page.$ ( parent$ + ' div.profile' ) ){
                  await check_if_canceled ( browser , monitor , socket );
                }

                await check_if_canceled ( browser , monitor , socket );
                socket.emit ( 'outgoing data' , [ results [ index ] ] )
                index++;
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function uniiq ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await page.setRequestInterception ( true );
              await check_if_canceled ( browser , monitor , socket );
              page.on ( 'request' , ( request ) => {
                if (  [ 'font' , 'image' ] .indexOf  ( request.resourceType  ( ) ) !== -1  ) {
                    request .abort ( );
                } else {
                    request .continue  ( );
                }
              } );
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.member' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'li.bold' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'li.bold + li' ) .text ( ) .replace ( '\n' , '' ) .trim (  ) ,
                      image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      phone   : $ ( item ) .find ( 'li.number > a' ) .prop ( 'href' ) .replace ( 'tel:' , '' )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function nascentventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
                      about    : $ ( item ) .find ( 'div.et_pb_team_member_description' ) .text ( ) ,
                      linkedIn    : $ ( item ) .find ( 'a.et_pb_font_icon.et_pb_linkedin_icon' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function mkbfondsen_flevoland ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
                      about   : $ ( item ) .find ( 'p.function + p' ) .text (  ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function vectrix ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn   : $ ( item ) .find ( 'a' ) .prop ( 'href' )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function aglaia_oncology ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );

              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      url     : $ ( item ) .find ( 'a.TeamItem' ) .prop ( 'href' ) ,
                      about     : $ ( item ) .find ( 'a.TeamItem' ) .prop ( 'href' ) ,
                  } );
                } );

                let advicser_items = $ ( 'div.Grid__col > table.responsive > tbody > tr > td > p:has(strong)' );
                Array.from ( advicser_items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      //item    : $ ( item ) .html ( ) ,
                      name    : $ ( item ) .find ( 'strong' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  ) ,
                      about     : $ ( item ) .text ( ) ,
                      //market  : $ ( item ) .find ( 'p.name-employee' ) .text ( )  .replace ( /[\t]+/g , ' ' ) .trim ( ) . split ( '\n' ) [ 2 ] ,
                      //image   : $ ( item )  .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                  } );
                } );
                return results;
              } , url );

              let resultz = results.filter ( item => item.url );
              let i , j , chunk = 10;
              for ( i = 0 , j = resultz.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...resultz .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );

                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.TeamDetail__content__block > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } );

                      item.linkedIn = await page.$eval ( 'div.linkedin > a' , ( selector ) => {
                        return selector.href;
                      } ) .catch ( console.log )

                      //await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

/*function sbicparticipations ( socket , monitor ) {
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              while ( true ){
                let next = page .$ ( 'div#next' );
                await next.click (  ).catch ( console.log );

              }
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}*/

function hollandstartup ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div#blocks_teammembers > ul > li' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2.block-title' ) .text ( ) ,
                      job     : $ ( item ) .find ( 'div.team-function' ) .text ( ) ,
                      image   : $ ( item )  .find ( 'div.post-image' ) .css ( 'background-image' ) .slice ( 4 , -1 )  .replace ( /"/g , '' ) ,
                      from    : url ,
                      index   : index ,
                      linkedIn : $ ( item ) .find ( 'a.broken_link' ) .prop ( 'href' )
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
      let urls = [ `https://hollandstartup.com/over-ons/ons-team` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function thenextwomen ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      mail    : $ ( item ) .find ( 'div.links > a' ) .eq ( 0 ) .prop ( 'href' )  ,
                      twitter    : $ ( item ) .find ( 'div.links > a' ) .eq ( 1 ) .prop ( 'href' )  ,
                      linkedIn    : $ ( item ) .find ( 'div.links > a' ) .eq ( 2 ) .prop ( 'href' )  ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

/*function liof ( ) {
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
}*/

function bfly ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn : $ ( item ) .find ( 'a' ) . eq ( 1 ) .prop ( 'href' )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function voccp ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'ul.slides:has(div.content-box > h2)' ) .children ( );
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  let id  = $ ( item ) .find ( 'a' ) .prop ( 'href' ) .split ( '#' ) [ 1 ];
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.content-box > h2' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.content-box > h4' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( '#'+id ) .find ( 'div.col-md-12.hc_text_block_cnt' ) .eq ( 0 ) .text (  )
                                + $ ( '#'+id ) .find ( 'div.col-md-12.hc_text_block_cnt' ) .eq ( 1 ) .text (  ) ,
                      linkedIn : $ ( item ) .find ( 'div.btn-group.social-group > a' ) .prop ( 'href' )

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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) );
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function blckprty ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      about    : $ ( item ) .find ( 'div.member-bio' ) .text ( ) ,
                      linkedIn    : $ ( item ) .find ( 'div.social-links > a' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function vcxc ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'div.member.hover' ) ;
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  let mail = $ ( item ) .find ( 'a.email' ) .prop ( 'href' );
                  results.push ( {
                      name    : $ ( item ) .find ( 'h2' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'em' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      phone   : $ ( item ) .find ( 'div.text' ) .text (  ) ,
                      mail   :  mail ? mail .replace ( 'mailto:' , '' ) : '' ,
                      linkedIn   : $ ( item ) .find ( 'a.linkedin' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function bom ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let items = $ ( 'article.employee.employee--overview' ) ;
                let results = [ ];
                Array.from ( items ).forEach ( ( item  , index ) => {
                  let phone = $ ( item ) .find ( 'div.employee__contact > a' ) .eq ( 0 ) . prop ( 'href' );
                  let mail = $ ( item ) .find ( 'div.employee__contact > a' ) .eq ( 1 ) . prop ( 'href' );
                  results.push ( {
                      name    : $ ( item ) .find ( 'h1' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p.employee__role' ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      market  : $ ( item ) .find ( 'p.employee__departments' ) .text ( ) ,
                      from    : url ,
                      index   : index ,
                      linkedIn    : $ ( item ) .find ( 'div.employee__share > a' ) .prop ( 'href' ) ,
                      mail    :  mail ? mail.replace ( 'mailto:' , '' ) : '',
                      phone    : phone ? phone.replace ( 'tel:' , '' ) : '' ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

//http://www.zeeuwsinvesteringsfonds.com/about-us.html    ---->>  116

function dsif ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn : $ ( item ) .find ( 'div.x-text > a' ) .prop ( 'href' )
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
                      linkedIn : $ ( item ) .find ( 'div.x-text > a' ) .prop ( 'href' ) ,
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
                      linkedIn : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( "outgoing data" , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function brooklyn_ventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      about   : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      url   : $ ( item ) .find ( 'a' ) .prop ( 'href' )
                  } );
                } );
                return results;
              } , url );

              let resultz = results.filter ( item => item.url );
              let i , j , chunk = 10;
              for ( i = 0 , j = resultz.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...resultz .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.sqs-block-content > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } );

                      item.linkedIn = await page.$eval ( 'a.sqs-block-button-element--small.sqs-block-button-element' , ( selector ) => {
                        return selector.href;
                      } ) .catch ( console.log )

                      //await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function biogenerationventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      socket.emit ( "logs" , "request has been received!" )
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true , } );
      await check_if_canceled ( browser , monitor , socket );
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
      await check_if_canceled ( browser , monitor , socket );
      await check_if_canceled ( browser , monitor , socket );
      await page .goto ( `https://www.biogenerationventures.com/team/` , { timeout : 0 , } );
      await page .addScriptTag ( { path: 'jquery.js'  } );
      await check_if_canceled ( browser , monitor , socket );
      await autoScroll ( page );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let mail  = $ ( 'span.functie > a' ) .eq ( 0 ) .text ( ) ;
                //let len = $ ( 'span.functie' ).length;
                let results = [ ];
                results.push ( {
                  name    : $ ( 'div.et_pb_text_inner > h1' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                  job     : $ ( 'div.et_pb_text_inner > h4' ) .eq ( 0 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                  image   : $ ( 'span.et_pb_image_wrap > img' ) .first (  ) .prop ( 'src' ) ,
                  from    : url ,
                  about   : $ ( 'div.et_pb_row.et_pb_row_1' ) .eq ( 0 ) .text ( ) ,
                  mail   : mail ,
                  phone   : $ ( 'p > span.functie' ) .eq ( 0 ) .text ( ) .replace ( 'Phone:' , '' ) .replace ( mail , '' ) ,
                  linkedIn : $ ( 'a.icon.et_pb_with_border' ) .prop ( 'href' )
                } );
                return results;
              } , url );
              socket.emit ( 'outgoing data' , results );
              await page.close ( );
              return resolve ( results )
            }catch ( e ){
              return reject ( e )
            }
        } )
      }
      let i , j , chunk = 5 , datas = [ ];
      //var datas1 , datas2;
      for ( i = 0 , j = urls.length; i < j; i += chunk ) {
        //.slice ( i , i+chunk )
        await check_if_canceled ( browser , monitor , socket );
        console.log ( "chunk --> " + i  );
        datas = datas.concat ( await Promise .all ( [ ...urls .slice ( i , i + chunk ) .map ( crawlUrl ) ] ) );
      }
      //
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function socialimpactventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'section.teamsection' ) .children ( ) ;
                Array.from ( items ).forEach ( ( item  , index ) => {
                  let id = $ ( item ) .find ( 'button.btn' ) .attr ( 'data-target' );
                  let mail = $ ( id + " a" ) .eq ( 1 ) . prop ( 'href' );
                    results.push ( {
                      name    : $ ( item ) .find ( 'p' ) .eq ( 1 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p' ) .eq ( 2 ) .text ( ) .replace ( /[\t\n]/g ,'' ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( id + " table" ) .text (  ),
                      linkedIn : $ ( id + " a" ) .eq ( 0 ) . prop ( 'href' ) ,
                      mail :  mail ? mail.replace ( 'mailto:' , '' ) : '',
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function henq ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn : $ ( item ) .find ( 'span.q_social_icon_holder.normal_social > a' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function volta ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      url     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      about     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 5;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.s-component-content.s-font-body > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return paragraphs ( query );
                      } );

                      item.linkedIn = await page.$eval ( 'div.s-component-content.s-font-body > p > a' , ( selector ) => {
                        return selector.href;
                      } ).catch ( console.log )
                      //await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function slingshot ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
                      url     : $ ( item ) .find ( 'a.vc_gitem-link.vc-zone-link' ) .prop ( 'href' ) ,
                      about     : $ ( item ) .find ( 'a.vc_gitem-link.vc-zone-link' ) .prop ( 'href' )
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 5;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.wpb_text_column.wpb_content_element' , ( query ) => {
                        return  query [ 1 ] .innerText;
                      } );

                      item.linkedIn = await page.$eval ( 'div.wpb_raw_code.wpb_content_element.wpb_raw_html > div.wpb_wrapper > a' , ( selector ) => {
                        return selector.href;
                      } ).catch ( console.log )

                      item.mail = await page.$eval ( 'div.wpb_wrapper > p > a' , ( selector ) => {
                        return selector.href;
                      } ).catch ( console.log )
                      //await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

/*function shiftinvest ( ) {
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
}*/

function peak ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn : $ ( item ) .find ( 'a.fusion-social-network-icon.fusion-tooltip.fusion-linkedin.fusion-icon-linkedin' ) .eq ( 0 ) .prop ( 'href' ) ,
                      twitter : $ ( item ) .find ( 'a.fusion-social-network-icon.fusion-tooltip.fusion-twitter.fusion-icon-twitter' ) .eq ( 0 ) .prop ( 'href' ) ,
                      about  :  $ ( item ) .find ( 'div.fusion-text' ) .text ( ),
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
      let urls = [ `https://peak.capital/about/` ];
      let datas = await Promise.all ( [  ...urls. map ( crawlUrl ) ] ) .catch ( e => { console.log ( e ) } );
      //
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function capitalmills ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function mainportinnovationfund ( socket , monitor  ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      mail    : $ ( item ) .find ( 'div.fundmanager' ) .eq ( 0 ) .text ( ) .split ( '.' ) [ 1 ] ,
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
                      mail    : $ ( item ) .find ( 'span > p' ) .eq ( 1 ) .text ( )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function investion ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn : $ ( item ) .find ( 'a.about-profile-link.w-inline-block' ) .eq ( 0 ) .prop ( 'href' )   ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function inkefcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
      //specific to website
      function crawlUrl ( url ) {
          return new Promise ( async ( resolve , reject ) => {
            try{
              let results = [ ];
              const page = await browser .newPage ( );
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              //await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.member-box' );
                let modal = $ ( 'div.team-member.white' );
                Array.from ( items ).forEach ( ( item  , index ) => {

                  results.push ( {
                      name    : $ ( item ) .find ( 'span.name' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'span.job-title' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'div.member-picture' ) .css ( 'background-image' ) .slice ( 4 , -1 )  .replace ( /"/g , '' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( modal [ index ] ) .find ( 'div.text' ) .text (  ) ,
                      linkedIn   : $ ( modal [ index ] ) .find ( 'a.medium-text.bold white' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function icoscapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let element = $ ( 'div.czr-wp-the-content' );

                let credentials = $ ( element ) .find ( 'h4' ) .eq ( 0 ) .text ( ) .replace ( /[\n]/g , ',' )  .trim (  ) .split ( ',' );
                if ( ! credentials .join ( ) )
                    credentials = $ ( element ) .find ( 'h4' ) .eq ( 2 ) .text ( ) .replace ( /[\n]/g , ',' )  .trim (  ) .split ( ',' );
                if ( ! credentials .join ( ) )
                    credentials  = $ ( element ) .find ( 'p' ) .eq ( 0 ) .text ( ) .replace ( /[\n]/g , ',' )  .trim (  ) .split ( ',' );

                let linkedIn = $ ( element ) .find ( 'a' ) .eq ( 0 ) .text (  );
                let phone  = $ ( element ) .text (  ) .split ( '\n' ) .filter ( item => item.trim ( ) );
                let mail = phone.filter ( s => s .includes ( "(at)" ) ) .pop (  );

                results.push ( {
                    name    :  credentials .shift (  ),
                    job     : credentials .join ( ) ,
                    image   :  $ ( element ) .find ( 'a > img' ) .eq ( 0 ) .prop ( 'src' ) ,
                    from    : url ,
                    linkedIn : linkedIn ? linkedIn : $ ( element ) .find ( 'a' ) .eq ( 1 ) .text (  ) ,
                    phone: phone.filter ( s => s .includes ( "+" ) ) .pop (  ) ,
                    mail:  mail ? mail .replace ( '(at)' , '@' ) : '' ,
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
      let i , j , chunk = 5 , datas = [ ];
      //var datas1 , datas2;
      for ( i = 0 , j = urls.length; i < j; i += chunk ) {
        //.slice ( i , i+chunk )
        await check_if_canceled ( browser , monitor , socket );
        console.log ( "chunk --> " + i  );
        datas = datas.concat ( await Promise .all ( [ ...urls .slice ( i , i + chunk ) .map ( crawlUrl ) ] ) );
      }
      //
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}/*taking too long to load*/

function ogc_partners ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                results.push ( {
                    name    : $ ( 'div#comp-jg6fvxqn > h2.font_2 > span.color_12' ) .eq ( 0 ) .text (  )  ,
                    job     : "co-founder and Partner" ,
                    image   : $ ( 'img#comp-jg6fvxqeimgimage' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                    about   : $ ( 'div#comp-jg6fvxq6' ) .eq ( 0 ) .text (  ) ,
                    mail    : $ ( 'a.auto-generated-link' ) .eq ( 0 ) .text (  ) ,
                    phone    : $ ( 'div#comp-jg6fvxq6' ) .eq ( 0 ) .text (  ) .split ( 'Tel:' ) [ 1 ] .trim ( ) ,
                } );
                results.push ( {
                    name    : $ ( 'div#comp-jg6fvxqv > h2.font_2 > span.color_12' ) .eq ( 0 ) .text (  )  ,
                    job     : "co-founder and Partner" ,
                    image   : $ ( 'img#comp-jg6fvxr3imgimage' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                    about   : $ ( 'div#comp-jg6fvxrb' ) .eq ( 0 ) .text (  ) ,
                    mail    : $ ( 'a.auto-generated-link' ) .eq ( 1 ) .text (  ) ,
                    phone    : $ ( 'div#comp-jg6fvxrb' ) .eq ( 0 ) .text (  ) .split ( 'Tel:' ) [ 1 ] .trim (  ),
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function investinfuture ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      linkedIn :  $ ( item ) .find ( 'a' ) .prop ( 'href' )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function otterlooventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                results.push ( {
                    name    : "Sieuwert van Otterloo"  ,
                    job     : "Founder" ,
                    image   : $ ( 'img.alignleft' ) .eq ( 0 ) .prop ( 'src' )  ,
                    from    : url ,
                    about   :$ ( 'div.entry-content' ) .eq ( 0 ) .text (  )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

/*function solidventures ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}*/

function doen ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      return reject ( e );
    }
  })
}

function endeit ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.team-slide' );
                let modal = $ ( 'div.team-slide' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'div.bio-title' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'div.bio-function' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( modal [ index ] ) .find ( 'div.bio-entry' ) .text (  ) ,
                      linkedIn   : $ ( modal [ index ] ) .find ( 'a.bio-linkedin.no-ajax' ) .prop ( 'href' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function keenventurepartners ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      url    : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      about    : $ ( item ) .find ( 'a' ) .prop ( 'href' )
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 5;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.content-padding' , ( query ) => {
                        return  query [ 1 ] .innerText;
                      } );

                      item.linkedIn = await page.$eval ( 'a.linkedin' , ( selector ) => {
                        return selector.href;
                      } ).catch ( console.log )

                      item.mail = await page.$eval ( 'a.email' , ( selector ) => {
                        return selector.href ? selector.href.replace ( 'mailto:' , '' ) : '';
                      } ).catch ( console.log )
                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
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

function catenainvestments ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
            await check_if_canceled ( browser , monitor , socket );
            await page .goto ( url , { timeout : 0 , } );
            await page .addScriptTag ( { path: 'jquery.js'  } );
            await check_if_canceled ( browser , monitor , socket );
            await autoScroll ( page );
            await check_if_canceled ( browser , monitor , socket );
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
                    linkedIn    : $ ( item ) .find ( 'a.et_pb_font_icon.et_pb_linkedin_icon' ) .prop ( 'href' )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function anterracapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await check_if_canceled ( browser , monitor , socket );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      url    : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      about    : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 5;
              for ( i = 0 , j = results.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...results .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.sqs-block-content > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return  paragraphs ( query );
                      } );

                      await page.$$eval ( 'div.intrinsic' , ( selector ) => {
                        let mail =  selector [ 1 ] ? selector [ 1 ] .querySelector ( 'a' ) : false ;
                        let linkedIn = selector [ 0 ].querySelector ( 'a' );
                        return {
                          mail : mail ? mail .href ? mail .href .replace ( 'mailto:' , '' ) : '' : '' ,
                          linkedIn: linkedIn ? linkedIn .href : '' ,
                        };
                      } ) .then ( ( obj ) => {
                        item.mail = obj.mail;
                        item.linkedIn = obj.linkedIn;
                      } ).catch ( console.log )


                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function walvis ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'span.tab__link.tab__col ' );
                let modal = $ ( 'div.tab__content' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  results.push ( {
                      name    : $ ( item ) .find ( 'h4.team__name' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      job     : $ ( item ) .find ( 'p.team__job' ) .eq ( 0 ) .text ( ) .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( modal [ index ] ) .find ( 'div.team__info' ) .text ( ) ,
                      mail    : $ ( modal [ index ] ) .find ( 'a' ) .prop ( 'href' ) .replace ( 'mailto:' , '' ) ,
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function percivalparticipations ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function o2investment ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
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
                      url     : $ ( item ) .find ( 'a' ) .prop ( 'href' ) ,
                      about     : $ ( item ) .find ( 'a' ) .prop ( 'href' )
                  } );
                } );
                return results;
              } , url );

              let i , j , chunk = 5;
              let resultz = results.filter ( item => item.about  );
              for ( i = 0 , j = resultz.length; i < j; i += chunk ) {
                //.slice ( i , i+chunk )
                console.log ( "chunk --> " + i  )
                await Promise.all ( [ ...resultz .slice ( i , i + chunk ) .map ( ( item ) => {
                  return new Promise ( async ( resolve , reject )=> {
                    try {
                      await check_if_canceled ( browser , monitor , socket );
                      const page = await browser.newPage ( );
                      page.on ( 'error' , err => {
                        console.log ( 'error happen at the page: ' , err );
                      });
                      page.on ( 'pageerror' , pageerr => {
                        console.log ( 'pageerror occurred: ' , pageerr );
                      })
                      page.on('dialog', async dialog => {
                        console.log(dialog.message());
                        await dialog.dismiss();
                      });
                      await check_if_canceled ( browser , monitor , socket );
                      await page .goto ( item.about , {timeout:0} );
                      await check_if_canceled ( browser , monitor , socket );
                      item.about = await page.$$eval ( 'div.col-xs-12.col-md-9 > p' , ( query ) => {
                        function  paragraphs  ( array ) {
                          let paragraph = '';
                          array.forEach ( ( para ) =>{
                            paragraph += para.innerText += '\n';
                          } );
                          return paragraph;
                        }
                        return  paragraphs ( query );
                      } );

                      item.phone = item.about.split ( '\nemail' ) [ 0 ] .replace ( 'phone:' , '' ) ;

                      item.mail = item.about.split ( '\nemail' ) [ 1 ] .split ( '\n' ) [ 0 ] ;
                      await page.close (  );
                      socket.emit ( 'outgoing data' , [ item ] );
                      return resolve ( item );
                    } catch ( e ) {
                      return reject ( e );
                    }
                  });
                } ) ] )
              }

              results.filter ( item => ! item.about  ).forEach ( ( card ) => {
                socket.emit ( 'outgoing data' , [ card ] )
              } )
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
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function cleverclover ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
              await check_if_canceled ( browser , monitor , socket );
              await page .goto ( url , { timeout : 0 , } );
              await page .addScriptTag ( { path: 'jquery.js'  } );
              await check_if_canceled ( browser , monitor , socket );
              await autoScroll ( page );
              await check_if_canceled ( browser , monitor , socket );
              results = await page.evaluate ( ( url ) => {
                let results = [ ];
                let items = $ ( 'div.awsm-grid-list.awsm-grid-card' );
                Array.from ( items ).forEach ( ( item  , index ) => {
                  let id = $ ( item ) .attr ( 'data-griddercontent' );
                  results.push ( {
                      name    : $ ( item ) .find ( 'h3' ) .eq ( 0 ) .text ( )  .trim (  )  ,
                      job     : $ ( item ) .find ( 'span' ) .eq ( 0 ) .text ( )  .trim (  )  ,
                      image   : $ ( item ) .find ( 'img' ) .prop ( 'src' )  ,
                      from    : url ,
                      index   : index ,
                      about   : $ ( id ) .find  ( 'div.awsm-content-scrollbar' ) .text (  ) ,
                      linkedIn : $ ( id ) .find ( 'div.awsm-social-icons > span > a' ) .prop ( 'href' )
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
      await check_if_canceled ( browser , monitor , socket );
      socket.emit ( 'outgoing data' , [ ] .concat ( ...datas ) )
      browser.close ( );
      monitor.confirm = true;
      return resolve ( [ ] .concat ( ...datas ) );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function runatlanticcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "http://www.atlanticcapital.nl/nl/wie-zijn-wij" , { timeout : 0 , } );
        await check_if_canceled ( browser , monitor , socket );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let datum =  document .querySelector ( 'div.field-item.even' ) ;
            results .push ( {
              about  : datum .querySelectorAll ( 'p' ) [ 4 ] .innerText ,
              mail  : datum .querySelectorAll ( 'p' ) [ 5 ] .querySelector ( 'a' ) .innerText ,
              phone : datum .querySelectorAll ( 'p' ) [ 5 ] .innerText
                        .replace ( datum .querySelectorAll ( 'p' ) [ 5 ] .querySelector ( 'a' ) .innerText  ,'' ) .trim (  ) ,
              image : datum .querySelectorAll ( 'p' ) [ 4 ] .querySelector ( 'img' ) .src ,
              name :  datum .querySelectorAll ( 'p' ) [ 4 ] .querySelector ( 'u' ) .innerText ,
            } )

            results .push ( {
              about  : datum .querySelectorAll ( 'p' ) [ 7 ] .innerText ,
              mail  : datum .querySelectorAll ( 'p' ) [ 8 ] .querySelector ( 'a' ) .innerText ,
              phone : datum .querySelectorAll ( 'p' ) [ 8 ] .innerText
                        .replace ( datum .querySelectorAll ( 'p' ) [ 8 ] .querySelector ( 'a' ) .innerText  ,'' ) .trim (  ) ,
              image : datum .querySelectorAll ( 'p' ) [ 7 ] .querySelector ( 'img' ) .src ,
              name :  datum .querySelectorAll ( 'p' ) [ 7 ] .querySelector ( 'u' ) .innerText ,
            } )

            return results;
          } );
        }
      }
      //
      browser.close ( );
      await socket .emit ( 'outgoing data' , urls );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
      return reject ( e );
    }
  })
}

function beekcapital ( socket , monitor ) {
  return new Promise ( async ( resolve , reject ) => {
    try {
      const browser = await puppeteer.launch ( { args: [ '--no-sandbox' , '--disable-setuid-sandbox' ] , headless: true } );
      await check_if_canceled ( browser , monitor , socket );
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
        await check_if_canceled ( browser , monitor , socket );
        await page .goto ( "https://www.beekcapital.nl/#profiel" , { timeout : 0 , } );
        await page .addScriptTag ( { path: 'jquery.js'  } );
        await check_if_canceled ( browser , monitor , socket );
        await autoScroll ( page );
        {
          urls = await page.evaluate ( ( ) => {
            let results = [ ];
            let datum = $ ( 'div.vc_column-inner:has(a.center:has(img))' ) ;
            Array.from ( datum ) .slice ( 1 , 3 ) .forEach ( ( item ) => {
              results.push ( {
                image : $ ( item ) .find ( 'img' ) .prop ( 'src' ) ,
                name  : $ ( item ) .find ( 'div.wpb_wrapper  p' ) .eq ( 0 ) .text ( ) ,
                mail  : $ ( item ) .find ( 'div.wpb_wrapper  p' ) .eq ( 1 ) .text ( ) ,
                linkedIn :  $ ( item ) .find ( 'div.inner > a.center' ) .eq ( 0 ) .prop ( 'href' ) ,
                about : $ ( item ) .find ( 'div.wpb_wrapper > p' ) . text ( )

              } )
            } )
            return results;
          } );
        }
      }
      //
      browser.close ( );
      await socket .emit ( 'outgoing data' , urls );
      monitor.confirm = true;
      return resolve ( urls );
    } catch ( e ) {
      monitor.confirm = true;
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
  var address = socket.handshake.headers [ 'x-forwarded-for' ];
  var port = socket.handshake.headers [ 'x-forwarded-port' ];
  console.log ( 'New connection from ' + address + ':' + port );
  console.log ( geoip .lookup ( address ) );

  let monitor = { cancel: false , confirm: true };

  const sync_ = async ( ) => {
    monitor .cancel = true;
    while ( ! monitor .confirm ){
      await sleep ( 50 );
    }
    monitor = { cancel: false , confirm: false };
    return monitor;
  }

  //o2investment ( socket , { cancel: false , confirm: false } ) .then ( console.log ).catch ( console.log );

  socket .on ( "1" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      run3i ( socket , prefect )
        .then ( console .log )
          .catch ( console.error );
    }
  );

  socket .on ( "2" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runaacc ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
    }
  );

  socket .on ( "3" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      run5sq ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
    }
  );

  socket .on ( "4" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runactivecapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
    }
  );

  socket .on ( "5" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runadventinternational ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "6" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runalpinvest ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "7" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runantea ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "8" ,
    async function ( data ) {
      let prefect = sync_ (  );
      console.log ( data );
      runbaincapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "9" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      runbbcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "10" ,
   async function ( data ) {
    let prefect = await sync_ ( );
    console.log ( data );
    runavedoncapital ( socket , prefect )
      .then ( console.log )
        .catch ( console.error );
  } );

  socket .on ( "11" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runbolsterinvestments ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "12" ,
    async function ( data ) {
      let prefect = await sync_ ( )
      console.log ( data );
      runbridgepoint ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "13" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runbrightlandsventurepartners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "14" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runcapitalapartners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "15" ,
    async function ( data ) {
      let prefect = await sync_ ( )
      console.log ( data );
      runcinven ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "16" ,
    async function ( data ) {
      let  prefect = await sync_ ( );
      console.log ( data );
      committedcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "17" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      cottonwood ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "18" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      cvc ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "19" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      dehogedennencapital ( socket , prefect )
        .then ( console.error )
          .catch ( console.error );
  } );

  socket .on ( "20" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      delftenterprises ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "21" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      ecart ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "22" ,
    async function ( data ) {
      console.log ( data );
      let prefect = await sync_ (  );
      egeria ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "23" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      eqtpartners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "24" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      forbion ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "25" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      gembenelux ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "26" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      gilde ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "27" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      gildehealthcare ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "28" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      gimv ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "29" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      healthinnovations ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "30" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      healthinvestmentpartners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "31" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      hollandcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "32" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      horizonflevoland ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "33" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      hpegrowth ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "34" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      ibsca ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "35" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      innovationquarter ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "36" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      karmijnkapitaal ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "37" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      kkr ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "38" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      llcp ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "39" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      liof ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "40" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      lspvc ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "41" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      main ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "42" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      mgf ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "43" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      menthacapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "44" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      nom ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "45" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      navitascapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "46" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      shiftinvest ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "47" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      zlto ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "48" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      newion ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "49" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      nordian ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "50" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      npm_capital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "51" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      oostnl ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "52" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      o2capital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "53" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      parcomcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "54" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      plainvanilla ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "55" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      pridecapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "56" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      primeventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "57" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      raboprivateequity ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "58" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      riversideeurope ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "59" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      setventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "60" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      smile_invest ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "61" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      startgreen ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "62" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      seaminvestments ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "63" ,
    async function ( data ) {
      console.log ( data );
      let prefect = await sync_ (  );
      strongrootcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "64" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      thujacapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "65" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      tiincapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "66" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      synergia ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "67" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      torqxcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "68" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      vepartners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "69" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      vendiscapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "70" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      victusparticipations ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "71" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      vortexcp ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "72" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      transequity ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "73" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      wadinko ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "74" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      waterland ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "75" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      vpcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "76" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      impulszeeland ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "77" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      wmp ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "78" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      keadyn ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "79" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      uniiq ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "80" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      nascentventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "81" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      mkbfondsen_flevoland ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "82" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      vectrix ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "83" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      aglaia_oncology ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "84" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      sbicparticipations ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "85" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      hollandstartup ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "86" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      thenextwomen ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "87" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      liof ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "88" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      bfly ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "89" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      voccp ( socket , prefect )
        .then ( console.lgo )
          .catch ( console.error );
  } );

  socket .on ( "90" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      blckprty ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "91" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      vcxc ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "92" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      bom ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "93" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      dsif ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "94" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      brooklyn_ventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "95" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      biogenerationventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "96" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      socialimpactventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "97" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      henq ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "98" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      volta ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "99" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      slingshot ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "100" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      shiftinvest ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "101" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      peak ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "102" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      capitalmills ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "103" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      mainportinnovationfund ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "104" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      investion ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "105" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      inkefcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "106" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      icoscapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "107" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      ogc_partners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "108" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      investinfuture ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "109" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      otterlooventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "110" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      solidventures ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "111" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      doen ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "112" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      endeit ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "113" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      keenventurepartners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "114" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      filsa ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "115" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      catenainvestments ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "116" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      anterracapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "117" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      walvis ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "118" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      percivalparticipations ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "119" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      o2investment ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "120" ,
    async function ( data ) {
      let prefect = await sync_ (  );
      console.log ( data );
      cleverclover ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "121" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      runatlanticcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "122" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      beekcapital ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "disconnect" , () => {
      console.log ( "Client disconnected");
      sync_ ( );
  } );
});

server .listen ( port , () => console.log ( `Listening on port ${port}` ) );
