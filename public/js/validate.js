$(document).ready(function() {
    $('#register').on('click', function(evt) {
        var targetArr = [
            $('#name'),
            $('#address'),
            $('#city'),
            $('#country'),
            $('#sector'),
            $('#website'),
            $('#upload')
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