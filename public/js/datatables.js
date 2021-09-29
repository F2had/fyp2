//  dataTables jQuery plugin
$(document).ready(function () {
  $('#stuTable').DataTable({
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'csv',
        title: 'Students',
      },
      { extend: 'excel', title: 'Students' },
      {
        extend: 'pdfHtml5',
        title: 'Students',
        orientation: 'landscape',
        pageSize: 'LEGAL',
      },
    ],
    colReorder: true,
    responsive: true,
  });

  $('#Table2').DataTable({
    bLengthChange: false,
    responsive: true,
    colReorder: true,
    fixedHeader: true,
    paging: false,
    scrollCollapse: true,
  });

  $('#studentMeetings').DataTable({
    bLengthChange: false,
    responsive: true,
    colReorder: true,
    fixedHeader: true,
    paging: false,
    scrollCollapse: true,
  });

  $('#lecturersTable').DataTable({
    bLengthChange: false,
    responsive: true,
    colReorder: true,
    paging: false,
    scrollCollapse: true,
  });

  $('#meetingsTable').DataTable({
    bLengthChange: false,
    responsive: true,
  });

  // $('#Table3').DataTable({
  //   searching: false,
  // });

  // $('#timeTable').DataTable({
  //   searching: false,
  //   bLengthChange: false,
  // });


  let slotsTable = $('#slotsTable').DataTable({
    bLengthChange: false,
    // bAutoWidth: false,
    paging: false,
    colReorder: true,
    responsive: true,
  });
  slotsTable.responsive.recalc();

  let panelingTable = $('#panelingTable').DataTable({
    bLengthChange: false,
    // bAutoWidth: false,
    paging: false,
    colReorder: true,
    responsive: true,
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'csv',
        title: 'Students',
      },
      { extend: 'excel', title: 'Paneling Students' },
      {
        extend: 'pdfHtml5',
        title: 'Paneling Students',
        orientation: 'landscape',
        pageSize: 'LEGAL',
      },
    ],
  });
  
  $('#supervisingTable').DataTable({
    bLengthChange: false,
    // bAutoWidth: false,
    paging: false,
    colReorder: true,
    responsive: true,
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'csv',
        title: 'Students',
      },
      { extend: 'excel', title: 'Supervisoring Students' },
      {
        extend: 'pdfHtml5',
        title: 'Supervisoring Students',
        orientation: 'landscape',
        pageSize: 'LEGAL',
      },
    ],
  });

  let studentControllerTable = $('#studentControllerTable').DataTable({
    bLengthChange: false,
    bAutoWidth: false,
    paging: false,
    colReorder: true,
    responsive: true,
  });

  $('#requestsTable').DataTable({
    bLengthChange: false,
    responsive: true,
    colReorder: true,
    scrollCollapse: true,
    // order: [[1, 'asc']],
  });

  $('#Table4').DataTable({
    responsive: true,
  });
});
