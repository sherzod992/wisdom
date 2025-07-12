$(function () {
    const maxLinks = 10;
    let count = 1;
  
    // + video link
    $("#add-video-link").on("click", function () {
      if (count >= maxLinks) {
        alert("Maximum 10 video links allowed");
        return;
      }
      const input = $('<input type="text" name="lessonVideo[]" placeholder="https://..." style="margin-top: 8px;" />');
      $("#video-links-container").append(input);
      count++;
    });
  
    // show form
    $("#process-btn").on("click", () => {
      $(".dish-container").slideDown(500);
      $("#process-btn").hide();
    });
  
    // hide form
    $("#cancel-btn").on("click", () => {
      $(".dish-container").slideUp(200);
      $("#process-btn").show();
    });
  
    // update lesson status
    $(".new-product-status").on("change", async function (e) {
      const id = e.target.id;
      const lessonStatus = $(`#${id}`).val();
      try {
        const response = await axios.post(`/admin/lesson/${id}`, { lessonStatus });
        if (response.data && response.data.success) {
          console.log("Status updated");
        } else {
          alert("Failed to update status");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to update status");
      }
    });
  
    // ✅ Optional: validate form on submit
    $("#create-btn").on("click", function (e) {
      if (!validateForm()) {
        e.preventDefault();
      }
    });
  });
  
  // ✅ Validate form input before submit
  function validateForm() {
    const title = $("input[name='lessonTitle']").val();
    const price = $("input[name='lessonPrice']").val();
    const desc = $("textarea[name='lessonDesc']").val();
  
    if (!title || !price || !desc) {
      alert("Please fill in all required fields");
      return false;
    }
    return true;
  }
  
  // ✅ Image preview
  function previewFileHandler(input, order) {
    const imgClassName = input.className;
    const file = $(`.${imgClassName}`).get(0).files[0];
    const fileType = file?.type;
    const validImageType = ["image/jpg", "image/jpeg", "image/png"];
  
    if (!validImageType.includes(fileType)) {
      alert("Please insert only jpeg, jpg or png format");
    } else {
      if (file) {
        const reader = new FileReader();
        reader.onload = function () {
          $(`#image-section-${order}`).attr("src", reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }
  