// poner los events listeners
// 

$('[data-cardSelectButton]').click(function() {
    $(this).parent('[data-cardSelect]').toggleClass('is-selected');
    
  });
  
  