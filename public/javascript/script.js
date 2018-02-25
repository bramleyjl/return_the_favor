const inputs = document.querySelectorAll("input, select, textarea");

inputs.forEach(input => {
  input.addEventListener(
    "invalid",
    event => {
      input.classList.add("error");
      document.querySelector('#please-complete').style.display = 'block';
      
    },
    false
  );
});

