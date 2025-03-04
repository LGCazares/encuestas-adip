/**
 * Apartado de configuración del arquetipo
 */

/**
 * Mostrar o no mostrar el aviso Anti-Self XSS en la consola de desarrollo
 *
 * @var boolean
 */
var __antiSelfXSSWarning = true;


/**
 * Mensaje AntiXSS
 *
 * @var string
 */
var __kXSSMessage = "Si alguien te indicó que copiaras y pegaras algo aquí para obtener acceso no autorizado a esta aplicación, se trata de un engaño. Si lo haces, esta persona podría suplantar tu identidad. Consulta https://es.wikipedia.org/wiki/Self-XSS para obtener más información.";


/**
 * Validacion de sesión
 *
 * @var boolean
 */
var __kValidateSession = true;


/**
 * Validacion de conexión
 *
 * @var boolean
 */
var __kCheckCon = false;


/**
 * Intervalo de validación de sesión en minutos
 *
 * @var int
 */
var __vInterval = 5;



/**
 * Tamaño máximo de carga de archivos (en Mbi). Predeterminado: 5
 *
 * @var int
 */
var __maxUploadFileSize = 10



/**
 * Apartado de funciones del arquetipo
 */

/**
 * Muestra un mensaje en la esquina superior derecha del viewport
 *
 * @param boolean error
 * @param String titulo
 * @param String mensaje
 * @param int tiempo
 */
window.__crearMensaje = function (error, titulo, mensaje, tiempo = 3500) {
    var clase_mensaje = error == true ? "alert-danger" : "alert-success";
    var mensaje_alert = '<div class="alertaActivacion alert msj_js ' + clase_mensaje + '">';
    mensaje_alert += '<strong id="mensaje_negritas" style="font-size:16px;">' + titulo + '</strong>';
    mensaje_alert += '<p id="mensaje" style="font-size:14px;">' + mensaje + '</p>';
    mensaje_alert += '</div>';
    $("body").append(mensaje_alert);
    $(".msj_js").show();
    setTimeout(function () {
        $(".msj_js").remove();
    }, tiempo);
}

/**
 * Valida que la sesión siga activa
 *
 */
function laSesion() {
    $.ajax({
        url: ubase + '/service/session/getSession',
        dataType: 'json',
        type: 'GET',
        success: function (data) {
            //
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
                __crearMensaje(true, "Error", "Tu sesión ha caducado");
            }
            if (jqXHR.status === 418) {
                __crearMensaje(true, "Error", data.mensaje || data.message);
            }
            $('#modal-logo').modal({
                backdrop: 'static',
                keyboard: false
            });
            clearInterval(timercito);
        }
    });
}

/**
 * Prepara para enviar CSRF token en las peticiones AJAX
 *
 */
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

/**
 * Muestra un Aviso en la consola para prevenir Self-XSS
 *
 * @see https://es.wikipedia.org/wiki/Self-XSS
 */
function antiXSS() {
    console.log("%c¡Detente!", "color: red; font-size:30px;");
    console.log("%c" + __kXSSMessage, "color: red; font-size:20px;");
}


/**
 * Valida que la conexion a Internet
 *
 */
function laConexion() {
    $.ajax({
        url: '/',
        type: 'HEAD',
        success: function (data) {
            $('#msg-nonetwork').hide('slow');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#msg-nonetwork').show('slow');
        }
    });
}


/**
 * Descarga de archivos Blob
 *
 */
const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {
        type: contentType
    });
    return blob;
}


jQuery(function () {

    if (__kValidateSession) {
        timercito = setInterval(laSesion, __vInterval * 60 * 1000);
    }

    if (__antiSelfXSSWarning) {
        antiXSS();
    }

    if (__kCheckCon) {
        laConexion();
        timercitoCon = setInterval(laConexion, 60000);
    }

    $('.tooltiptable').tooltip({
        html: true,
        trigger: 'manual'
    });

    $('.tooltiptable').on('click', function (e) {
        var revisar = $(this);
        $.each($('.tooltiptable'), function (index, value) {
            // console.log("Revisando: " + revisar.attr('id') + " tt actual: " + $(value).attr('id'));
            if ($(value).attr('id') !== revisar.attr('id')) {
                $(value).tooltip('hide');
            }
        });
        revisar.tooltip('toggle');
    });

    /**
     * Deshabilita el envío de forms con Enter
     *
     */
    $('form input').on('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    /**
     * Mandar a login si la sesión caducó
     *
     */
    $('#relogi').on('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        location.href = uForceLogin;
    });

    /**
     * Convertir a mayúsculas los campos
     *
     */
    $('.to-uppercase').on('keyup', function () {
        $(this).val($(this).val().toUpperCase());
    });


    /**
     * Aviso de tamaño máximo de archivo
     *
     */
    $('input[type="file"]').on("change", function () {
        var file = this.files[0],
            fileName = file.name,
            fileSize = file.size;
        kb = fileSize / 1024;
        __mfs = __maxUploadFileSize * 1024
        if (kb > __mfs) {
            this.value = '';
            alert(fileName + ', este archivo no será cargado porque excede el tamaño permitido de ' + __maxUploadFileSize + ' megas.');
        }
    });


    /**
     * Numeros en notacion cientifica a normal
     */
    $("input[type=number]").on("blur", function () {
        this.value = Number(this.value).toPrecision();
    });

    /**
     * Visor de archivos
     *
     */
    $('#fv-modal').on('show.bs.modal', function (event) {
        var v = $(event.relatedTarget);
        uuid = v.data('file-viewer-id');
        t = v.data('type');
        stil = (t.indexOf('pdf') > -1 || t.indexOf('plain') > -1) ? ' style="height: 100vh; min-height: 100vh; min-width:100%" ' : '';
        newURL = uViewFile + '/' + uuid;
        $('#fv-content').remove();
        $('<iframe id="fv-content" src="' + newURL + '" type="' + t + '"' + stil + '></iframe>').appendTo('#fv-modal .modal-body');
    });

});

/**
 * Valida formularios
 *
 */
(function () {
    'use strict';
    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('needs-validation');
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (form.checkValidity() === true) {
                    $('#btn-send').attr('disabled', true);
                    $('#modal-zagruzka').modal('show');
                    form.submit();
                } else {
                    $(this).find(":valid").each(function () {
                        $('#feedback-' + this.id).html('');
                    });
                    $(this).find(":invalid").each(function () {
                        if (this.validity.valueMissing) {
                            $('#feedback-' + this.id).html('Este campo es obligatorio');
                        } else if (this.validity.typeMismatch) {
                            $('#feedback-' + this.id).html('Error de tipo.');
                        } else if (this.validity.tooShort) {
                            $('#feedback-' + this.id).html('Es valor de este campo debe ser de ' + this.minlength + ' o más caracteres.');
                        } else if (this.validity.rangeOverflow) {
                            $('#feedback-' + this.id).html('Es valor de este campo debe ser un número entre ' + this.min + ' y ' + this.max);
                        } else if (this.validity.tooLong) {
                            $('#feedback-' + this.id).html('Es valor de este campo no debe pasar de ' + this.maxlength + ' caracteres.');
                        } else if (this.validity.patternMismatch) {
                            $('#feedback-' + this.id).html($(this).attr('invalid-regex'));
                        }
                    });
                    __crearMensaje(true, "Error", "Por favor revisa los campos marcados con rojo.");
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

setTimeout(function() { $('.alert-success').hide();}, 5000);
setTimeout(function() { $('.wp_error').hide();}, 5000);