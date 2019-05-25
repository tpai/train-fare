const stations = [{"value":"BC_","label":"Bologna"},{"value":"BLZ","label":"Bolzano"},{"value":"BSC","label":"Brescia"},{"value":"DSG","label":"Desenzano"},{"value":"F__","label":"Ferrara"},{"value":"SMN","label":"Firenze SMN"},{"value":"MI0","label":"Milano (Tutte)"},{"value":"MC_","label":"Milano Centrale"},{"value":"RRO","label":"Milano Rho Fiera"},{"value":"RG_","label":"Milano Rog"},{"value":"NAF","label":"Napoli Afragola"},{"value":"NAC","label":"Napoli C.le"},{"value":"PD_","label":"Padova"},{"value":"PSY","label":"Peschiera"},{"value":"AAV","label":"Reggio Emilia AV"},{"value":"RM0","label":"Roma (Tutte)"},{"value":"RMT","label":"Roma Termini"},{"value":"RTB","label":"Roma Tib"},{"value":"RVR","label":"Rovereto"},{"value":"R__","label":"Rovigo"},{"value":"SAL","label":"Salerno"},{"value":"TOP","label":"Torino P.Nuova"},{"value":"OUE","label":"Torino P.Susa"},{"value":"TCN","label":"Trento"},{"value":"VE0","label":"Venezia (Tutte)"},{"value":"VEM","label":"Venezia Mestre"},{"value":"VSL","label":"Venezia S.Lucia"},{"value":"VPN","label":"Verona P.N."},{"value":"VIC","label":"Vicenza"}];
const classes = [{label:"All",value:"O"},{label:"Smart",value:"S"},{label:"Prima",value:"P"},{label:"Comfort",value:"T"},{label:"Club",value:"C"}];
const services = [{label:"All",value:null,belongsTo:"S"},{label:"All",value:null,belongsTo:"P"},{label:"All",value:null,belongsTo:"T"},{label:"All",value:null,belongsTo:"C"},{label:"All",value:null,belongsTo:"O"},{label:"Promo",value:"H",belongsTo:"S"},{label:"Low Cost",value:"U",belongsTo:"S"},{label:"Economy",value:"T",belongsTo:"S"},{label:"Flex",value:"N",belongsTo:"S"},{label:"Low Cost",value:"B1",belongsTo:"P"},{label:"Economy",value:"M1",belongsTo:"P"},{label:"Flex",value:"G",belongsTo:"P"},{label:"Low Cost",value:"S",belongsTo:"T"},{label:"Economy",value:"F",belongsTo:"T"},{label:"Flex",value:"Z",belongsTo:"T"},{label:"Economy",value:"X",belongsTo:"C"},{label:"Flex",value:"A",belongsTo:"C"}];

(function() {
  let backup;
  let sig;

  const isRound = document.querySelector('#is_round');
  const returnDate = document.querySelector('#return_date');

  isRound.addEventListener('click', () => {
    if (isRound.checked) {
      returnDate.style = 'display: block';
    } else {
      returnDate.style = 'display: none';
    }
  });

  const depart = document.querySelector('#depart');
  const arrival = document.querySelector('#arrival');

  window.onload = () => depart.focus();

  const classSelector = document.querySelector('#class');
  const serviceSelector = document.querySelector('#service');

  classSelector.addEventListener('change', e => {
    serviceSelector.innerHTML = getServices(e.target.value);
  });
  serviceSelector.innerHTML = getServices(classSelector.value);

  const form = document.querySelector('#form');
  const submit = document.querySelector('#submit');
  const share = document.querySelector('#share');
  const result = document.querySelector('#result');
  const username = document.querySelector('#username');
  const password = document.querySelector('#password');

  new ClipboardJS(share);
  share.addEventListener('click', () => alert('Link copied!'));

  const startQuery = () => {
    if (username.value === '' || password === '') {
      alert('You must provide Italo username and password for searching.\n\nNotice: Your account information is only use for querying available train, please do not use if have any concern.');
      return;
    }

    const {
      depart,
      arrival,
      is_round,
      interval_start,
      round_start,
      adult,
      child,
      class: class_code,
      service,
      promo_code,
    } = toJSON(form);

    const i_start_unix = interval_start
      ? JSON.parse(`${moment.tz(interval_start, 'Europe/Rome').unix()}000`)
      : null;

    const i_start = i_start_unix
      ? `/Date(${i_start_unix}+0000)/`
      : null;
    const i_end = i_start_unix
      ? `/Date(${i_start_unix + 86340000}+0000)/`
      : null;

    const r_start_unix = round_start
      ? JSON.parse(`${moment.tz(round_start, 'Europe/Rome').unix()}000`)
      : i_start_unix;

    const r_start = `/Date(${r_start_unix}+0000)/`;
    const r_end = `/Date(${r_start_unix + 86340000}+0000)/`;

    const body = {
      depart,
      arrival,
      isRound: is_round === 'yes',
      intervalStart: i_start,
      intervalEnd: i_end,
      roundStart: r_start,
      roundEnd: r_end,
      adult: JSON.parse(adult),
      child: JSON.parse(child),
      productClass: class_code === 'O' ? null : class_code,
      classOfService: service === 'null' ? null : service,
      promoCode: promo_code === '' ? null : promo_code,
    };

    result.style.display = 'block';
    result.innerHTML = `
    <div class="ts active inverted dimmer">
      <div class="ts text loader">Loading...</div>
    </div>
    `;

    async.waterfall([
      function (callback) {
        if (sig) {
          callback(null, sig);
          return;
        }
        fetch('/api/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            username: username.value,
            password: password.value,
          }),
        })
          .then(res => res.json())
          .then(({ Signature }) => {
            sig = Signature;
            callback(null, Signature);
          });
      },
      function (sig, callback) {
        fetch('/api/getAvailableTrains', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sig, ...body }),
        })
          .then(res => res.json())
          .then(json => callback(null, json));
      },
    ], (err, { JourneyDateMarkets }) => {
      if (JourneyDateMarkets && JourneyDateMarkets.length > 0 && JourneyDateMarkets[0].Journeys !== null) {
        const journeys = JourneyDateMarkets[0].Journeys.filter(({ Segments }) => Segments[0].Fares !== null);
        const filteredJourneys = priceFilter(journeys);
        result.innerHTML = generateHTML(filteredJourneys);
        backup = journeys;
      } else {
        result.innerHTML = 'No result.';
      }
    });
  };
  bindSubmit(form);
  submit.addEventListener('click', startQuery);

  const paxPriceFilter = document.querySelector('#pax_price_filter');

  paxPriceFilter.addEventListener('keyup', () => {
    result.innerHTML = generateHTML(priceFilter(backup));
  });

  function getServices (currentClass) {
    const matchedServices = services.filter(({ belongsTo }) => belongsTo === currentClass);
    return matchedServices.map(({ label, value }) => `<option value='${value}'>${label}</option>`).join('');
  }

  function toJSON(form) {
    const obj = {};
    const elements = form.querySelectorAll("input, select, textarea");
    for(let i = 0; i < elements.length; ++i) {
      const element = elements[i];
      const name = element.name;
      const value = element.value;
      if(name) {
        obj[name] = value;
      }
    }
    return obj;
  }

  function bindSubmit(form) {
    const elements = form.querySelectorAll("input, select, textarea");
    for(let i = 0; i < elements.length; ++i) {
      const element = elements[i];
      element.addEventListener('keypress', e => {
        const key = e.which || e.keyCode;
        if (key === 13) {
          startQuery();
        }
      });
      element.addEventListener('change', e => {
        generateLink();
      });
    }
  }

  function generateLink() {
    const {
      username,
      password,
      depart,
      arrival,
      is_round,
      interval_start,
      round_start,
      adult,
      child,
      class: class_lv,
      service,
      promo_code,
    } = toJSON(form);
    share.setAttribute('data-clipboard-text', `${location.protocol}//${location.host}/?
depart=${depart}&
arrival=${arrival}&
interval_start=${interval_start}&
round_start=${round_start}&
adult=${adult}&
child=${child}&
class_lv=${class_lv}&
service=${service}&
promo_code=${promo_code}&
pax_price=${paxPriceFilter.value}`.replace(/\r?\n|\r/g, '')
    );
  }
  generateLink();

  function priceFilter(journeys) {
    if (journeys) {
      const filteredJourneysWithEmptyArray = journeys.map(({ Segments, ...keys }) => {
        return {
          Segments: [{
            Fares: Segments[0].Fares.filter(({ PaxFares }) =>
              JSON.parse(paxPriceFilter.value) > PaxFares[0].DiscountedPaxFarePrice
            ),
          }],
          ...keys,
        };
      });
      return filteredJourneysWithEmptyArray.filter(journey => journey.Segments[0].Fares.length > 0);
    }
  }

  function generateHTML(journeys) {
    return journeys.map(({ JourneySellKey, Segments }) => {
      return Segments[0].Fares.map(({
        ClassOfService,
        ClassOfServiceName,
        ProductClass,
        AvailableCount,
        FullFarePrice,
        DiscountedFarePrice,
        PaxFares,
      }) => {
        const {
          PaxDiscountCode,
          FareDiscountCode,
          FullPaxFarePrice,
          DiscountedPaxFarePrice,
        } = PaxFares[0];
        const [depart, arrival] = JourneySellKey.match(/~([A-Z_]{3})~/g);
        const [start, end] = JourneySellKey.match(/~\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}~/g);
        return `
          <div class="row">
            <div>
              ${normalizeDate(start).date}
            </div>
            <div>
              ${normalizeDate(start).time}
            </div>
            <div>
              ${normalizeDate(end).date}
            </div>
            <div>
              ${normalizeDate(end).time}
            </div>
            <div class="desktop-only">
              ${mapClassById(ProductClass)}
            </div>
            <div class="mobile-only">
              ${ProductClass}
            </div>
            <div class="desktop-only">
              ${ClassOfServiceName}
            </div>
            <div class="mobile-only">
              ${ClassOfService}
            </div>
            <div>
              ${AvailableCount === 0 ? 'N' : AvailableCount} Seats
            </div>
            <div>
              ${FullFarePrice > DiscountedFarePrice ? `<span style='color: red;'>${DiscountedFarePrice}</span>` : FullFarePrice}€
            </div>
          </div>`
        ;
      }).join('');
    }).join('');
  }

  function mapStationById (id) {
    return stations.find(station => `~${station.value}~` === id).label;
  }
  function mapClassById (id) {
    return classes.find(theClass => theClass.value === id).label;
  }
  function normalizeDate (dateString) {
    const { groups: { date }} = dateString.match(/~(?<date>\d{2}\/\d{2}\/\d{4})/);
    const { groups: { time }} = dateString.match(/(?<time>\d{2}:\d{2})~/);
    return { date, time };
  }
})();
