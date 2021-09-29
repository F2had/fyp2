$(document).ready(function () {
  $('.demotCoord').on('click', function (e) {
    e.preventDefault();
    var form = $(this);
   
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, Demote!',
    })
      .then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  });

  $('.promoteCoord').on('click', function (e) {
    e.preventDefault();
    var form = $(this);

    Swal.fire({
      showCancelButton: true,
      confirmButtonColor: '#4b9100',
      confirmButtonText: 'Yes, Promte!',
    })
      .then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  });

  $('.deleteCoord').on('click', function (e) {
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
        next(error);
      });
  });
});
