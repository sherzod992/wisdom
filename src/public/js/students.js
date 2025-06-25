console.log("Students frontend javascript file loaded");

$(function () {
  $(".member-status").on("change", function (e) {
    const id = e.target.id;
    const memberStatus = $(`#${id}`).val();

    axios.post("/admin/user/edit", {
      _id: id,
      memberStatus: memberStatus,
    })
      .then((response) => {
        const result = response.data;
        console.log("response:", result);

        if (result.data) {
          alert("User status updated!");
        } else {
          alert("User update failed!");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Server error during update!");
      });
  });
});
