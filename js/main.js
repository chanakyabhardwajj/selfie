var Base64Binary = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer : function (input) {
        var bytes = (input.length / 4) * 3;
        var ab = new ArrayBuffer(bytes);
        this.decode(input, ab);

        return ab;
    },

    decode : function (input, arrayBuffer) {
        //get last chars to see if are valid
        var lkey1 = this._keyStr.indexOf(input.charAt(input.length - 1));
        var lkey2 = this._keyStr.indexOf(input.charAt(input.length - 2));

        var bytes = (input.length / 4) * 3;
        if (lkey1 == 64) bytes--; //padding chars, so skip
        if (lkey2 == 64) bytes--; //padding chars, so skip

        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;

        if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
        else
            uarray = new Uint8Array(bytes);

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        for (i = 0; i < bytes; i += 3) {
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            uarray[i] = chr1;
            if (enc3 != 64) uarray[i + 1] = chr2;
            if (enc4 != 64) uarray[i + 2] = chr3;
        }

        return uarray;
    }
};

var video = document.querySelector('#video'),
    vidCanvas,
    cnvTitle = $("#cnvTitle"),
    cnvBox = $("#cnvBox"),
    cnvFooter = $("#cnvFooter"),
    controls = document.querySelector('#controls'),
    vidH = 480, vidW = 640,
    camanInst = null, camanCntr = 0, camanBusy = false,
    camanEffects = ["vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel", "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun", "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"],
    startbutton = document.querySelector('#startbutton'),
    resetbutton = document.querySelector('#resetbutton'),
    prevbutton = document.querySelector('#prev'),
    nextbutton = document.querySelector('#next'),
    shareBtn = $("#shareOnFB");

video.addEventListener('playing', function (ev) {
    if (video.videoHeight && video.videoWidth) {
        vidW = Math.floor(video.videoWidth / (video.videoHeight / vidH));
    }
    init();
}, false);

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({audio : false, video : true}, function (stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();

    }, function (err) {
        $("#videoRequestMsg").html("Oops! We could not get access to your webcam. Please reload to try again!")
    });
}
else {
    $("#videoRequestMsg").html("Seems like you forgot to update your browser. </br> C'mon! Do it! </br>Do it <Strong><a href='http://browsehappy.com/'>here</a></Strong> right now!!");
}

function init() {
    $("#videoRequest").fadeOut(200, function () {
        $("#selfieBox").show();
    });
}

function resizeStuff() {
    //do video canvas resizing
    //do sly resizing
    //do avgrund resizing
}

function cleanUpSelfies() {
    camanCntr = 0;

    $(resetbutton).hide();
    $(cnvFooter).hide();
    $(controls).hide();

    $(vidCanvas).hide();
    $(vidCanvas).remove();
    vidCanvas = null;

    video.play();
    $(video).show();
    $(startbutton).show();
}

function clickSelfie() {
    var id = Math.random().toString(36).replace(/[^a-z]+/g, '');
    vidCanvas = $("<canvas></canvas>").attr({"id" : id, "width" : vidW, "height" : vidH}).addClass("vidCanvas");
    cnvBox.prepend(vidCanvas);

    video.pause();
    $(video).hide();
    $(startbutton).hide();
    $(resetbutton).show();
    $(vidCanvas).css({"width" : vidW, "height" : vidH});
    $(vidCanvas).show();
    $(controls).show();
    $(cnvFooter).show();

    var cntxt = vidCanvas[0].getContext("2d");
    cntxt.drawImage(video, 0, 0, vidW, vidH);

    cnvTitle.html(camanEffects[camanCntr]);
    camanInst = Caman("#" + id, function () {
        camanBusy = true;
        this[camanEffects[camanCntr]]();
        this.render(function () {
            camanBusy = false;
        });
    });

}

function restoreShareBtn() {
    $(shareBtn.find(".fa-facebook")[0]).removeClass("hidden");
    $(shareBtn.find(".fa-spinner")[0]).addClass("hidden");
    $(shareBtn.find(".shareOnFBStatus")[0]).html("");
    shareBtn.css({"backgroundColor" : "#4c66a4"});
}

startbutton.addEventListener('click', function (ev) {
    clickSelfie();
    ev.preventDefault();
}, false);

resetbutton.addEventListener('click', function (ev) {
    cleanUpSelfies();
    ev.preventDefault();
}, false);

prevbutton.addEventListener('click', function (ev) {
    restoreShareBtn();
    if (camanInst) {
        var bool = camanCntr > 0 ? true : false;
        if (bool && !camanBusy) {
            camanBusy = true;
            cnvTitle.html(camanEffects[camanCntr - 1]);
            camanInst.revert();
            camanInst[camanEffects[--camanCntr]]();
            camanInst.render(function () {
                camanBusy = false;

                if(camanCntr==0){
                    $(prevbutton).css({"color":"rgba(200,200,200,0.5)"});
                    $(nextbutton).css({"color":"rgba(255,255,255,1)"});
                }
                else if(camanCntr>0){
                    $(prevbutton).css({"color":"rgba(255,255,255,1)"});
                    $(nextbutton).css({"color":"rgba(255,255,255,1)"});
                }
            });


        }
    }
    ev.preventDefault();
}, false);

nextbutton.addEventListener('click', function (ev) {
    restoreShareBtn();
    if (camanInst) {
        var bool = camanCntr < camanEffects.length - 1 ? true : false;
        if (bool && !camanBusy) {
            camanBusy = true;
            cnvTitle.html(camanEffects[camanCntr + 1]);
            camanInst.revert();
            camanInst[camanEffects[++camanCntr]]();
            camanInst.render(function () {
                camanBusy = false;

                if(camanCntr==camanEffects.length-1){
                    $(nextbutton).css({"color":"rgba(200,200,200,0.5)"});
                    $(prevbutton).css({"color":"rgba(255,255,255,1)"});
                }
                else if(camanCntr<camanEffects.length-1){
                    $(nextbutton).css({"color":"rgba(255,255,255,1)"});
                    $(prevbutton).css({"color":"rgba(255,255,255,1)"});
                }
            });


        }
    }
    ev.preventDefault();
}, false);

shareBtn.click(function () {
    postCanvasToFacebook(vidCanvas[0].toDataURL('image/png'));
});

$.getScript('//connect.facebook.net/en_UK/all.js', function () {
    FB.init({
        appId : '564603610295965'
    });
});

if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
    XMLHttpRequest.prototype.sendAsBinary = function (string) {
        var bytes = Array.prototype.map.call(string, function (c) {
            return c.charCodeAt(0) & 0xff;
        });
        this.send(new Uint8Array(bytes).buffer);
    };
}

function postImageToFacebook(authToken, filename, mimeType, imageData, message) {
    // this is the multipart/form-data boundary we'll use
    var boundary = '----ThisIsTheBoundary1234567890';
    // let's encode our image file, which is contained in the var
    var formData = '--' + boundary + '\r\n'
    formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
    formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
    for (var i = 0; i < imageData.length; ++i) {
        formData += String.fromCharCode(imageData[ i ] & 0xff);
    }
    formData += '\r\n';
    formData += '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
    formData += message + '\r\n'
    formData += '--' + boundary + '--\r\n';

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true);
    xhr.onload = function () {
        $(shareBtn.find(".fa-spinner")[0]).addClass("hidden");
        $(shareBtn.find(".fa-facebook")[0]).addClass("hidden");
        $(shareBtn.find(".shareOnFBStatus")[0]).html("Shared!");
        shareBtn.css({"backgroundColor" : "#00A300"});
    };

    xhr.onerror = function () {
        $(shareBtn.find(".fa-spinner")[0]).addClass("hidden");
        $(shareBtn.find(".shareOnFBStatus")[0]).html("Oops! Try again!");
        shareBtn.css({"backgroundColor" : "#E00000"});
    };
    xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
    xhr.sendAsBinary(formData);
};

function postCanvasToFacebook(data) {
    $(shareBtn.find(".fa-spinner")[0]).removeClass("hidden");
    var encodedPng = data.substring(data.indexOf(',') + 1, data.length);
    var decodedPng = Base64Binary.decode(encodedPng);
    FB.getLoginStatus(function (response) {
        if (response.status === "connected") {
            postImageToFacebook(response.authResponse.accessToken, "selfie", "image/png", decodedPng, "");
        }
        else if (response.status === "not_authorized") {
            FB.login(function (response) {
                postImageToFacebook(response.authResponse.accessToken, "selfie", "image/png", decodedPng, "");
            }, {scope : "publish_stream"});
        }
        else {
            FB.login(function (response) {
                postImageToFacebook(response.authResponse.accessToken, "selfie", "image/png", decodedPng, "");
            }, {scope : "publish_stream"});
        }
    });
};