
let monitor = { cancel: false , confirm: true };

const sync_ = async ( ) => {
  monitor .cancel = true;
  while ( ! monitor .confirm ){
    await sleep ( 50 );
  }
  monitor = { cancel: false , confirm: false };
  return monitor;
}


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

  socket .on ( "123" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      velociyfintech ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "124" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      pulsarpartners ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "125" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      axivate ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "126" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      zeeuwsinvesteringsfonds ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );

  socket .on ( "127" ,
    async function ( data ) {
      let prefect = await sync_ ( );
      console.log ( data );
      sbicparticipations ( socket , prefect )
        .then ( console.log )
          .catch ( console.error );
  } );
