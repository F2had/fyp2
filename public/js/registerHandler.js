$(document).ready(function () {
  $('#coordinatorForm').hide();
  $('#studentForm').hide();

  $('#studentName').on('input', (e) => {
    let value = e.target.value;

    if (value.match(/^[A-Za-z ]*$/)) {
      $('#studentName').removeClass('is-invalid').addClass('is-valid');
      $('#studentNameError').addClass('d-none');
    } else {
      $('#studentName').removeClass('is-valid').addClass('is-invalid');
      $('#studentNameError').removeClass('d-none');
    }
    if (!value) {
      $('#studentName').removeClass('is-valid');
    }
  });

  $('#studentID').on('input', (e) => {
    let value = e.target.value;
    if (value.match(/\d{8}\/(1|2)/)) {
      $('#studentID').removeClass('is-invalid').addClass('is-valid');
      $('#matricError').addClass('d-none');
    } else {
      $('#studentID').removeClass('is-valid').addClass('is-invalid');
      $('#matricError').removeClass('d-none');
    }
    if (!value) {
      $('#studentID').removeClass('is-invalid');
      $('#matricError').addClass('d-none');
    }
  });

  $('#studentPhone').on('input', (e) => {
    let value = e.target.value;
    if (
      value.match(
        /(^(\+?6?01)[0-46-9]-*[0-9]{7,8}$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$)/
      )
    ) {
      $('#studentPhone').removeClass('is-invalid').addClass('is-valid');
      $('#studentPhoneError').addClass('d-none');
    } else {
      $('#studentPhone').removeClass('is-valid').addClass('is-invalid');
      $('#studentPhoneError').removeClass('d-none');
    }
    if (!value) {
      $('#studentPhone').removeClass('is-invalid');
      $('#studentPhoneError').addClass('d-none');
    }
  });

  $('#department').on('input', (e) => {
    let value = e.target.value;
    if (value) {
      $('#department').removeClass('is-invalid').addClass('is-valid');
    }
  });

  $('#supervisor').on('input', (e) => {
    let value = e.target.value;
    if (value) {
      $('#supervisor').removeClass('is-invalid').addClass('is-valid');
    }
  });

  $('#fyp').on('input', (e) => {
    let value = e.target.value;
    if (value) {
      $('#fyp').removeClass('is-invalid').addClass('is-valid');
    }
  });

  

  $('#studentEmail').on('input', (e) => {
    let value = e.target.value;
    if (value.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/)) {
      $('#studentEmail').removeClass('is-invalid').addClass('is-valid');
      $('#studentEmailError').addClass('d-none');
    } else {
      $('#studentEmail').removeClass('is-valid').addClass('is-invalid');
      $('#studentEmailError').removeClass('d-none');
    }
    if (!value) {
      $('#studentEmail').removeClass('is-invalid').removeClass('is-valid');
      $('#studentEmailError').addClass('d-none');
    }
  });
  let password;
  $('#studentPassword').on('input', (e) => {
    let value = e.target.value;
    password = value;
    if (
      value.match(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/
      )
    ) {
      $('#studentPassword').removeClass('is-invalid').addClass('is-valid');
      $('#studentPasswordError').addClass('d-none');
    } else {
      $('#studentPassword').removeClass('is-valid').addClass('is-invalid');
      $('#studentPasswordError').removeClass('d-none');
    }
    if (!value) {
      $('#studentPassword').removeClass('is-invalid').removeClass('is-valid');
      $('#studentPasswordError').addClass('d-none');
    }
  });

  $('#studentPassword2').on('input', (e) => {
    let value = e.target.value;
  
    if (value === password) {
      $('#studentPassword2').removeClass('is-invalid').addClass('is-valid');
      $('#studentPasswordError2').addClass('d-none');
    } else {
      $('#studentPassword2').removeClass('is-valid').addClass('is-invalid');
      $('#studentPasswordError2').removeClass('d-none');
    }
    if (!value) {
      $('#studentPassword2').removeClass('is-invalid').removeClass('is-valid');
      $('#studentPasswordError2').addClass('d-none');
    }
  });

  $('#coordinatorName').on('input', (e) => {
    let value = e.target.value;
    password = value;
    if (value.match(/^[A-Za-z ]*$/)) {
      $('#coordinatorName').removeClass('is-invalid').addClass('is-valid');
      $('#coordinatorNameError').addClass('d-none');
    } else {
      $('#coordinatorName').removeClass('is-valid').addClass('is-invalid');
      $('#coordinatorNameError').removeClass('d-none');
    }
    if (!value) {
      $('#coordinatorName').removeClass('is-invalid').removeClass('is-valid');
      $('#coordinatorNameError').addClass('d-none');
    }
  });


  $('#coordDepartment').on('input', (e) => {
    let value = e.target.value;
    if (value) {
      $('#coordDepartment').removeClass('is-invalid').addClass('is-valid');
    }
  });

  $('#coordEmail').on('input', (e) => {
    let value = e.target.value;
    if (value.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/)) {
      $('#coordEmail').removeClass('is-invalid').addClass('is-valid');
      $('#coordEmailError').addClass('d-none');
    } else {
      $('#coordEmail').removeClass('is-valid').addClass('is-invalid');
      $('#coordEmailError').removeClass('d-none');
    }
    if (!value) {
      $('#coordEmail').removeClass('is-invalid').removeClass('is-valid');
      $('#coordEmailError').addClass('d-none');
    }
  });
  let passwordCoord;
  $('#coordinatorPassword').on('input', (e) => {
    let value = e.target.value;
    passwordCoord = value;
    if (
      value.match(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/
      )
    ) {
      $('#coordinatorPassword').removeClass('is-invalid').addClass('is-valid');
      $('#coordinatorPasswordError').addClass('d-none');
    } else {
      $('#coordinatorPassword').removeClass('is-valid').addClass('is-invalid');
      $('#coordinatorPasswordError').removeClass('d-none');
    }
    if (!value) {
      $('#coordinatorPassword').removeClass('is-invalid').removeClass('is-valid');
      $('#coordinatorPasswordError').addClass('d-none');
    }
  });

  $('#coordinatorPassword2').on('input', (e) => {
    let value = e.target.value;
  
    if (value === passwordCoord) {
      $('#coordinatorPassword2').removeClass('is-invalid').addClass('is-valid');
      $('#coordinatorPasswordError2').addClass('d-none');
    } else {
      $('#coordinatorPassword2').removeClass('is-valid').addClass('is-invalid');
      $('#coordinatorPasswordError2').removeClass('d-none');
    }
    if (!value) {
      $('#coordinatorPassword2').removeClass('is-invalid').removeClass('is-valid');
      $('#coordinatorPasswordError2').addClass('d-none');
    }
  });

  let selected = $('#userRoleo option:selected').text();

  if (selected) {
    $('#' + selected).show();
  } else {
    $('#studentForm').show();
  }

  $('#userRole').on('change', function (e) {
    var optionSelected = $('option:selected', this);
    var valueSelected = this.value;

    if (valueSelected === 'Student') {
      $('#coordinatorForm').hide();
      $('#studentForm').show();
    }

    if (valueSelected === 'Coordinator') {
      $('#studentForm').hide();
      $('#coordinatorForm').show();
    }
  });

  $('#department').on('change', function () {
    let selectedItem = $(this).val();
    let supervisor = $('#supervisor');

    $.ajax({
      cache: false,
      type: 'GET',
      url: '/register/getSupervisorsList',

      data: { department: selectedItem },
      success: (data) => {
        supervisor.html('');
        data.forEach((lecturer) => {
          supervisor.append(
            $('<option></option>').val(lecturer.id).html(lecturer.name)
          );
        });
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('Error: ', xhr, ajaxOptions, thrownError);
      },
    });
  });
});
