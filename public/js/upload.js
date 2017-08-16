$(document).ready(function() {
    $('#upload_btn').on('click', function() {
        $('#upload_input').trigger('click');
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    })
    $('#upload_input').on('change', function() {
        var uploadInput = $('#upload_input');

        if (uploadInput.val() !== '') {
            var formData = new FormData();
            formData.append('upload', uploadInput[0].files[0]);
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    $('#upload_input').val('');
                },
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(e){
                        if (e.lengthComputable) {
                            var uploadPercent = e.loaded / e.total;
                            uploadPercent = (uploadPercent * 100);

                            $('.progress-bar').text(uploadPercent + '%');
                            $('.progress-bar').width(uploadPercent + '%');

                            if (uploadPercent === 100) {
                                $('.progress-bar').text('Done');
                                $('#completed').text('File Uploaded');
                            }
                        }
                    }, false);

                    return xhr;
                }
            })
        }
    })
});