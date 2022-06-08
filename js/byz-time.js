var cities = [
  {
    name: 'Манастир Хиландар',
    lat: 40.33967,
    long: 24.12097
  },
  {
    name: 'Манастир Велика Лавра',
    lat: 40.17085,
    long: 24.38305
  },
  {
    name: 'Манастир Ватопед',
    lat: 40.31441,
    long: 24.21342
  },
  {
    name: 'Манастир Ивирон',
    lat: 40.24549,
    long: 24.28495
  },
  {
    name: 'Манастир Дионисијат',
    lat: 40.16804,
    long: 24.27380
  },
  {
    name: 'Манастир Котлумуш',
    lat: 40.25315,
    long: 24.24759
  },
  {
    name: 'Манастир Пантократор',
    lat: 40.28367,
    long: 24.26645
  },
  {
    name: 'Манастир Ксиропотам',
    lat: 40.22795,
    long: 24.21975
  },
  {
    name: 'Манастир Зограф',
    lat: 40.30583,
    long: 24.16028
  },
  {
    name: 'Манастир Дохијар',
    lat: 40.26639,
    long: 24.17333
  },
  {
    name: 'Манастир Каракал',
    lat: 40.22376,
    long: 24.30909
  },
  {
    name: 'Манастир Филотеј',
    lat: 40.22558,
    long: 24.29087
  },
  {
    name: 'Манастир Симонопетра',
    lat: 40.18992,
    long: 24.24560
  },
  {
    name: 'Манастир Св. Павле',
    lat: 40.16085,
    long: 24.28960
  },
  {
    name: 'Манастир Ставроникита',
    lat: 40.26793,
    long: 24.27687
  },
  {
    name: 'Манастир Ксенофонт',
    lat: 40.25859,
    long: 24.17815
  },
  {
    name: 'Манастир Григоријат',
    lat: 40.17925,
    long: 24.25559
  },
  {
    name: 'Манастир Есфигмен',
    lat: 40.35269,
    long: 24.13805
  },
  {
    name: 'Манастир Пантелејмон',
    lat: 40.23771,
    long: 24.20084
  },
  {
    name: 'Манастир Констамонит',
    lat: 40.28816,
    long: 24.17389
  },
  {
    name: 'Кареја',
    lat: 40.25717,
    long: 24.24497
  }
];



$(document).ready(function() {
  var citiesSelect = $('.js-cities');
  var timeEl = $('.js-time');
  var cityEl = $('.js-city');
  var customTimeCheckbox = $('.js-custom-time');
  var dateTimeInput = $('.js-date-time');
  var whichTime = $('.js-which-time');
  var city = null;
  var timeout = null;
  var dateSelected = false;
  var app = $('.js-app');

  var picker = new Pikaday({
    field: document.querySelector('.js-date-time'),
    use24hour: true,
    incrementMinuteBy: 5,
    format: 'DD.MM.YYYY. HH:mm',
    onSelect: function() {
      clearTimeout(timeout);
      dateSelected = true;
      getData();
    },
    firstDay: 1,
    autoClose: false,
    timeLabel: 'време',
    i18n: {
      previousMonth : 'Претходни месец',
      nextMonth     : 'Следећи месец',
      months        : ['Јануар', 'Фебруар', 'Март', 'Април', 'Мај', 'Јун', 'Јул', 'Август', 'Септембар', 'Октобар','Новембар','Децембар'],
      weekdays      : ['Недеља','Понедељак','Уторак','Среда','Четвртак','Петак','Субота'],
      weekdaysShort : ['Нед','Пон','Уто','Сре','Чет','Пет','Суб']
    }
  });
  const pickerDiv = $('.pika-single');

  for (var i = 0; i < cities.length; i++) {
    citiesSelect.append('<option value="' + i + '">' + cities[i].name + '</div>');
  }

  function printTime(sunset) {
    var now = new moment().tz('EET');
    var pickedDate = picker.getMoment();

    if (dateSelected) {
      sunset.seconds(0).milliseconds(0);
      now = new moment.tz('EET')
        .seconds(0)
        .milliseconds(0)
        .date(pickedDate.date())
        .month(pickedDate.month())
        .year(pickedDate.year())
        .hour(pickedDate.hour())
        .minute(pickedDate.minute());
    }
    var dayInSeconds = 24 * 3600;
    var byzTimeInSeconds = Math.round(now.diff(sunset) / 1000) % dayInSeconds;

    var seconds = byzTimeInSeconds % 60;
    var minutes = Math.floor(byzTimeInSeconds / 60) % 60;
    var hours = Math.floor(byzTimeInSeconds / 3600) % 24;

    minutes = minutes < 10 ? ('0' + minutes) : minutes;
    seconds = seconds < 10 ? ('0' + seconds) : seconds;

    cityEl.html(city.name);

    if (hours > 13) {
      timeEl.html((hours - 12) + ':' + minutes + ':' + seconds + ' <small>по дану</small>');
    } else {
      timeEl.html(hours + ':' + minutes + ':' + seconds);
    }

    if (!dateSelected) {
      timeout = setTimeout(function() {
        printTime(sunset);
      }, 1000);

      whichTime.html('(тренутно време)');
    } else {
      whichTime.html('(' + pickedDate.format('DD.MM.YYYY, HH:mm') + ' часова)');
    }
  }

  var yesterday = null;
  var cache = {};

  function getData() {
    cityEl.html('Учитавам');
    timeEl.html('&nbsp;');
    whichTime.html('&nbsp;');

    city = cities[parseInt(citiesSelect.val(), 10)];
    clearTimeout(timeout);

    yesterday = new moment().tz('EET').subtract(1, 'day');

    if (dateSelected) {
      yesterday = picker.getMoment().seconds(0).subtract(1, 'day');
    }

    var url = 'https://api.sunrise-sunset.org/json?lat=' + city.lat + '&lng=' + city.long + '&date=' + yesterday.format('YYYY-MM-DD');

    if (cache[url]) {
      printTime(cache[url]);
    } else {
      $.ajax({
        url: url,
        success: function(data) {
          var sunset = new moment.tz(data.results.sunset, 'hh:mm:ss A', 'GMT')
            .date(yesterday.date())
            .year(yesterday.year())
            .month(yesterday.month())
            .tz('EET');
          cache[url] = sunset;
          printTime(sunset);
        }
      });
    }
  }

  customTimeCheckbox.change(function() {
    var isChecked = customTimeCheckbox.is(':checked');
    dateSelected = false;
    picker.setDate(null);
    dateTimeInput.prop('disabled', !isChecked);

    if (!isChecked) {
      getData();
    }
  });

  app.click(function(e) {
    if (dateTimeInput[0] !== e.target && picker.isVisible()) {
      picker.hide();
    }
  });

  pickerDiv.click(function(event){
    event.stopPropagation();
  });

  citiesSelect.change(getData);

  getData();
});
