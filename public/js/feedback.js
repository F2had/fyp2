$(document).ready(function () {

  let quill = new Quill('#editor', {
    theme: 'snow',
  });

  $('body').on('click', '.feedback', function (e) {
    e.preventDefault();
    let form = $('form');
    let html = quill.root.innerHTML;
    let a = $('#comments').val(html);
    Swal.fire({
      title: 'Submit',
      showCancelButton: true,
      confirmButtonColor: '#4287f5',
      confirmButtonText: 'Yes',
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
});
