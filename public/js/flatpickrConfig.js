$(document).ready(() => {
  flatpickr('#slotDate', {
    inline: false,
    dateFormat: 'Y-m-d',
    minDate: 'today',
    maxDate: new Date().fp_incr(120),
    disable: [
      function (date) {
        return date.getDay() === 0 || date.getDay() === 6;
      },
    ],
  });

  flatpickr('#tiametable', {
    inline: false,
    dateFormat: 'Y-m-d',
    minDate: 'today',
    maxDate: new Date().fp_incr(120),
    disable: [
      function (date) {
        return date.getDay() === 0 || date.getDay() === 6;
      },
    ],
    mode: 'multiple',
  });

  const startTime = flatpickr('#timeStart', {
    enableTime: true,
    noCalendar: true,
    allowInput: true,
    minTime: '09',
    maxTime: '18',
    time_24hr: true,
    defaultHour: 9,
  });

  const endTime = flatpickr('#timeEnd', {
    enableTime: true,
    noCalendar: true,
    allowInput: true,
    minTime: '09',
    maxTime: '18',
    time_24hr: true,
    defaultHour: 11,
  });

  const startTimeTimeTable = flatpickr('#timeStartTimeTable', {
    enableTime: true,
    noCalendar: true,
    allowInput: true,
    minTime: '09',
    maxTime: '18',
    time_24hr: true,
    defaultHour: 9,
  });

  const endTimeTimeTable = flatpickr('#timeEndTimeTable', {
    enableTime: true,
    noCalendar: true,
    allowInput: true,
    minTime: '09',
    maxTime: '18',
    time_24hr: true,
    defaultHour: 11,
  });
});
