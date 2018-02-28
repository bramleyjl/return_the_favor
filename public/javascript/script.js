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


$(function(){
 	$(".card").flip ({
        trigger: 'hover'
   		});
			});


$(document).ready(function() {
    $('.smultiple').select2();
});
$('.js-example-basic-single').select2();
// $(document).ready(function() {
//     $('.ssingle').select2();
// });
// $("#county").select2({
// placeholder: 'Select One',
// allowClear: true
// });
