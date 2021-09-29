$(document).ready(function () {
  
    $("#supervisor").on("change", function () {
      let selectedItem = $(this).val();
      let titles = $("#titles");
      $.ajax({
        cache: false,
        type: "GET",
        url: "/assign-panel/getTitlesList",
        data: { supervisor: selectedItem },
        success: (data) => {
            titles.html("");
          data.forEach((title) => {
            titles.append(
              $("<option></option>").val(title).html(title)
            );
          });
        },
        error: function (xhr, ajaxOptions, thrownError) {
          console.log("Error: ", xhr, ajaxOptions, thrownError);
        },
      });
    });
  });
  