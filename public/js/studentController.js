$(document).ready(function () {
  $('#successMessage').addClass('d-none');
  $('body').on('click', '.deleteStudent', function (e) {
    e.preventDefault();
    var form = $(this);
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
    })
      .then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      })
      .catch((err) => {
        const error = new Error(err);
        console.log(error);
      });
  });

  $('body').on('click', '.deleteSlot', function (e) {
    e.preventDefault();
    var form = $(this);
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
    })
      .then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      })
      .catch((err) => {
        const error = new Error(err);
        console.log(error);
      });
  });

  $('body').on('click', '.approveStudent', function (e) {
    e.preventDefault();
    var form = $(this);
    let tr = form.parent().parent();

    Swal.fire({
      title: 'Confirm?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Yes',
    })
      .then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            cache: false,
            type: 'POST',
            url: '/student/approve',
            data: form.serialize(),
            success: (data) => {
              let message = $('#successMessage');
              message.empty();
              if (data.success) {
                message.removeClass('d-none');
                message.append(`
                  <div class="alert alert-success alert-dismissible fade show" role="alert">
                     ${data.success}
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                       <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
               `);
                tr.hide();
              }
            },
            error: function (xhr, ajaxOptions, thrownError) {
              console.log('Error: ', xhr, ajaxOptions, thrownError);
              throw Error;
            },
          });
        }
      })
      .catch((err) => {
        const error = new Error(err);
        console.log(error);
      });
  });

  $('#reqBtn').on('click', (e) => {
    $('#reqTableArrowDown').toggleClass('d-none');
    $('#reqTableArrowUp').toggleClass('d-none');
  });

  $('#stuBtn').on('click', (e) => {
    $('#stuTableArrowDown').toggleClass('d-none');
    $('#stuTableArrowUp').toggleClass('d-none');
  });

  $('#lecBtn').on('click', (e) => {
    $('#lecTableArrowDown').toggleClass('d-none');
    $('#lecTableArrowUp').toggleClass('d-none');
  });

  $('#slotBtn').on('click', (e) => {
    $('#slotTableArrowDown').toggleClass('d-none');
    $('#slotTableArrowUp').toggleClass('d-none');
  });

  $('#stuContBtn').on('click', (e) => {
    $('#stuContTableArrowDown').toggleClass('d-none');
    $('#stuContTableArrowUp').toggleClass('d-none');
  });
});
