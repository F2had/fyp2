$(document).ready(function () {
  let panel;

  let fyp;

  let students = $('#students');

  $('#fyp').on('change', function () {
    fyp = $('#fyp').val();
    panel = $('#panels').val();
    let a = panel.split('&');
    let panel1 = a[0];
    let panel2 = a[1];
    $.ajax({
      cache: false,
      type: 'GET',
      url: '/student/getStudentforPanel',
      data: {
        panel1,
        panel2,
        fyp,
      },
      success: (data) => {
        students.html('');
        data.forEach((student) => {
          students.append(
            $('<option></option>').val(student.id).html(student.name)
          );
        });
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('Error: ', xhr, ajaxOptions, thrownError);
        throw Error;
      },
    });
  });

  let timeTableForm = $('#timeTableForm').on('submit', function (e) {
    $('#hasUpcomingSlot').addClass('d-none');
    $.ajax({
      cache: false,
      type: 'POST',
      url: '/schedule/generate',
      data: timeTableForm.serialize(),
      success: (data) => {
        $('#errors').empty();
        if (!data.error) {
          if (data.timetable.length) {
            $('#generatedTimeTable').removeClass('d-none');
            let table = $('#timeTable tbody');
            table.empty();
            data.timetable.forEach((slot) => {
              table.append(
                `<tr>
                  <td>${slot.student.name}</td>
                  <td>${slot.student.id}</td>
                  <td>${slot.type}</td>
                  <td>${slot.dateFromFormatted}-${slot.dateToFormatted}</td>
                  <td>${slot.venue}</td>
                </tr>`
              );
            });
          }

          if (data.hasUpcomingSlotStudents.length) {
            $('#hasUpcomingSlot').removeClass('d-none');
            let div = $('#withUpcomingSlots');
            div.empty();
            data.hasUpcomingSlotStudents.forEach((student) => {
              div.append(`
               <a href="#" class="alert-link">${student.name} ${student.id} </a>.
                    <br>
              `);
            });
          }
        } else {
          let errordiv = $('#errors');
          $('#errors').removeClass('d-none');
          errordiv.empty();
          if (Array.isArray(data.error)) {
            data.error.forEach((err) => {
              if (
                err ===
                'duration must be a `number` type, but the final value was: `NaN` (cast from the value `""`).'
              ) {
                errordiv.append(`
                   <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    duration must be a number
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                     </button>
                   </div>
              `);
              } else {
                errordiv.append(`
                   <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${err}
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                     </button>
                   </div>
              `);
              }
            });
          } else {
            errordiv.append(`
                   <div class="alert alert-danger alert-dismissible fade show" role="alert">
                   ${data.error}
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                     </button>
                   </div>
              `);
          }
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('Error: ', xhr, ajaxOptions, thrownError);
        throw Error;
      },
    });
    e.preventDefault();
  });

  let scheduleForm = $('#scheduleForm').on('submit', function (e) {
    $('#success').addClass('d-none');
    $.ajax({
      cache: false,
      type: 'POST',
      url: '/schedule',
      data: scheduleForm.serialize(),
      success: (data) => {
        $('#errors').empty();
        $('#success').empty();
        let successDiv = $('#success');
        successDiv.removeClass('d-none');
    
        if (data.success) {
          successDiv.append(`
                   <div class="alert alert-success alert-dismissible fade show" role="alert">
                   ${data.success}
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                     </button>
                   </div>
              `);
        } else {
          let errordiv = $('#errors');
          $('#errors').removeClass('d-none');
          errordiv.empty();
          if (Array.isArray(data.error)) {
            data.error.forEach((err) => {
              errordiv.append(`
                   <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${err}
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                     </button>
                   </div>
              `);
            });
          } else {
            errordiv.append(`
                   <div class="alert alert-danger alert-dismissible fade show" role="alert">
                   ${data.error}
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                     </button>
                   </div>
              `);
          }
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('Error: ', xhr, ajaxOptions, thrownError);
        throw Error;
      },
    });

    e.preventDefault();
  });

  $('#panels').on('change', function () {
    panel = $('#panels').val();
    fyp = $('#fyp').val();
    let a = panel.split('&');
    let panel1 = a[0];
    let panel2 = a[1];
    $.ajax({
      cache: false,
      type: 'GET',
      url: '/student/getStudentforPanel',
      data: {
        panel1,
        panel2,
        fyp,
      },
      success: (data) => {
        students.html('');
        data.forEach((student) => {
          students.append(
            $('<option></option>').val(student.id).html(student.name)
          );
        });
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('Error: ', xhr, ajaxOptions, thrownError);
      },
    });
  });

  $('#student').on('change', function () {
    let studentID = $('#student').val();
    let _csrf = $('#csrfToken').val();

    $.ajax({
      cache: false,
      type: 'POST',
      url: '/student/getPanel',
      data: {
        studentID,
        _csrf,
      },
      success: (data) => {
        $('#panel ul').empty();
        $('#panel').removeClass('d-none');
        let div = $('#panel ul');
        div.append(`
       <li>${data.panel1}</li>
         <li>${data.panel2}</li>
       `);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('Error: ', xhr, ajaxOptions, thrownError);
      },
    });
  });
});
