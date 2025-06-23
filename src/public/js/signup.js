const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

function validateForm() {
  let memberNick = $(".member-nick").val();
  let memberPhone = $(".member-phone").val();
  let memberPassword = $(".member-password").val();
  let confirmPassword = $(".confirm-password").val();

  if (!memberNick || !memberPhone || !memberPassword || !confirmPassword) {
    alert("Fill in all required inputs");
    return false;
  }

  if (memberPassword !== confirmPassword) {
    alert("Passwords do not match, please check again");
    return false;
  }

  return true;
}
