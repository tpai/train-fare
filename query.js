require('dotenv').config();

const fetch = require('isomorphic-fetch');

module.exports = {
  login: () => {
    return fetch(`${process.env.API_ENDPOINT}${process.env.API_LOGIN_PATH}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        "Login": {
          "Username": `${process.env.USERNAME}`,
          "Password": `${process.env.PASSWORD}`,
          "Domain": "WWW"
        },
        "SourceSystem": 3
      }),
    }).then(res => res.json());
  },
  getAvailableTrain: ({
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
    return fetch(`${process.env.API_ENDPOINT}${process.env.API_QUERY_PATH}`, {
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
