


  $(document).on('click', '#xy', function() {
  if($(window).width() <= 414) {
            $('.parent').toggleClass("left-slideheader");
    }
});




$(document).on('click', '.rider_xy', function() {
    if($(window).width() <= 414) {
              $('.parent').toggleClass("left-slideheader");
      }
  });



$(document).on('click', '.filBtn', function() {
        $(".dropdown-contentfilter").show();
});
    
$(document).on('click', '.icon_img-close', function() {
    $(".dropdown-contentfilter").hide();
});


$(document).on('input', ".otp_num", function(e) {
    var val = parseInt($(this).val());
    if (!isNaN(val) && val <= 9) {
        $(this).closest('li').removeClass('active').next().addClass('active').find('input').focus();
    } else {
        $(this).val('')
        return false;
    }
})





$(document).ready(function(){
    $('.owl-carousel.abc').owlCarousel({
        loop:true,
        margin:-10,
        dots:false,
        nav:true,
        navText: ["<img src='images/r2.svg'>","<img src='images/r1.svg'>"],
        responsive:{
            0:{
                items:1
            },
            600:{
                items:3
            },
            1000:{
                items:3
            }
        }
    });
    });


$(document).ready(function(){
    $('.first-slider').owlCarousel({
        loop:true,
        margin:-10,
        dots:false,
        nav:true,
        navText: ["<img src='images/r2.svg'>","<img src='images/r1.svg'>"],
        responsive:{
            0:{
                items:1
            },
            600:{
                items:3
            },
            1000:{
                items:3
            }
        }
    });
    });


  

  
    
    
    $(document).ready(function(){
        $('.second-slider').owlCarousel({
            loop:true,
            margin:-10,
            dots:false,
            nav:true,
            navText: ["<img src='images/r2.svg'>","<img src='images/r1.svg'>"],
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:3
                },
                1000:{
                    items:3
                }
            }
        });
        });

        $(document).ready(function(){
            $('.vahical-slider').owlCarousel({
                loop:true,
                margin:-10,
                dots:false,
                nav:true,
                navText: ["<img src='images/r2.svg'>","<img src='images/r1.svg'>"],
                responsive:{
                    0:{
                        items:1
                    },
                    600:{
                        items:3
                    },
                    1000:{
                        items:3
                    }
                }
            });
            });

        $(document).ready(function(){
            $('.userslider').owlCarousel({
                loop:true,
                margin:0,
                dots:false,
                nav:true,
                navText: ["<img src='images/r2.svg'>","<img src='images/r1.svg'>"],
                responsive:{
                    0:{
                        items:1
                    },
                    600:{
                        items:2
                    },
                    1000:{
                        items:2
                    }
                }
            });
            });
    
         

// $(document).ready(function(){
//     // if($(window).width() <= 414) {
//         $(".you-are-address").click( function(){
//             alert("Hello! I am an alert box!!");
//             $('.parent').toggleClass("left-slideheader")
//         });
//     // }
// });


