$(document).ready(function() {
    var starArr = ['#1_star', '#2_star', '#3_star', '#4_star', '#5_star' ];
    var $starRatingWrapperElem = $('#star_rating');
    var clickedValue = 0;

    for(var i=0, startArrLength = starArr.length;i < startArrLength; i++) {
        (function(i) {
            $(starArr[i]).hover(
                function (e){
                    var targetData = $(this).data();
                    var starValue = +targetData.id;
                    for (var i = 0, arrLength = starValue + 1; i < arrLength; i++) {
                        $(starArr[i]).attr('src', '/images/star_on.png');
                    }

                },
                function (e){
                    var targetData = $(this).data();
                    var starValue = +targetData.id;
                    if (clickedValue < 1) {
                        for (var i = 0, arrLength = starValue + 1; i < arrLength; i++) {
                            $(starArr[i]).attr('src', '/images/star_off.png');
                        }
                    } else {
                        for (var i = clickedValue; i < starArr.length; i++) {
                            $(starArr[i]).attr('src', '/images/star_off.png');
                        }
                    }
                }
            );
            $(starArr[i]).on('click', function() {
                var targetData = $(this).data();
                var starValue = +targetData.id;

                for (var i = 0, arrLength = starArr.length; i < arrLength; i++) {
                    console.log(i);
                    $(starArr[i]).attr('src', '/images/star_on.png');
                }

                for (var i = starValue +1, arrLength = starArr.length;  i < arrLength; i++) {
                    $(starArr[i]).attr('src', '/images/star_off.png');
                }
                clickedValue = starValue + 1;
                $('#rating').val(clickedValue);
                $('#showTitle').text($(this).attr('title'));
            })
        }(i))
    }

    $('#rate').on('click', function(evt) {
        var targetArr = [
            $('#receiver'),
            $('#sender'),
            $('#review')
        ];

        var result = targetArr.map(function($elem) {
            if (!$elem.val().length && $elem.get(0).id !== 'upload') {
                $elem.siblings('span').html('<div class="alert alert-danger">'+$elem.get(0).id + ' field is empty'+'</div>');
                return false;
            }
        });
        if (result.indexOf(false) > -1) {
            return false;
        }
    })
});