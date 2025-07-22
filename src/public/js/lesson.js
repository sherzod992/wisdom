$(function () {
  const maxLinks = 10;
  let count = 1;

  // Initialize image upload functionality
  initializeImageUpload();



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
    showNewLessonForm();
  });

  // hide form
  $("#cancel-btn").on("click", () => {
    hideNewLessonForm();
  });

  // close form with X button
  $("#close-form-btn").on("click", () => {
    hideNewLessonForm();
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

  // update lesson collection
  $(".lesson-collection-status").on("change", async function (e) {
    const id = e.target.id.replace("collection-", ""); // collection-{id}에서 id 추출
    const lessonCollection = $(e.target).val();
    try {
      const response = await axios.post(`/admin/lesson/${id}`, { lessonCollection });
      if (response.data && response.data.success) {
        console.log("Collection updated");
        showNotification("Collection updated successfully!", "success");
      } else {
        alert("Failed to update collection");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update collection");
    }
  });

  // ✅ Optional: validate form on submit
  $("#create-btn").on("click", function (e) {
    if (!validateForm()) {
      e.preventDefault();
    }
  });
});

// Initialize image upload functionality
function initializeImageUpload() {
  $('.image-upload-card').each(function (index) {
    const card = $(this);
    const container = card.find('.image-preview-container');
    const input = card.find('.image-upload-input');
    const imagePreview = card.find('.upload-icon');

    // Add drag and drop functionality
    setupDragAndDrop(container, input, index + 1);

    // Add remove button
    addRemoveButton(container, input, index + 1);
  });
}

// Setup drag and drop functionality
function setupDragAndDrop(container, input, order) {
  const card = container.closest('.image-upload-card');

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    container[0].addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight drop area when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    container[0].addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    container[0].addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    card.addClass('drag-over');
  }

  function unhighlight() {
    card.removeClass('drag-over');
  }

  // Handle dropped files
  container[0].addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      const file = files[0];
      if (validateImageFile(file)) {
        handleImageFile(file, order, container, input);
      }
    }
  }
}

// Add remove button to image containers
function addRemoveButton(container, input, order) {
  const removeBtn = $(`
    <button type="button" class="remove-image-btn" title="Remove image">
      ×
    </button>
  `);

  container.append(removeBtn);

  removeBtn.on('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    removeImage(container, input, order);
  });
}

// Remove image and reset container
function removeImage(container, input, order) {
  const imagePreview = container.find(`#image-section-${order}`);

  // Reset image source
  imagePreview.attr('src', '/img/upload.svg');

  // Clear input value
  input.val('');

  // Remove has-image class
  container.removeClass('has-image');

  // Show success notification
  showNotification('Image removed successfully!', 'success');
}

// Reset all image uploads
function resetImageUpload() {
  $('.image-upload-card').each(function (index) {
    const container = $(this).find('.image-preview-container');
    const input = $(this).find('.image-upload-input');
    removeImage(container, input, index + 1);
  });
}

// Validate image file
function validateImageFile(file) {
  const validImageTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validImageTypes.includes(file.type)) {
    showNotification("Please select only JPEG, PNG, or WebP format", "error");
    return false;
  }

  if (file.size > maxSize) {
    showNotification("File size should be less than 10MB", "error");
    return false;
  }

  return true;
}

// Handle image file processing
function handleImageFile(file, order, container, input) {
  const reader = new FileReader();
  const imagePreview = container.find(`#image-section-${order}`);

  reader.onload = function (e) {
    imagePreview.attr('src', e.target.result);
    container.addClass('has-image');
    showNotification('Image uploaded successfully!', 'success');
  };

  reader.onerror = function () {
    showNotification('Error reading file', 'error');
  };

  reader.readAsDataURL(file);
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  $('.notification').remove();

  const notification = $(`
    <div class="notification notification-${type}">
      <span class="notification-message">${message}</span>
      <button class="notification-close">×</button>
    </div>
  `);

  $('body').append(notification);

  // Auto hide after 3 seconds
  setTimeout(() => {
    notification.fadeOut(300, function () {
      $(this).remove();
    });
  }, 3000);

  // Close button functionality
  notification.find('.notification-close').on('click', function () {
    notification.fadeOut(300, function () {
      $(this).remove();
    });
  });
}

// ✅ Validate form input before submit
function validateForm() {
  const title = $("input[name='lessonName']").val();
  const price = $("input[name='lessonPrice']").val();
  const desc = $("textarea[name='lessonDesc']").val();
  const collection = $("select[name='lessonCollection']").val();

  if (!title || !price || !desc || !collection) {
    showNotification("Please fill in all required fields", "error");
    return false;
  }

  // Check if at least one image is uploaded
  const hasImages = $('.image-preview-container.has-image').length > 0;
  if (!hasImages) {
    showNotification("Please upload at least one image", "error");
    return false;
  }

  return true;
}

// Show New Lesson Form with Animation
function showNewLessonForm() {
  // Hide the button with fade animation
  $("#process-btn").fadeOut(300, function () {
    // Show the form after button is hidden
    $(".dish-container").show().addClass('active');

    // Animate form appearance
    setTimeout(() => {
      $(".dish-container").css({
        'opacity': '1',
        'transform': 'translateY(0)'
      });

      // Show notification
      showNotification('새로운 강의 생성 폼이 열렸습니다! 📚', 'info');

      // Scroll to form smoothly
      setTimeout(() => {
        $('html, body').animate({
          scrollTop: $(".dish-container").offset().top - 100
        }, 800);
      }, 200);
    }, 50);
  });
}

// Hide New Lesson Form with Animation
function hideNewLessonForm() {
  // Show notification
  showNotification('폼이 닫혔습니다 ✅', 'success');

  // Animate form hiding
  $(".dish-container").css({
    'opacity': '0',
    'transform': 'translateY(-20px)'
  });

  setTimeout(() => {
    $(".dish-container").removeClass('active').hide();
    // Show the button again with fade animation
    $("#process-btn").fadeIn(500);
    // Reset form data
    resetImageUpload();
    clearFormData();
    // Scroll back to top
    $('html, body').animate({
      scrollTop: $(".dishes-table").offset().top - 50
    }, 700, 'easeInOutQuart');
  }, 400);
}

// Clear form data
function clearFormData() {
  $(".dish-container form")[0].reset();
  $(".image-preview-container").removeClass('has-image');
  $(".upload-icon").attr('src', '/img/upload.svg');
}





// ✅ Enhanced image preview with new structure
function previewFileHandler(input, order) {
  const file = input.files[0];
  const container = $(input).closest('.image-preview-container');

  if (!file) return;

  if (validateImageFile(file)) {
    handleImageFile(file, order, container, $(input));
  }
}
