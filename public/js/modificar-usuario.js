window.onload = function () {
    const errorMessage = document.getElementById("error-message")?.value;
    console.log(errorMessage)
    if (errorMessage) {
      alert(errorMessage);
    }
  };