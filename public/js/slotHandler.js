$(document).ready(function () {
  $('body').on('click', '.deleteSlot', function (e) {
    e.preventDefault();
    var form = $(this);
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, decline!',
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

  $('#reqBtn').on('click', (e) => {
    $('#reqTableArrowDown').toggleClass('d-none');
    $('#reqTableArrowUp').toggleClass('d-none');
  });

  $('#slotBtn').on('click', (e) => {
    $('#slotTableArrowDown').toggleClass('d-none');
    $('#slotTableArrowUp').toggleClass('d-none');
  });

  $('#panelingBtn').on('click', (e) => {
    $('#panelingTableArrowDown').toggleClass('d-none');
    $('#panelingTableArrowUp').toggleClass('d-none');
  });

  $('#supervisingBtn').on('click', (e) => {
    $('#supervisingTableArrowDown').toggleClass('d-none');
    $('#supervisingTableArrowUp').toggleClass('d-none');
  });

  $('body').on('click', '.approveSlot', function (e) {
    $('#successMessage').addClass('d-none');
    e.preventDefault();
    var form = $(this);
    let tr = form.parent().parent();

    Swal.fire({
      title: 'Confirm?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Approve!',
    })
      .then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            cache: false,
            type: 'POST',
            url: '/schedule/approveSlot',
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
});
