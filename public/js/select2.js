$(document).ready(function () {
  
  $('.venues').select2({
    allowClear: true,
    placeholder: 'Venue',
  });

  $('.students').select2({
    allowClear: true,
    placeholder: 'Students',
  });
});
