$(function () {
    let urlParams = new URLSearchParams(window.location.search),
        camera = urlParams.get('camera'),
        refresh = urlParams.get('refresh'),
        config = urlParams.get('config'),
        date = urlParams.get('data'),
        time = urlParams.get('time'),
        datepicker = $('#picker').data('datepicker'),
        fotorama = $('#fotorama').fotorama().data('fotorama'),
        refreshTimeout = 60;

    $('#refresh').prop('checked', refresh);

    if (camera !== null) {
        $('#onecam').show();
        $('#camblock').hide();
        $('h2').html(camera);
        if (date.length && time.length) {
            datepicker.selectDate(date + ' ' + time); // set now as default datetime
        } else {
            datepicker.selectDate(new Date()); // set now as default datetime
        }

        let cameraClass = new CamImg(camera, datepicker, fotorama);

        cameraClass.setConfig(config)
            .then(() => {
                cameraClass.showPictures();
                cameraClass.setRefresh(refresh); // if refresh = true set interval
            })

    } else {
        $('#onecam').hide();
        $('#camblock').show();
        putConfigHtml(config)
            .then(() => {
                setLastCamsImg();
                setInterval(setLastCamsImg, refreshTimeout * 1000);
            });

    }


    $('#show').click(function () {
        if (!datepicker.selectedDates.length) return false;
        if (camera === null) return false;
        let cameraClass = new CamImg(camera, datepicker, fotorama); //get exists with singleton

        cameraClass.showPictures();
    });

    $('#refresh').change(function () {
        refresh = $(this).prop('checked');
        let cameraClass = new CamImg(camera, datepicker, fotorama); //get exists with singleton

        cameraClass.setRefresh(refresh); // if refresh = true set interval
    })
});


function setLastCamsImg() {
    $('.camlist-item').each(function (i, item) {
        var cam = $(item).data('camera');
        if (cam.length > 3) {
            var dtnow = new Date(),
                datenow = dtnow.getFullYear() + '/' + getLeadingZeroNum(dtnow.getMonth() + 1) + '/' + getLeadingZeroNum(dtnow.getDate()),
                camurl = '/~rewm/' + cam + '/' + datenow;
            // camurl = 'http://localhost:63342/cam-img-to-video/example.html'; // FIXME: DEBUG!!
            $.get(camurl, function (data) {
                var htmlt = $.parseHTML(data);

                var aaa = $(htmlt).find("a").toArray();
                var imgg;
                while (true) {
                    imgg = aaa.pop();
                    imgg = $(imgg).attr('href');
                    if (imgg.substr(-4) === '.jpg') break;
                }
                var res = camurl + '/' + imgg;
                var dest = $('.camlist-item')[i];
                dest = $(dest).find('img')[0];
                $(dest).attr('src', res);
            });
        }
    })
}


function getLeadingZeroNum(num) {
    return parseInt(num) < 10 ? '0' + num : num;
}

function putConfigHtml(config) {
    return new Promise((resolve, reject) => {
        if (typeof config === 'undefined' || !config) config = 'config.json';
        $.get(config, function (data) {
            if (!Object.keys(data).length) return resolve();
            if (Object.keys(data.cameras).length) {
                $('#camblock .row').empty();
                $('#cammenu').empty();
                Object.keys(data.cameras).forEach(function (mac) {
                    let div = document.createElement("div");
                    div.className = 'col-xs-4 col-md-4 camlist-item';
                    div.dataset.camera = mac;
                    div.innerHTML = '<a href="index.html?camera=' + mac + '"><img src="" alt=""></a>';
                    $('#camblock .row').append(div);

                    let li = document.createElement("li");
                    li.innerHTML = '<a href="?camera=' + mac + '"><i class="fa fa-camera-retro"></i> &nbsp; ' + data.cameras[mac] + '</a></li><li role="separator" class="divider">';
                    $('#cammenu').append(li);
                });
            }
            return resolve();
        });
    });
}