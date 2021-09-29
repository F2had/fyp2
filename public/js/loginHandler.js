$(document).ready(() => {

  $("#panelForm").hide();
  $("#studentForm").hide();
//   $("#coordinatorForm").show();

  $("#userRole").on("change", function (e) {
    var valueSelected = this.value;

    if (valueSelected === "Student") {
      $("#panelForm").hide();
      $("#coordinatorForm").hide();
      $("#studentForm").show();
    } if (valueSelected === "Panel") {
      $("#studentForm").hide();
      $("#coordinatorForm").hide();
      $("#panelForm").show();
    } if (valueSelected === "Coordiantor") {
      $("#panelForm").hide();
      $("#studentForm").hide();
      $("#coordinatorForm").show();
    }
  });
});
