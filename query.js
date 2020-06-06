require('dotenv').config();

const fetch = require('isomorphic-fetch');

const { API_HOSTNAME, API_LOGIN_PATH, API_QUERY_PATH, USERNAME, PASSWORD } = process.env;

module.exports = {
  login: () => {
    return fetch(`${API_HOSTNAME}${API_LOGIN_PATH}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        "Login": {
          "Username": `${USERNAME}`,
          "Password": `${PASSWORD}`,
          "Domain": "WWW",
          "VersionNumber":"3.4.5"
        },
        "SourceSystem": 3
      }),
    }).then(res => res.json());
  },
  getAvailableTrains: ({
    isRound = false,
    depart = 'SMN',
    arrival = 'VSL',
    intervalStart = `/Date(${new Date().getTime()}+0000)/`,
    intervalEnd = `/Date(${new Date().getTime()+8634000}+0000)/`,
    roundStart = `/Date(${new Date().getTime()}+0000)/`,
    roundEnd = `/Date(${new Date().getTime()+8634000}+0000)/`,
    adult = 1,
    child = 0,
    productClass = 'S',
    classOfService = 'P',
    promoCode = null,
    sig = '',
  }) => {
    return fetch(`${API_HOSTNAME}${API_QUERY_PATH}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        'GetAvailableTrains': {
          'RoundTrip': isRound,
          'DepartureStation': depart,
          'ArrivalStation': arrival,
          'IntervalStartDateTime': intervalStart,
          'IntervalEndDateTime': intervalEnd,
          'RoundTripIntervalStartDateTime': roundStart,
          'RoundTripIntervalEndDateTime': roundEnd,
          'AdultNumber': adult,
          'ChildNumber': child,
          'InfantNumber': 0,
          'SeniorNumber': 0,
          'CurrencyCode': 'EUR',
          'ProductClass': productClass,
          'RoundtripProductClass': null,
          'ProductName': null,
          'FareType': null,
          'FareClassOfService': classOfService,
          'Promocode': promoCode,
          'IsGuest': false,
          'SourceSystem': 3,
          'OverrideIntervalTimeRestriction': true,
          'AvailabilityFilter': 1,
          'FareClassControl': 0,
          'IDPartner': null
        },
        'Login': null,
        'Signature': sig,
      }),
    }).then(res => res.json());
  },
};
