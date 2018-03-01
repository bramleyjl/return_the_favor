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

$(document).ready(function() {
  $('.smultiple').select2();
  var configParamsObj = {
      placeholder: 'Choose One', // Place holder text to place in the select
      minimumResultsForSearch: 1 // Overrides default of 15 set above
  };
  $(".single").select2(configParamsObj);
  });
  $(".js-example-tags").select2({
    tags: true
  });

$(function(){
 	$(".card").flip ({
        trigger: 'hover'
   		});
			});
